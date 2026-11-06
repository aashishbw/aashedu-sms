-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STUDENT', 'PARENT', 'LIBRARIAN');

-- CreateTable
CREATE TABLE "User" (
    "employeeId" TEXT,
    "studentId" TEXT,
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "email" TEXT,
    "guardianName" TEXT,
    "emergencyPhone" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "email" TEXT,
    "qualification" TEXT,
    "joined" DATE NOT NULL,
    "salary" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "starts" DATE NOT NULL,
    "ends" DATE NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "yearId" TEXT NOT NULL,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teaching" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Teaching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "teachingId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "room" TEXT NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,

    CONSTRAINT "FeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL,
    "due" DATE NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "day" DATE NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "fullMarks" INTEGER NOT NULL,
    "passMarks" INTEGER NOT NULL,

    CONSTRAINT "ExamSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "paperId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "minimum" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "teachingId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due" DATE NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isbn" TEXT,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "copies" INTEGER NOT NULL,
    "fine" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT,
    "employeeId" TEXT,
    "due" DATE NOT NULL,
    "returned" DATE,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "registration" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "dropoff" TEXT NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "routeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "studentId" TEXT,
    "employeeId" TEXT,
    "starts" DATE NOT NULL,
    "ends" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolSetting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "SchoolSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianLink" (
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "GuardianLink_pkey" PRIMARY KEY ("userId","studentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_expiresAt_idx" ON "LoginAttempt"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_resource_recordId_createdAt_idx" ON "AuditLog"("resource", "recordId", "createdAt");

-- CreateIndex
CREATE INDEX "Student_archived_createdAt_idx" ON "Student"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");

-- CreateIndex
CREATE INDEX "Employee_archived_createdAt_idx" ON "Employee"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");

-- CreateIndex
CREATE INDEX "AcademicYear_archived_createdAt_idx" ON "AcademicYear"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "AcademicYear"("name");

-- CreateIndex
CREATE INDEX "SchoolClass_yearId_idx" ON "SchoolClass"("yearId");

-- CreateIndex
CREATE INDEX "SchoolClass_archived_createdAt_idx" ON "SchoolClass"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_name_yearId_key" ON "SchoolClass"("name", "yearId");

-- CreateIndex
CREATE INDEX "Section_classroomId_idx" ON "Section"("classroomId");

-- CreateIndex
CREATE INDEX "Section_teacherId_idx" ON "Section"("teacherId");

-- CreateIndex
CREATE INDEX "Section_archived_createdAt_idx" ON "Section"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_classroomId_key" ON "Section"("name", "classroomId");

-- CreateIndex
CREATE INDEX "Subject_archived_createdAt_idx" ON "Subject"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Teaching_sectionId_idx" ON "Teaching"("sectionId");

-- CreateIndex
CREATE INDEX "Teaching_subjectId_idx" ON "Teaching"("subjectId");

-- CreateIndex
CREATE INDEX "Teaching_teacherId_idx" ON "Teaching"("teacherId");

-- CreateIndex
CREATE INDEX "Teaching_archived_createdAt_idx" ON "Teaching"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Teaching_sectionId_subjectId_key" ON "Teaching"("sectionId", "subjectId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_sectionId_idx" ON "Enrollment"("sectionId");

-- CreateIndex
CREATE INDEX "Enrollment_archived_createdAt_idx" ON "Enrollment"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_sectionId_key" ON "Enrollment"("studentId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_sectionId_rollNo_key" ON "Enrollment"("sectionId", "rollNo");

-- CreateIndex
CREATE INDEX "Period_teachingId_idx" ON "Period"("teachingId");

-- CreateIndex
CREATE INDEX "Period_sectionId_idx" ON "Period"("sectionId");

-- CreateIndex
CREATE INDEX "Period_teacherId_idx" ON "Period"("teacherId");

-- CreateIndex
CREATE INDEX "Period_archived_createdAt_idx" ON "Period"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Period_sectionId_weekday_slot_key" ON "Period"("sectionId", "weekday", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Period_teacherId_weekday_slot_key" ON "Period"("teacherId", "weekday", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Period_room_weekday_slot_key" ON "Period"("room", "weekday", "slot");

-- CreateIndex
CREATE INDEX "Attendance_enrollmentId_idx" ON "Attendance"("enrollmentId");

-- CreateIndex
CREATE INDEX "Attendance_archived_createdAt_idx" ON "Attendance"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_enrollmentId_day_key" ON "Attendance"("enrollmentId", "day");

-- CreateIndex
CREATE INDEX "StaffAttendance_employeeId_idx" ON "StaffAttendance"("employeeId");

-- CreateIndex
CREATE INDEX "StaffAttendance_archived_createdAt_idx" ON "StaffAttendance"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_employeeId_day_key" ON "StaffAttendance"("employeeId", "day");

-- CreateIndex
CREATE INDEX "FeeCategory_archived_createdAt_idx" ON "FeeCategory"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeeCategory_name_key" ON "FeeCategory"("name");

-- CreateIndex
CREATE INDEX "FeeStructure_categoryId_idx" ON "FeeStructure"("categoryId");

-- CreateIndex
CREATE INDEX "FeeStructure_classroomId_idx" ON "FeeStructure"("classroomId");

-- CreateIndex
CREATE INDEX "FeeStructure_archived_createdAt_idx" ON "FeeStructure"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_categoryId_classroomId_key" ON "FeeStructure"("categoryId", "classroomId");

-- CreateIndex
CREATE INDEX "Invoice_studentId_idx" ON "Invoice"("studentId");

-- CreateIndex
CREATE INDEX "Invoice_structureId_idx" ON "Invoice"("structureId");

-- CreateIndex
CREATE INDEX "Invoice_archived_createdAt_idx" ON "Invoice"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_reference_key" ON "Invoice"("reference");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_archived_createdAt_idx" ON "Payment"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Exam_classroomId_idx" ON "Exam"("classroomId");

-- CreateIndex
CREATE INDEX "Exam_archived_createdAt_idx" ON "Exam"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_name_classroomId_key" ON "Exam"("name", "classroomId");

-- CreateIndex
CREATE INDEX "ExamSubject_examId_idx" ON "ExamSubject"("examId");

-- CreateIndex
CREATE INDEX "ExamSubject_subjectId_idx" ON "ExamSubject"("subjectId");

-- CreateIndex
CREATE INDEX "ExamSubject_archived_createdAt_idx" ON "ExamSubject"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubject_examId_subjectId_key" ON "ExamSubject"("examId", "subjectId");

-- CreateIndex
CREATE INDEX "Mark_paperId_idx" ON "Mark"("paperId");

-- CreateIndex
CREATE INDEX "Mark_enrollmentId_idx" ON "Mark"("enrollmentId");

-- CreateIndex
CREATE INDEX "Mark_archived_createdAt_idx" ON "Mark"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_paperId_enrollmentId_key" ON "Mark"("paperId", "enrollmentId");

-- CreateIndex
CREATE INDEX "Grade_archived_createdAt_idx" ON "Grade"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_minimum_key" ON "Grade"("minimum");

-- CreateIndex
CREATE INDEX "Assignment_teachingId_idx" ON "Assignment"("teachingId");

-- CreateIndex
CREATE INDEX "Assignment_archived_createdAt_idx" ON "Assignment"("archived", "createdAt");

-- CreateIndex
CREATE INDEX "Book_archived_createdAt_idx" ON "Book"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Book_code_key" ON "Book"("code");

-- CreateIndex
CREATE INDEX "Loan_bookId_idx" ON "Loan"("bookId");

-- CreateIndex
CREATE INDEX "Loan_studentId_idx" ON "Loan"("studentId");

-- CreateIndex
CREATE INDEX "Loan_employeeId_idx" ON "Loan"("employeeId");

-- CreateIndex
CREATE INDEX "Loan_archived_createdAt_idx" ON "Loan"("archived", "createdAt");

-- CreateIndex
CREATE INDEX "Vehicle_archived_createdAt_idx" ON "Vehicle"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registration_key" ON "Vehicle"("registration");

-- CreateIndex
CREATE INDEX "Route_vehicleId_idx" ON "Route"("vehicleId");

-- CreateIndex
CREATE INDEX "Route_archived_createdAt_idx" ON "Route"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_key" ON "Route"("name");

-- CreateIndex
CREATE INDEX "Rider_routeId_idx" ON "Rider"("routeId");

-- CreateIndex
CREATE INDEX "Rider_studentId_idx" ON "Rider"("studentId");

-- CreateIndex
CREATE INDEX "Rider_archived_createdAt_idx" ON "Rider"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_studentId_key" ON "Rider"("studentId");

-- CreateIndex
CREATE INDEX "Announcement_sectionId_idx" ON "Announcement"("sectionId");

-- CreateIndex
CREATE INDEX "Announcement_archived_createdAt_idx" ON "Announcement"("archived", "createdAt");

-- CreateIndex
CREATE INDEX "LeaveRequest_studentId_idx" ON "LeaveRequest"("studentId");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_archived_createdAt_idx" ON "LeaveRequest"("archived", "createdAt");

-- CreateIndex
CREATE INDEX "SchoolSetting_archived_createdAt_idx" ON "SchoolSetting"("archived", "createdAt");

-- CreateIndex
CREATE INDEX "GuardianLink_studentId_idx" ON "GuardianLink"("studentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teaching" ADD CONSTRAINT "Teaching_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teaching" ADD CONSTRAINT "Teaching_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teaching" ADD CONSTRAINT "Teaching_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_teachingId_fkey" FOREIGN KEY ("teachingId") REFERENCES "Teaching"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "FeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ExamSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teachingId_fkey" FOREIGN KEY ("teachingId") REFERENCES "Teaching"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianLink" ADD CONSTRAINT "GuardianLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianLink" ADD CONSTRAINT "GuardianLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
