"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser, sessionCookie } from "../lib/auth";
import { db } from "../lib/db";
import { hash, verify } from "../lib/password.cjs";

export async function changePassword(_state: string, form: FormData): Promise<string> {
  const user = await currentUser();
  if (!user) redirect("/login");

  const current = form.get("current");
  const next = form.get("next");
  if (typeof current !== "string" || !current || current.length > 256) return "Enter your current password.";
  if (typeof next !== "string" || next.length < 14 || next.length > 256) return "Use 14–256 characters for the new password.";
  if (next !== form.get("confirm")) return "The new passwords do not match.";
  if (next === current) return "Choose a password different from your current one.";

  const account = await db.user.findUnique({where:{id:user.id},select:{password:true,disabled:true}});
  if (!account || account.disabled || !verify(current,account.password)) return "The current password is incorrect.";

  const changed = await db.$transaction(async tx => {
    const result = await tx.user.updateMany({
      where:{id:user.id,password:account.password,disabled:false}, data:{password:hash(next)}
    });
    if (result.count !== 1) return false;
    await tx.session.deleteMany({where:{userId:user.id}});
    return true;
  });
  if (!changed) return "The account changed. Sign in again before retrying.";

  (await cookies()).delete(sessionCookie);
  redirect("/login?changed=1");
}

