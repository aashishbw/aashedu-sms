"use server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../../lib/db";
import { digest, sessionCookie } from "../../lib/auth";
import { verify } from "../../lib/password.cjs";

export async function login(form: FormData) {
  const input = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) }).safeParse({
    email: String(form.get("email") ?? "").trim().toLowerCase(), password: form.get("password")
  });
  if (!input.success) redirect("/login?error=invalid");
  const { email, password } = input.data;
  const now = new Date();
  const window = new Date(now.getTime() + 15 * 60_000);
  const [attempt] = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "LoginAttempt" ("id", "count", "expiresAt") VALUES (${digest(email)}, 1, ${window})
    ON CONFLICT ("id") DO UPDATE SET "count" = CASE WHEN "LoginAttempt"."expiresAt" <= ${now}
      THEN 1 ELSE LEAST("LoginAttempt"."count", 6) + 1 END,
      "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" <= ${now}
      THEN ${window} ELSE "LoginAttempt"."expiresAt" END
    RETURNING "count"`;
  if (attempt.count > 6) redirect("/login?error=limited");
  const user = await db.user.findUnique({ where: { email } });
  const valid = verify(password, user?.password ?? "00000000000000000000000000000000:" + "0".repeat(128));
  if (!valid || !user || user.disabled) redirect("/login?error=invalid");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + 8 * 3_600_000);
  const jar = await cookies();
  const previous = jar.get(sessionCookie)?.value;
  await db.$transaction([
    db.loginAttempt.deleteMany({ where: { id: digest(email) } }),
    db.session.deleteMany({ where: previous ? { id: digest(previous) } : { id: "" } }),
    db.session.create({ data: { id: digest(token), userId: user.id, expiresAt } })
  ]);
  jar.set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
  jar.delete(sessionCookie);
  redirect("/login");
}
