SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.SchoolSetting', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.SchoolSetting (
    id nvarchar(64) NOT NULL PRIMARY KEY,
    createdAt datetime2 NOT NULL,
    updatedAt datetime2 NOT NULL,
    archived bit NOT NULL,
    name nvarchar(160) NOT NULL,
    address nvarchar(400) NOT NULL,
    email nvarchar(254) NOT NULL,
    website nvarchar(255) NULL,
    currency nvarchar(3) NOT NULL,
    timezone nvarchar(80) NOT NULL
  );
END;

IF COL_LENGTH(N'dbo.SchoolSetting', N'institutionType') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD institutionType nvarchar(10) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'shortName') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD shortName nvarchar(40) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'phone') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD phone nvarchar(60) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'registrationNumber') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD registrationNumber nvarchar(80) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'headName') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD headName nvarchar(120) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'academicYear') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD academicYear nvarchar(40) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'primaryColor') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD primaryColor nvarchar(7) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'secondaryColor') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD secondaryColor nvarchar(7) NULL;
IF COL_LENGTH(N'dbo.SchoolSetting', N'logo') IS NULL
  ALTER TABLE dbo.SchoolSetting ADD logo varbinary(max) NULL;

COMMIT;
