import { Prisma } from "@prisma/client";
import { z } from "zod";
import { catalog, fieldKey, type Resource } from "./catalog";
import { db } from "./db";

export class RecordError extends Error {}
export type Row = Record<string, unknown> & { id: string };
type Delegate = {
  findMany(args: object): Promise<Row[]>;
  findFirst(args: object): Promise<Row | null>;
  count(args: object): Promise<number>;
  create(args: object): Promise<Row>;
  update(args: object): Promise<Row>;
};
export function records(resource: Resource, client: Prisma.TransactionClient = db) {
  return (client as unknown as Record<string, Delegate>)[resource.model];
}
export const choices: Record<string, string[]> = {
  payroll: ["Draft", "Paid"],
  students: ["Active", "Inactive", "Graduated", "Transferred"],
  attendance: ["Present", "Absent", "Late", "Leave"],
  "staff-attendance": ["Present", "Absent", "Late", "Leave"],
  leave: ["Pending", "Approved", "Rejected"],
};
export function parse(resource: Resource, form: FormData) {
  return Object.fromEntries(resource.fields.map(field => {
    const key = fieldKey(field);
    const input = String(form.get(key) ?? "").trim();
    if (!input && field.optional) return [key, null];
    if (field.type === "int") return [key, z.string().regex(/^\d{1,8}$/).transform(Number).parse(input)];
    if (field.type === "money") return [key, z.string().regex(/^\d{1,12}(\.\d{1,2})?$/).parse(input)];
    if (field.type === "date") return [key, new Date(z.iso.date().parse(input) + "T00:00:00.000Z")];
    if (field.name === "email") return [key, z.email().max(254).parse(input)];
    return [key, z.string().min(1).max(4000).parse(input)];
  }));
}
export function display(value: unknown) {
  if (value == null) return "—";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}
export const recordName = (row: Row) => display(row.name ?? row.title ?? row.reference ?? row.registration ?? row.rollNo ?? row.id);

export async function validateRecord(tx: Prisma.TransactionClient, key: string, data: Record<string, unknown>, id?: string) {
  const linked: Record<string, Row> = {};
  for (const field of catalog[key].fields) {
    const value = data[fieldKey(field)];
    if (!field.target || value == null) continue;
    const found = await records(catalog[field.target], tx).findFirst({ where: { id: value, archived: false } });
    if (!found) throw new RecordError("Select an active linked record.");
    linked[field.name] = found;
  }
  if (choices[key] && !choices[key].includes(String(data.status))) throw new RecordError("Choose a valid status.");
  if (data.starts instanceof Date && data.ends instanceof Date && data.starts > data.ends)
    throw new RecordError("End date must be on or after the start date.");
  if (["sections", "vehicles"].includes(key) && Number(data.capacity) < 1) throw new RecordError("Capacity must be positive.");
  if (key === "enrollments") {
    const occupied = await tx.enrollment.count({ where: { sectionId: linked.section.id, archived: false, id: { not: id } } });
    if (occupied >= Number(linked.section.capacity)) throw new RecordError("This section is full.");
  }
  if (key === "timetable" && (linked.teaching.teacherId !== linked.teacher.id || linked.teaching.sectionId !== linked.section.id || Number(data.weekday) < 1 || Number(data.weekday) > 7 || Number(data.slot) < 1))
    throw new RecordError("Use the teaching assignment's section and teacher, a weekday from 1 to 7, and a positive period.");
  if (key === "exam-subjects" && (Number(data.fullMarks) < 1 || Number(data.passMarks) > Number(data.fullMarks)))
    throw new RecordError("Pass marks cannot exceed positive full marks.");
  if (key === "marks") {
    const exam = await tx.exam.findUniqueOrThrow({ where: { id: String(linked.paper.examId) } });
    const section = await tx.section.findUniqueOrThrow({ where: { id: String(linked.enrollment.sectionId) } });
    if (section.classroomId !== exam.classroomId || Number(data.score) > Number(linked.paper.fullMarks))
      throw new RecordError("The student must belong to the exam class and the score must fit the mark range.");
  }
  if (key === "payroll") {
    (data.period as Date).setUTCDate(1);
    const base = new Prisma.Decimal(String(data.base ?? linked.employee.salary));
    const gross = base.plus(String(data.allowances));
    if (gross.gt("999999999999.99") || gross.lt(String(data.deductions)))
      throw new RecordError("Gross pay must fit the supported amount and cover deductions.");
    data.base = base;
  }
  if (key === "settings") {
    if (!/^[A-Z]{3}$/.test(String(data.currency))) throw new RecordError("Enter a three-letter currency code.");
    try { new Intl.DateTimeFormat("en",{timeZone:String(data.timezone)}); } catch { throw new RecordError("Enter a valid IANA timezone."); }
  }
  if (key === "grading" && Number(data.minimum) > 100) throw new RecordError("Minimum must be from 0 to 100.");
  if (key === "fees") {
    const total = new Prisma.Decimal(String(data.amount));
    if (total.lte(0) || total.lt(String(data.discount))) throw new RecordError("Enter a positive invoice amount and a discount no greater than the amount.");
    const enrollment = await tx.enrollment.findFirst({ where: {
      studentId: linked.student.id, archived: false, section: { classroomId: String(linked.structure.classroomId), archived: false }
    } });
    if (!enrollment) throw new RecordError("The student must be enrolled in the fee structure's class.");
  }
  if (key === "payments") {
    const paid = await tx.payment.aggregate({ where: { invoiceId: linked.invoice.id }, _sum: { amount: true } });
    const amount = new Prisma.Decimal(String(data.amount));
    const remaining = new Prisma.Decimal(String(linked.invoice.amount)).minus(String(linked.invoice.discount)).minus(paid._sum.amount ?? 0);
    if (amount.lte(0) || amount.gt(remaining)) throw new RecordError("Payment must be positive and cannot exceed the balance.");
  }
  if (key === "loans" || key === "leave") {
    if (Boolean(linked.student) === Boolean(linked.employee)) throw new RecordError("Select one student or one employee.");
  }
  if (key === "loans" && !data.returned) {
    const active = await tx.loan.count({ where: { bookId: linked.book.id, archived: false, returned: null, id: { not: id } } });
    if (active >= Number(linked.book.copies)) throw new RecordError("No copy is available for issue.");
  }
  if (key === "riders") {
    const occupied = await tx.rider.count({ where: { archived: false, id: { not: id }, route: { vehicleId: String(linked.route.vehicleId) } } });
    const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id: String(linked.route.vehicleId) } });
    if (occupied >= vehicle.capacity) throw new RecordError("The vehicle is full.");
  }
}
