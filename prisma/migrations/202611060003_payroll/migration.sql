CREATE TABLE "Payroll" (
 "id" TEXT PRIMARY KEY,
 "employeeId" TEXT NOT NULL REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "period" DATE NOT NULL CHECK (EXTRACT(DAY FROM "period") = 1),
 "base" DECIMAL(14,2) NOT NULL CHECK ("base" >= 0),
 "allowances" DECIMAL(14,2) NOT NULL CHECK ("allowances" >= 0),
 "deductions" DECIMAL(14,2) NOT NULL CHECK ("deductions" >= 0 AND "deductions" <= "base" + "allowances"),
 "status" TEXT NOT NULL CHECK ("status" IN ('Draft', 'Paid')),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 "archived" BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX "Payroll_employeeId_period_key" ON "Payroll"("employeeId", "period");
CREATE INDEX "Payroll_archived_createdAt_idx" ON "Payroll"("archived", "createdAt");
