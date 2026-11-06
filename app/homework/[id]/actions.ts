"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { isAdmin } from "../../../lib/permissions";

export async function submitAssignment(id:string,form:FormData) {
  const user=await requireUser();
  if (user.role!=="STUDENT" || !user.studentId) throw new Error("Access denied.");
  const studentId=user.studentId;
  const path="/homework/"+id;
  const body=z.string().trim().min(1).max(10000).safeParse(form.get("body"));
  if(!body.success) redirect(path+"?error=invalid");
  const result=await db.$transaction(async tx=>{
    const assignment=await tx.assignment.findFirst({where:{id,archived:false,teaching:{archived:false,section:{Enrollment_section:{some:{studentId,archived:false}}}}}});
    if(!assignment || Date.now()>=assignment.due.getTime()+86_400_000) return false;
    const existing=await tx.submission.findUnique({where:{assignmentId_studentId:{assignmentId:id,studentId}}});
    if(existing?.score!=null) return false;
    if(existing) {
      const changed=await tx.submission.updateMany({where:{id:existing.id,score:null},data:{body:body.data}});
      return changed.count===1;
    }
    await tx.submission.create({data:{assignmentId:id,studentId,body:body.data}});
    return true;
  }).catch(()=>false);
  redirect(path+(result?"?saved=1":"?error=closed"));
}
export async function reviewSubmission(id:string,submissionId:string,form:FormData) {
  const user=await requireUser();
  if(!isAdmin(user.role) && (user.role!=="TEACHER" || !user.employeeId)) throw new Error("Access denied.");
  const path="/homework/"+id;
  const input=z.object({score:z.string().regex(/^(100|[0-9]{1,2})$/).transform(Number),feedback:z.string().trim().min(1).max(4000)}).safeParse({
    score:form.get("score"),feedback:form.get("feedback")
  });
  if(!input.success) redirect(path+"?error=invalid");
  const count=await db.submission.updateMany({where:{id:submissionId,assignmentId:id,assignment:{archived:false,
    ...(isAdmin(user.role)?{}:{teaching:{teacherId:user.employeeId ?? "",archived:false}})}},data:input.data});
  if(!count.count) throw new Error("Access denied.");
  redirect(path+"?saved=1");
}
