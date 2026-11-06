# AashEdu School Management System

AashEdu School Management System is a single-school administrative application built on Next.js 16, React, strict TypeScript, Tailwind CSS, Prisma 7 and PostgreSQL. It uses database-backed sessions, server-side access controls and real records throughout.

## Local setup

Use Node.js 22.12 or newer, npm and PostgreSQL. You can run PostgreSQL with Docker Compose, or point the application at a database you already manage.

1. Run `npm ci`.
2. Copy `.env.example` to `.env`. Set `POSTGRES_PASSWORD` and the corresponding password in `DATABASE_URL`. URL-encode special characters in the connection string.
3. Run `docker compose up -d --wait postgres` if using Docker.
4. Run `npm run db:migrate`, followed by `npx prisma generate`.
5. Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` of at least 14 characters. Run `npm run db:bootstrap`, then remove the password from the environment.
6. Run `npm run dev` and open http://localhost:3000.

For a disposable local database you may run `npm run db:seed` instead of bootstrapping. It creates eight accounts with addresses such as `super_admin@demo.example`, `school_admin@demo.example`, `principal@demo.example`, `teacher@demo.example`, `accountant@demo.example`, `student@demo.example`, `parent@demo.example`, and `librarian@demo.example`. All share the development password `Campus-demo-2026!`. The seed links sample student, guardian and teacher accounts and creates an enrollment and an invoice. Link additional student, guardian, and teacher accounts under User accounts when creating them.

## Using the workspace

- Create the academic year, class, section, subject, and teaching assignment before scheduling periods. Enroll a student before recording attendance or marks.
- Configure fee categories and class fee structures, then post invoices and payments. The ledger supports discounts and partial payments. Posted invoices and payments are immutable. Record references must be unique.
- Configure an exam, its subject papers and the grading scale. Student profiles show paper-level marks, percentage, grade and pass status.
- Assign homework to a teaching assignment. Linked students can submit text, and the assigned teacher or an administrator can review it.
- Use the library catalog and loans to track copies and return dates. Set a return date by editing the loan.
- Set up vehicles and routes before assigning riders. The application checks remaining capacity when adding or moving riders.
- Export filtered modules as CSV or PDF. Open an invoice or payment row for its individual PDF. Print from a student profile or the browser print menu.

## HRMS and payroll

The HRMS navigation groups staff records, staff attendance, leave, and payroll. Administrators and accountants can record one payroll entry per employee and month. Leave base pay blank to copy the employee's recorded salary. Enter allowances and deductions manually. Net pay is base pay plus allowances minus deductions. Marking a record Paid locks it for audit. Payroll entries track payment status, with no money movement or statutory calculation.

## Access and deployment

Super administrators and school administrators operate the same school. Only a super administrator can create or disable another super administrator. Principals have academic visibility and review leave. Accountants can operate the fee ledger. Librarians can operate the catalog and loans. Teacher records are scoped by teaching assignment, and student and guardian profiles by account links.

Use a Node.js host with persistent PostgreSQL, a TLS-enabled connection, and HTTPS in front of Next.js. Use a dedicated database account and keep secrets in your hosting platform. Configure edge request limits for the sign-in route and regular database backups. For each release, build with `npm run build`, apply checked-in migrations once with `npm run db:migrate`, and start with `npm start`. Production session cookies require HTTPS. The application does not run as a static export.

Commit new schema migrations with `npx prisma migrate dev --name <name>` against an isolated development database. Existing migrations should remain unchanged after application. Configure backup retention and periodically clean up expired rows from the Session and LoginAttempt tables.

## Verification

- `npm run check` generates the Prisma client and checks TypeScript.
- `npm run build` generates the client and compiles the production application.
- `node scripts/test-db.mjs` runs a temporary in-memory PostgreSQL-compatible PGlite database on port 55432. Set `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/school` in a separate shell, apply migrations and seed, and start the app using the same connection.
- Run `node scripts/smoke.mjs` against a running app connected to a disposable seeded database. Set `SMOKE_URL` if needed. The smoke suite writes records to the database.

## Current scope

This release provides a working implementation of the administrative record workflows, with known limits. It uses one school and a fixed role matrix. Guardian links can be added at account creation for one child in the UI. It has no file uploads, spreadsheet workbook import or export, bulk attendance, automatic reminders, read receipts, or fully specialized academic and financial report suites. PDF exports use a Latin-script font and replace unsupported characters. This application still requires production security and operational acceptance testing before it is used for live student records.



## Institution Profile

Sign in as a school administrator and open **Admin settings · Institution Profile**. The profile sets the institution identity, academic year label, logo, theme, currency and time zone. PNG and JPEG uploads up to 2 MB are decoded and converted into a single PNG stored in the selected local database. The public branding and logo routes provide only the sign-in branding. The profile form uses an administrator-only server action.

The PostgreSQL migration extends the existing SchoolSetting table with nullable columns. It preserves old settings and the original timezone and currency values. If multiple active rows already exist, the oldest row is used and the others are preserved.

To store the institution profile in local Microsoft SQL Server instead, apply prisma/sqlserver/001_institution_profile.sql to the target database and configure INSTITUTION_MSSQL_URL on the server. The script creates dbo.SchoolSetting if absent or adds missing columns to a compatible existing table. Verify the base columns against the script before applying it to an existing database. Use a dedicated runtime account with SELECT, INSERT and UPDATE on dbo.SchoolSetting. Keep credentials on the Node process and use a trusted certificate for encrypted SQL Server connections. When SQL Server is selected, it is the sole source for institution branding. A switch of profile storage does not copy records automatically. Back up and copy existing settings explicitly if switching databases.

The rest of this repository, including sessions and school records, continues to require PostgreSQL. A SQL Server-only installation requires a separate application database port. This change does not provide or validate that port.

For LAN installations, run the compiled Next.js Node server locally and configure IIS as a reverse proxy. Preserve the forwarded host and HTTPS scheme for login cookies and server-action origin checks. Install dependencies and build on a connected build machine before transferring the build and runtime dependencies to an isolated server with matching OS and architecture. The running application uses local databases, locally served assets and system fonts. The logo and public branding endpoints use same-origin URLs. The existing PDF renderer uses standard Latin fonts.

Before rollout, verify settings save, sign-in and sign-out, PNG and JPEG upload, PDF output, and isolation between two databases on a Windows Server/IIS staging installation.
