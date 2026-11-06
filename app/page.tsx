import { readInstitution } from "../lib/institution";
import { defaultName } from "../lib/institution-profile";
import { defaultCurrency, formatMoney } from "../lib/currency";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, CreditCard, GraduationCap, UsersRound } from "lucide-react";
import { requireUser } from "../lib/auth";
import { db } from "../lib/db";
import { isAdmin } from "../lib/permissions";
import { CountsChart } from "./charts";
import { InstitutionMark } from "./institution-brand";
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
  const monthStart = new Date(Date.UTC(day.getUTCFullYear(),day.getUTCMonth()-5,1));
  const nextMonth = new Date(Date.UTC(day.getUTCFullYear(),day.getUTCMonth()+1,1));
  const [stats,students,exams,collections] = admin ? await Promise.all([
    Promise.all([
      db.student.count({where:{archived:false}}),
      db.employee.count({where:{archived:false}}),
      db.attendance.groupBy({by:["status"],where:{archived:false,day},_count:true}),
      db.payment.aggregate({_sum:{amount:true}}),
      db.invoice.aggregate({_sum:{amount:true,discount:true}})
    ]),
    db.student.findMany({where:{archived:false},orderBy:{createdAt:"desc"},take:5}),
    db.exam.findMany({where:{archived:false,day:{gte:day}},orderBy:{day:"asc"},take:5}),
    db.$queryRaw<{month:string; total:string}[]>`
      SELECT to_char(day, 'YYYY-MM') AS month, SUM(amount)::text AS total
      FROM "Payment"
      WHERE archived=false AND day >= ${monthStart}::date AND day < ${nextMonth}::date
      GROUP BY 1
    `
  ]) : [null,[],[],[]] as const;
  const collectionByMonth = new Map(collections.map(row => [row.month,Number(row.total)]));
  const collectionData = collections.length ? Array.from({length:6},(_,index) => {
    const month = new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth()+index,1));
    return {
      label:new Intl.DateTimeFormat("en",{month:"short",timeZone:"UTC"}).format(month),
      value:collectionByMonth.get(month.toISOString().slice(0,7)) ?? 0
    };
  }) : [];
  const present = stats?.[2].find(row => row.status === "Present")?._count ?? 0;
  const late = stats?.[2].find(row => row.status === "Late")?._count ?? 0;
  const marked = stats?.[2].reduce((sum, row) => sum + row._count, 0) ?? 0;
  const outstanding = stats?.[4]._sum.amount?.minus(stats[4]._sum.discount ?? 0).minus(stats[3]._sum.amount ?? 0).toNumber() ?? 0;
  const tiles = stats ? [
    {label:"Students",value:stats[0],icon:GraduationCap,key:"students"},
    {label:"Teachers & staff",value:stats[1],icon:UsersRound,key:"employees"},
    {label:"Attendance today",value:marked ? Math.round((present + late) * 100 / marked) + "%" : "—",icon:CalendarCheck,key:"attendance"},
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
    {admin && <><div className="tiles dashboard-metrics">{tiles.map(({label,value,icon:Icon,key}) => <Link className="card tile" href={"/modules/" + key} key={key}>
      <span><span className="muted">{label}</span><strong>{value}</strong></span><span className="tile-icon"><Icon size={20}/></span></Link>)}</div>
      <div className="panels">
        <CountsChart title="Attendance today" data={stats?.[2].map(row=>({label:row.status,value:row._count})) ?? []}/>
        <CountsChart title="Fee collection · last six months" data={collectionData} currency={currency}/>
      </div>
      <div className="dashboard-insights">
        <section className="card dashboard-identity" aria-labelledby="dashboard-institution">
          <InstitutionMark logoUrl={settings?.hasLogo ? "/api/institution/logo" : null}/>
          <div>
            <p className="eyebrow">{settings?.institutionType ?? "Institution"}</p>
            <h2 id="dashboard-institution" className="institution-name">{settings?.name || defaultName}</h2>
            {settings?.registrationNumber && <p className="muted">Registration {settings.registrationNumber}</p>}
            {settings?.academicYear && <p className="muted">Academic year {settings.academicYear}</p>}
          </div>
          <Link href="/settings/institution">Institution Profile</Link>
        </section>
      <div className="panels"><section className="card"><h2>Recent admissions</h2>{students.length ? students.map(s => <div className="line" key={s.id}><strong>{s.name}</strong><span>{s.status}</span></div>) : <p className="muted">No admissions yet.</p>}</section>
      <section className="card"><h2>Upcoming examinations</h2>{exams.length ? exams.map(e => <div className="line" key={e.id}><strong>{e.name}</strong><span>{e.day.toISOString().slice(0,10)}</span></div>) : <p className="muted">No scheduled examinations.</p>}</section></div></div></>}
    {admin && <section className="card dashboard-shortcuts"><h2>Management areas</h2><div className="dashboard-shortcut-grid">
      <div className="line"><Link href="/modules/students">Student Management</Link></div>
      <div className="line"><Link href="/modules/exams">Exam Management</Link></div>
      <div className="line"><Link href="/modules/employees">Staff Management</Link></div>
      <div className="line"><Link href="/modules/payroll">Payroll Management</Link></div>
    </div></section>}
    <section className="card"><h2>School announcements</h2>{announcements.length ? announcements.map(a => <article className="announcement" key={a.id}><strong>{a.title}</strong><p>{a.body}</p></article>) : <p className="muted">No school-wide announcements.</p>}</section>
  </Shell>;
}
