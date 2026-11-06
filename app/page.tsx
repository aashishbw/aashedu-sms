import { readInstitution } from "../lib/institution";
import { defaultName } from "../lib/institution-profile";
import { defaultCurrency, formatMoney } from "../lib/currency";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarCheck, CreditCard, GraduationCap, UsersRound, School } from "lucide-react";
import { requireUser } from "../lib/auth";
import { db } from "../lib/db";
import { isAdmin } from "../lib/permissions";
import { CountsChart } from "./charts";
import { Shell } from "./shell";
export default async function Overview({searchParams}:{searchParams:Promise<{changePassword?:string}>}) {
  const {changePassword}=await searchParams;
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const [announcements, settings] = await Promise.all([
    db.announcement.findMany({ where: { archived: false, sectionId: null }, orderBy: { createdAt: "desc" }, take: 5 }),
    readInstitution()
  ]);
  const currency = settings?.currency ?? defaultCurrency;
  const format = (value: number) => formatMoney(value, currency);
  const today = new Intl.DateTimeFormat("sv-SE",{timeZone:settings?.timezone ?? "UTC",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const day = new Date(today + "T00:00:00Z");
  const stats = admin ? await Promise.all([
    db.student.count({where:{archived:false}}), db.employee.count({where:{archived:false}}),
    db.schoolClass.count({where:{archived:false}}), db.subject.count({where:{archived:false}}),
    db.attendance.groupBy({by:["status"],where:{archived:false,day},_count:true}),
    db.payment.aggregate({_sum:{amount:true}}),
    db.invoice.aggregate({_sum:{amount:true,discount:true}})
  ]) : null;
  const students = admin ? await db.student.findMany({where:{archived:false},orderBy:{createdAt:"desc"},take:5}) : [];
  const exams = admin ? await db.exam.findMany({where:{archived:false,day:{gte:day}},orderBy:{day:"asc"},take:5}) : [];
  const present = stats?.[4].find(row => row.status === "Present")?._count ?? 0;
  const late = stats?.[4].find(row => row.status === "Late")?._count ?? 0;
  const marked = stats?.[4].reduce((sum, row) => sum + row._count, 0) ?? 0;
  const paid = stats?.[5]._sum.amount?.toNumber() ?? 0;
  const outstanding = stats?.[6]._sum.amount?.minus(stats[6]._sum.discount ?? 0).minus(stats[5]._sum.amount ?? 0).toNumber() ?? 0;
  const tiles = stats ? [
    {label:"Students",value:stats[0],icon:GraduationCap,key:"students"},
    {label:"Teachers & staff",value:stats[1],icon:UsersRound,key:"employees"},
    {label:"Classes",value:stats[2],icon:School,key:"classes"},
    {label:"Subjects",value:stats[3],icon:BookOpen,key:"subjects"},
    {label:"Attendance today",value:marked ? Math.round((present + late) * 100 / marked) + "%" : "—",icon:CalendarCheck,key:"attendance"},
    {label:"Fees collected",value:format(paid),icon:CreditCard,key:"payments"},
    {label:"Outstanding fees",value:format(outstanding),icon:CreditCard,key:"fees"}
  ] : [];
  return <Shell user={user} promptPassword={changePassword === "1" ? user.id : undefined}>
    {admin && (!settings?.name?.trim() || !settings?.registrationNumber?.trim()) && (
      <section className="card" aria-labelledby="institution-setup">
        <p className="eyebrow">Getting started</p>
        <h2 id="institution-setup">Set up your school or college</h2>
        <p className="muted">Enter your institution’s name and registration number. You can also add its logo and colors.</p>
        <Link className="button" href="/settings/institution">Open Institution Profile</Link>
      </section>
    )}
    <div className="page-head"><div><p className="eyebrow">{settings?.name || defaultName}</p><h1>School overview</h1><p className="muted">Welcome back, {user.name}.</p></div>
      {admin && <Link className="button" href="/modules/students?add=1">New admission <ArrowUpRight size={16}/></Link>}</div>
    {admin && <section className="card"><h2>Management areas</h2>
      <div className="line"><Link href="/modules/students">Student Management</Link></div>
      <div className="line"><Link href="/modules/exams">Exam Management</Link></div>
      <div className="line"><Link href="/modules/employees">Staff Management</Link></div>
      <div className="line"><Link href="/modules/payroll">Payroll Management</Link></div>
    </section>}
    {admin && <><div className="tiles">{tiles.map(({label,value,icon:Icon,key}) => <Link className="card tile" href={"/modules/" + key} key={key}>
      <span className="tile-icon"><Icon size={20}/></span><span className="muted">{label}</span><strong>{value}</strong></Link>)}</div>
      <CountsChart title="Attendance today" data={stats?.[4].map(row=>({label:row.status,value:row._count})) ?? []}/>
      <div className="panels"><section className="card"><h2>Recent admissions</h2>{students.length ? students.map(s => <div className="line" key={s.id}><strong>{s.name}</strong><span>{s.status}</span></div>) : <p className="muted">No admissions yet.</p>}</section>
      <section className="card"><h2>Upcoming examinations</h2>{exams.length ? exams.map(e => <div className="line" key={e.id}><strong>{e.name}</strong><span>{e.day.toISOString().slice(0,10)}</span></div>) : <p className="muted">No scheduled examinations.</p>}</section></div></>}
    <section className="card"><h2>School announcements</h2>{announcements.length ? announcements.map(a => <article className="announcement" key={a.id}><strong>{a.title}</strong><p>{a.body}</p></article>) : <p className="muted">No school-wide announcements.</p>}</section>
  </Shell>;
}
