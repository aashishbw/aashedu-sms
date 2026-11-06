import type { Role } from "@prisma/client";
export type AccessUser = {id:string;role:Role;employeeId:string|null;studentId:string|null;children:{studentId:string}[];employee:{archived:boolean;Teaching_teacher:{sectionId:string;subjectId:string}[]}|null};
export function studentIds(user:AccessUser) {
  return user.role === "STUDENT" && user.studentId ? [user.studentId] : user.role === "PARENT" ? user.children.map(link=>link.studentId) : [];
}
export function scopeFor(user:AccessUser,key:string): Record<string,unknown> {
  if (key === "communication" && !["SUPER_ADMIN","SCHOOL_ADMIN"].includes(user.role)) {
    const ids=studentIds(user);
    return {OR:[{sectionId:null},...((user.role === "TEACHER" && user.employeeId) ? [{section:{Teaching_section:{some:{teacherId:user.employeeId,archived:false}}}}] : []),
      ...(ids.length ? [{section:{Enrollment_section:{some:{studentId:{in:ids},archived:false}}}}] : [])]};
  }
  if (key === "leave" && user.role === "STUDENT") return {studentId:user.studentId ?? ""};
  if (key === "leave" && user.role === "TEACHER") return {employeeId:user.employeeId ?? ""};
  if (user.role === "TEACHER") {
    const teacherId=user.employee && !user.employee.archived ? user.employeeId ?? "" : "";
    if (key==="teaching" || key==="timetable") return {teacherId};
    if (key==="homework") return {teaching:{teacherId,archived:false}};
    const enrollment={archived:false,section:{Teaching_section:{some:{teacherId,archived:false}}}};
    if (key==="enrollments") return enrollment;
    if (key==="attendance") return {enrollment};
    if (key==="marks") return {OR:(teacherId ? user.employee!.Teaching_teacher : []).map(assignment=>({enrollment:{archived:false,sectionId:assignment.sectionId},paper:{subjectId:assignment.subjectId}}))};
  }
  if (["STUDENT","PARENT"].includes(user.role)) {
    const ids=studentIds(user);
    if (key==="students") return {id:{in:ids}};
    if (key==="timetable" || key==="homework") {
      const section={Enrollment_section:{some:{studentId:{in:ids},archived:false}}};
      return key==="timetable" ? {section} : {teaching:{section,archived:false}};
    }
  }
  return {};
}
