import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
export const sessionCookie = "school_session";
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { id: digest(token) }, select: {
    expiresAt: true, user: { select: { id: true, name: true, role: true, disabled: true, employeeId: true, studentId: true, children: { select: { studentId: true } }, employee: { select: { archived:true, Teaching_teacher: { where: { archived:false }, select:{ sectionId:true, subjectId:true } } } } } }
  } });
  return session && session.expiresAt > new Date() && !session.user.disabled ? session.user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
