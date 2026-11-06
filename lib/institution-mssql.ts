import sql from "mssql";
import { randomUUID } from "node:crypto";
import type { InstitutionForm, InstitutionProfile } from "./institution-profile";

let pool: Promise<sql.ConnectionPool> | undefined;
function connection() {
  const url=process.env.INSTITUTION_MSSQL_URL;
  if (!url) throw new Error("Institution SQL Server connection is missing.");
  return pool ??= new sql.ConnectionPool(url).connect().catch(error => {
    pool=undefined;
    throw error;
  });
}

export async function readSqlInstitution() {
  const db=await connection();
  const result=await db.request().query<InstitutionProfile>(`
    SELECT TOP (1) name, institutionType, shortName, address, phone, email, website,
      registrationNumber, headName, academicYear, primaryColor, secondaryColor, currency, timezone,
      CAST(CASE WHEN logo IS NULL THEN 0 ELSE 1 END AS bit) AS hasLogo
    FROM dbo.SchoolSetting WHERE archived=0 ORDER BY createdAt, id`);
  return result.recordset[0] ?? null;
}

export async function readSqlLogo() {
  const db=await connection();
  const result=await db.request().query<{logo:Buffer|null}>(`
    SELECT TOP (1) logo FROM dbo.SchoolSetting WHERE archived=0 ORDER BY createdAt, id`);
  return result.recordset[0]?.logo ?? null;
}

export async function saveSqlInstitution(data: InstitutionForm, logo: Buffer | null | undefined) {
  const db=await connection();
  const transaction=new sql.Transaction(db);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const lock=await transaction.request().query<{result:number}>(`
      DECLARE @result int;
      EXEC @result=sp_getapplock @Resource=N'AashEduInstitutionProfile',
        @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=5000;
      SELECT @result AS result;`);
    if (lock.recordset[0].result < 0) throw new Error("Institution settings are busy.");
    const request=transaction.request()
      .input("id",sql.NVarChar(64),randomUUID())
      .input("replaceLogo",sql.Bit,logo !== undefined)
      .input("logo",sql.VarBinary(sql.MAX),logo ?? null);
    for (const [key,value] of Object.entries(data)) request.input(key,sql.NVarChar(400),value);
    await request.query(`
      DECLARE @activeId nvarchar(64);
      SELECT TOP (1) @activeId=id FROM dbo.SchoolSetting WHERE archived=0 ORDER BY createdAt, id;
      IF @activeId IS NULL
        INSERT INTO dbo.SchoolSetting (id,name,institutionType,shortName,address,phone,email,website,
          registrationNumber,headName,academicYear,primaryColor,secondaryColor,currency,timezone,logo,createdAt,updatedAt,archived)
        VALUES (@id,@name,@institutionType,@shortName,@address,@phone,@email,@website,
          @registrationNumber,@headName,@academicYear,@primaryColor,@secondaryColor,@currency,@timezone,@logo,SYSUTCDATETIME(),SYSUTCDATETIME(),0);
      ELSE
        UPDATE dbo.SchoolSetting SET name=@name,institutionType=@institutionType,shortName=@shortName,
          address=@address,phone=@phone,email=@email,website=@website,registrationNumber=@registrationNumber,
          headName=@headName,academicYear=@academicYear,primaryColor=@primaryColor,secondaryColor=@secondaryColor,
          currency=@currency,timezone=@timezone,logo=CASE WHEN @replaceLogo=1 THEN @logo ELSE logo END,
          updatedAt=SYSUTCDATETIME() WHERE id=@activeId;`);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback().catch(() => {});
    throw error;
  }
}

