import { formatMoney } from "../../../lib/currency";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { studentIds } from "../../../lib/scopes";
import { isAdmin } from "../../../lib/permissions";
import { display } from "../../../lib/records";
import { Shell } from "../../shell";
import { PrintButton } from "../../print-button";
export default async function StudentProfile({params}:{params:Promise<{id:string}>}) {
  const user=await requireUser();
  const {id}=await params;
  if (!isAdmin(user.role) && !studentIds(user).includes(id)) notFound();
  const student=await db.student.findFirst({where:{id,archived:false}});
  if (!student) notFound();
  const [enrollments,attendance,marks,invoices,grades]=await Promise.all([
    db.enrollment.findMany({where:{studentId:id},include:{section:{include:{classroom:{include:{year:true}}}}},orderBy:{createdAt:"desc"}}),
    db.attendance.findMany({where:{enrollment:{studentId:id},archived:false},orderBy:{day:"desc"},take:50}),
    db.mark.findMany({where:{enrollment:{studentId:id},archived:false,paper:{archived:false,exam:{archived:false}}},include:{paper:{include:{exam:true,subject:true}}},orderBy:{createdAt:"desc"}}),
    db.invoice.findMany({where:{studentId:id},include:{Payment_invoice:true},orderBy:{due:"desc"}}),
    db.grade.findMany({where:{archived:false},orderBy:{minimum:"desc"}})
  ]);
  const settings=await db.schoolSetting.findFirst({where:{archived:false},select:{currency:true}});
  return <Shell user={user} active="students"><div className="page-head"><div><p className="eyebrow">{student.admissionNo}</p><h1>{student.name}</h1><p>{student.status}</p></div><div className="actions"><Link href="/modules/students">Back to students</Link><PrintButton/></div></div>
  <div className="panels"><section className="card"><h2>Contacts</h2><p>Email {display(student.email)}</p><p>Guardian {display(student.guardianName)}</p><p>Emergency phone {display(student.emergencyPhone)}</p></section>
  <section className="card"><h2>Enrollment history</h2>{enrollments.length ? enrollments.map(row=><div className="line" key={row.id}>{row.section.classroom.year.name} · {row.section.classroom.name} · {row.section.name}<span>Roll {row.rollNo}</span></div>):<p>No enrollments.</p>}</section>
  <section className="card"><h2>Recent attendance</h2>{attendance.length ? attendance.map(row=><div className="line" key={row.id}>{display(row.day)}<span>{row.status}</span></div>):<p>No attendance recorded.</p>}</section>
  <section className="card"><h2>Examination results</h2>{marks.length ? marks.map(row=>{
    const percent=row.score*100/row.paper.fullMarks;
    return <div className="line" key={row.id}><span>{row.paper.exam.name} · {row.paper.subject.name}</span><span>{row.score}/{row.paper.fullMarks} · {percent.toFixed(1)}% · {grades.find(grade=>grade.minimum<=percent)?.name ?? "—"} · {row.score>=row.paper.passMarks?"Pass":"Fail"}</span></div>;
  }):<p>No marks recorded.</p>}</section></div>
  <section className="card"><h2>Fee history</h2>{invoices.length ? invoices.map(invoice=>{
    const paid=invoice.Payment_invoice.reduce((sum,payment)=>sum.plus(payment.amount),invoice.amount.minus(invoice.amount));
    return <div key={invoice.id} className="line"><span>{invoice.reference} · Due {display(invoice.due)}</span><span>Paid {formatMoney(paid.toFixed(2),settings?.currency)} · Balance {formatMoney(invoice.amount.minus(invoice.discount).minus(paid).toFixed(2),settings?.currency)}</span></div>;
  }):<p>No invoices.</p>}</section></Shell>;
}
