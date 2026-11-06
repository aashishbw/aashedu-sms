import type { Role } from "@prisma/client";
export const isAdmin = (role: Role) => role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN";
const finance = ["fee-categories", "fee-structures", "fees", "payments", "payroll"];
const library = ["books", "loans"];
export function canRead(role: Role, key: string) {
  if (isAdmin(role)) return true;
  if (role === "ACCOUNTANT") return [...finance, "students", "classes"].includes(key);
  if (role === "LIBRARIAN") return [...library, "students"].includes(key);
  if (role === "PRINCIPAL") return ["years", "classes", "sections", "subjects", "attendance", "exams", "exam-subjects", "marks", "grading", "timetable", "homework", "communication"].includes(key);
  if (role === "TEACHER") return ["teaching","timetable","homework","attendance","marks","communication","leave"].includes(key);
  if (role === "STUDENT" || role === "PARENT") return ["students","timetable","homework","communication",...(role==="STUDENT"?["leave"]:[])].includes(key);
  return key === "communication";
}
export function canWrite(role: Role, key: string) {
  return isAdmin(role) || (role === "ACCOUNTANT" && finance.includes(key))
    || (role === "LIBRARIAN" && library.includes(key))
    || (role === "TEACHER" && ["attendance","marks","homework","leave"].includes(key))
    || (["STUDENT","PRINCIPAL"].includes(role) && key === "leave");
}
export function listFields(role: Role, key: string) {
  return !isAdmin(role) && key === "students" ? ["name", "admissionNo", "status"] : undefined;
}
