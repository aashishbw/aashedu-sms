"use server";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "../../lib/auth";
import { db } from "../../lib/db";
import { isAdmin } from "../../lib/permissions";
import { hash } from "../../lib/password.cjs";
export async function addUser(form:FormData) {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("Access denied.");
  const input = z.object({name:z.string().trim().min(1).max(120),email:z.email().max(254),role:z.enum(Role),password:z.string().min(14).max(256)}).safeParse({
    name:form.get("name"),email:String(form.get("email") ?? "").trim().toLowerCase(),role:form.get("role"),password:form.get("password")
  });
  if (!input.success || (input.data.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN")) redirect("/users?error=invalid");
  const {password,...profile}=input.data;
  try {
    await db.$transaction(async tx => {
      const studentId=String(form.get("studentId") ?? "") || null;
      const employeeId=String(form.get("employeeId") ?? "") || null;
      if (studentId && !["STUDENT","PARENT"].includes(profile.role)) throw new Error("Invalid student link.");
      if (employeeId && profile.role !== "TEACHER") throw new Error("Invalid teacher link.");
      const added = await tx.user.create({data:{...profile,password:hash(password),employeeId,studentId:profile.role==="STUDENT"?studentId:null}});
      if (studentId && profile.role==="PARENT") await tx.guardianLink.create({data:{userId:added.id,studentId}});
      await tx.auditLog.create({data:{userId:user.id,resource:"users",recordId:added.id,action:"create"}});
    });
  } catch {redirect("/users?error=save");}
  redirect("/users?saved=1");
}
export async function toggleUser(id:string) {
  const user = await requireUser();
  if (!isAdmin(user.role) || id === user.id) throw new Error("Access denied.");
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(342571)`;
    const target = await tx.user.findUniqueOrThrow({where:{id}});
    if (target.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") throw new Error("Access denied.");
    await tx.user.update({where:{id},data:{disabled:!target.disabled}});
    await tx.session.deleteMany({where:{userId:id}});
    await tx.auditLog.create({data:{userId:user.id,resource:"users",recordId:id,action:target.disabled?"enable":"disable"}});
  });
  redirect("/users?saved=1");
}
