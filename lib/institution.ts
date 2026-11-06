import { cache } from "react";
import { db } from "./db";
import { readSqlInstitution, readSqlLogo, saveSqlInstitution } from "./institution-mssql";
import { defaultName, themeColor, type InstitutionForm, type InstitutionProfile } from "./institution-profile";

const useSqlServer = () => Boolean(process.env.INSTITUTION_MSSQL_URL);
const where = {archived:false};
const orderBy = [{createdAt:"asc"},{id:"asc"}] as const;

export const readInstitution = cache(async (): Promise<InstitutionProfile | null> => {
  if (useSqlServer()) return readSqlInstitution();
  const row=await db.schoolSetting.findFirst({
    where, orderBy:[...orderBy], select:{
      name:true, institutionType:true, shortName:true, address:true, phone:true, email:true, website:true,
      registrationNumber:true, headName:true, academicYear:true, primaryColor:true, secondaryColor:true,
      currency:true, timezone:true, logo:true
    }
  });
  if (!row) return null;
  const {logo,institutionType,...profile}=row;
  return {...profile,institutionType:institutionType==="School" || institutionType==="College" ? institutionType : null,hasLogo:logo!==null};
});

export async function readLogo() {
  if (useSqlServer()) return readSqlLogo();
  return (await db.schoolSetting.findFirst({where,orderBy:[...orderBy],select:{logo:true}}))?.logo ?? null;
}

export const publicBranding = cache(async () => {
  const profile=await readInstitution();
  const color=(value:string|null|undefined) => themeColor.safeParse(value).data ?? null;
  return {
    name:profile?.name?.trim() || defaultName,
    configured:Boolean(profile?.name?.trim()),
    logoUrl:profile?.hasLogo ? "/api/institution/logo" : null,
    primaryColor:color(profile?.primaryColor),
    secondaryColor:color(profile?.secondaryColor)
  };
});

export async function saveInstitution(data:InstitutionForm, logo:Buffer|null|undefined) {
  if (useSqlServer()) return saveSqlInstitution(data,logo);
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(342571)`;
    const existing=await tx.schoolSetting.findFirst({where,orderBy:[...orderBy],select:{id:true}});
    const values={...data,...(logo===undefined ? {} : {logo:logo===null ? null : new Uint8Array(logo)})};
    if (existing) await tx.schoolSetting.update({where:{id:existing.id},data:values});
    else await tx.schoolSetting.create({data:values});
  });
}

