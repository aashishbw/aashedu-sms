CREATE TABLE "InstitutionRegistration" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('School', 'College')),
  "registrationNumber" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "loginUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InstitutionRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InstitutionRegistration_registrationNumber_key"
  ON "InstitutionRegistration"("registrationNumber");
