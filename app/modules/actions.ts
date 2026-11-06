"use server";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireUser } from "../../lib/auth";
import { catalog } from "../../lib/catalog";
import { db } from "../../lib/db";
import { canWrite } from "../../lib/permissions";
import { scopeFor } from "../../lib/scopes";
import { parse, records, validateRecord, RecordError } from "../../lib/records";

export async function save(key: string, id: string | null, archive: boolean, form: FormData) {
  const user = await requireUser();
  if (key==="settings" || !Object.hasOwn(catalog, key) || !canWrite(user.role, key)) throw new Error("Access denied.");
  const path = "/modules/" + key;
  let error: string | undefined;
  try {
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(342571)`;
      const table = records(catalog[key], tx);
      const before = id ? await table.findFirst({ where: { id, archived: false, ...scopeFor(user,key) } }) : null;
      if (id && !before) throw new RecordError("This record is no longer active.");
      if (id && ["fees", "payments"].includes(key)) throw new RecordError("Posted financial records are immutable.");
      if (key === "settings" && (archive || (!id && await table.count({ where: { archived: false } }))))
        throw new RecordError("Edit the existing school settings record.");
      if (!archive && !id && key === "students" && !form.get("admissionNo")) form.set("admissionNo", "ADM-" + randomUUID());
      if (!archive && !id && key === "employees" && !form.get("employeeNo")) form.set("employeeNo", "EMP-" + randomUUID());
      if (key === "payroll" && (archive || before?.status === "Paid"))
        throw new RecordError("Payroll records are retained and paid records are locked.");
      const data = archive ? { archived: true } : parse(catalog[key], form);
      if (key==="leave" && user.role==="PRINCIPAL" && (!id || archive || before?.status!=="Pending")) throw new RecordError("Only pending requests may be reviewed.");
      if (key==="leave" && ["STUDENT","TEACHER"].includes(user.role) && before && before.status!=="Pending") throw new RecordError("Only pending requests may be changed.");
      if (archive) {
        for (const resource of Object.values(catalog)) {
          for (const field of resource.fields.filter(field=>field.target===key)) {
            if (await records(resource,tx).count({where:{[field.name+"Id"]:id,archived:false}})) throw new RecordError("Archive the linked active records first.");
          }
        }
      } else {
        if (key==="leave" && user.role==="PRINCIPAL") {
          if (!["Approved","Rejected"].includes(String(data.status))) throw new RecordError("Select Approved or Rejected.");
          for (const name of ["studentId","employeeId","starts","ends","reason"]) data[name]=before?.[name];
        }
        if (key==="leave" && ["STUDENT","TEACHER"].includes(user.role)) {
          data.studentId=user.role==="STUDENT"?user.studentId:null;
          data.employeeId=user.role==="TEACHER"?user.employeeId:null;
          data.status="Pending";
        }
        if (user.role === "TEACHER" && key !== "leave") {
          if (!user.employeeId || user.employee?.archived) throw new RecordError("An employee account link is required.");
          const teacherId=user.employeeId;
          const teaching=key==="homework"
            ? await tx.teaching.findFirst({where:{id:String(data.teachingId),teacherId,archived:false}})
            : await tx.teaching.findFirst({where:{teacherId,archived:false,section:{Enrollment_section:{some:{id:String(data.enrollmentId),archived:false}}},
                ...(key==="marks"?{subject:{ExamSubject_subject:{some:{id:String(data.paperId),archived:false}}}}:{})}});
          if (!teaching) throw new RecordError("This record is outside your teaching assignments.");
        }
        await validateRecord(tx, key, data, id ?? undefined);
      }
      const after = id ? await table.update({ where: { id }, data }) : await table.create({ data });
      await tx.auditLog.create({ data: {
        userId: user.id, resource: key, recordId: after.id, action: archive ? "archive" : id ? "update" : "create",
        before: before ? JSON.parse(JSON.stringify(before)) : Prisma.JsonNull,
        after: JSON.parse(JSON.stringify(after))
      } });
    });
  } catch (cause) {
    if (cause instanceof ZodError) error = "Review the required fields and enter valid dates and amounts.";
    else if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") error = "A record already uses this identifier, payroll month, or timetable slot.";
    else if (cause instanceof RecordError) error = cause.message;
    else error = "The record could not be saved.";
  }
  if (error) redirect(path + "?" + new URLSearchParams({ error, ...(id ? { edit: id } : { add: "1" }) }));
  revalidatePath("/");
  revalidatePath(path);
  redirect(path + "?saved=1");
}
