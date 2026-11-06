import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireUser } from "../../lib/auth";
import { db } from "../../lib/db";
import { isAdmin } from "../../lib/permissions";
import { Shell } from "../shell";
import { Submit } from "../submit";
import { addUser,toggleUser } from "./actions";
export default async function Users({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}) {
  const user=await requireUser();
  if (!isAdmin(user.role)) notFound();
  const {error,saved}=await searchParams;
  const accounts=await db.user.findMany({select:{id:true,name:true,email:true,role:true,disabled:true},orderBy:{name:"asc"},take:200});
  const [students,employees]=await Promise.all([db.student.findMany({where:{archived:false},select:{id:true,name:true,admissionNo:true},take:500}),db.employee.findMany({where:{archived:false},select:{id:true,name:true,employeeNo:true},take:500})]);
  return <Shell user={user} active="users"><div><p className="eyebrow">Administration</p><h1>User accounts</h1></div>
  {error && <p className="alert" role="alert">{error==="invalid"?"Review the email, role and password length.":"Unable to create the account. Check whether the email is in use."}</p>}
  {saved && <p className="success" role="status">Account saved.</p>}
  <section className="card"><h2>Add an account</h2><form action={addUser}><div className="form-grid">
    <label>Name<input required name="name" maxLength={120}/></label><label>Email<input required type="email" name="email"/></label>
    <label>Role<select name="role" required defaultValue="STUDENT">{Object.values(Role).filter(role=>role!=="SUPER_ADMIN"||user.role==="SUPER_ADMIN").map(role=><option key={role} value={role}>{role.replaceAll("_"," ")}</option>)}</select></label>
    <label>Initial password<input type="password" name="password" minLength={14} maxLength={256} autoComplete="new-password" required/></label>
  <label>Student or guardian link<select name="studentId"><option value="">None</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} · {s.admissionNo}</option>)}</select></label>
  <label>Teacher link<select name="employeeId"><option value="">None</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name} · {e.employeeNo}</option>)}</select></label>
  </div><Submit text="Create account"/></form></section>
  <section className="card scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access</th></tr></thead>
  <tbody>{accounts.map(a=><tr key={a.id}><td>{a.name}</td><td>{a.email}</td><td>{a.role.replaceAll("_"," ")}</td><td>{a.disabled?"Disabled":"Active"}</td>
  <td>{a.id!==user.id&&(a.role!=="SUPER_ADMIN"||user.role==="SUPER_ADMIN")&&<form action={toggleUser.bind(null,a.id)}><Submit text={a.disabled?"Enable":"Disable"}/></form>}</td></tr>)}</tbody></table></section></Shell>;
}
