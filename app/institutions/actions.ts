"use server";

import { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "../../lib/auth";
import { db } from "../../lib/db";

const registry = "/institutions";
const registration = z.object({
  name: z.string().trim().min(1).max(160),
  type: z.enum(["School", "College"]),
  registrationNumber: z.string().trim().min(1).max(80).transform(value => value.toUpperCase()),
  contactEmail: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  loginUrl: z.union([z.literal(""), z.url({protocol:/^https?$/}).max(512)])
});

export async function registerInstitution(id: string | null, form: FormData) {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") notFound();

  const input = registration.safeParse(Object.fromEntries(
    Object.keys(registration.shape).map(field => [field, form.get(field)])
  ));
  if (!input.success) redirect(registry + "?error=invalid");

  const {loginUrl, ...details} = input.data;
  try {
    await db.$transaction(async tx => {
      const data = {...details, loginUrl:loginUrl || null};
      const entry = id
        ? await tx.institutionRegistration.update({where:{id},data})
        : await tx.institutionRegistration.create({data});
      await tx.auditLog.create({data:{
        userId:user.id, resource:"institution-registration", recordId:entry.id, action:id ? "update" : "create"
      }});
    });
  } catch (error) {
    const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    redirect(registry + (duplicate ? "?error=duplicate" : "?error=save"));
  }
  redirect(registry + (id ? "?saved=updated" : "?saved=1"));
}

