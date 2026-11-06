import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { isAdmin } from "../../../lib/permissions";
import { studentIds } from "../../../lib/scopes";
import { display } from "../../../lib/records";
import { Shell } from "../../shell";
import { Submit } from "../../submit";
import { submitAssignment,reviewSubmission } from "./actions";
export default async function Homework({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;saved?:string}>}) {
  const user=await requireUser();
  const {id}=await params;
  const {error,saved}=await searchParams;
  const staff=isAdmin(user.role)||user.role==="TEACHER";
  const ids=studentIds(user);
  if(!staff&&!ids.length) notFound();
  if(user.role==="TEACHER"&&!user.employeeId) notFound();
  const assignment=await db.assignment.findFirst({where:{id,archived:false,teaching:{archived:false,
    ...(user.role==="TEACHER"?{teacherId:user.employeeId ?? ""}:{}),
    ...(!staff?{section:{Enrollment_section:{some:{studentId:{in:ids},archived:false}}}}:{})
  }},include:{submissions:{where:staff?{}:{studentId:{in:ids}},include:{student:{select:{name:true,admissionNo:true}}}}}});
  if(!assignment) notFound();
  const open=Date.now()<assignment.due.getTime()+86_400_000;
  return <Shell user={user} active="homework">
    <div><p className="eyebrow">Homework</p><h1>{assignment.title}</h1><p>Due {display(assignment.due)}</p></div>
    {error&&<p className="alert" role="alert">{error==="invalid"?"Review the required fields.":"This submission is closed or has already been reviewed."}</p>}
    {saved&&<p className="success" role="status">Saved.</p>}
    <section className="card"><h2>Instructions</h2><div className="announcement"><p>{assignment.description}</p></div></section>
    {user.role==="STUDENT"&&open&&assignment.submissions[0]?.score==null&&<section className="card"><h2>Your submission</h2><form action={submitAssignment.bind(null,id)} className="stack">
      <label>Response<textarea name="body" rows={8} maxLength={10000} required defaultValue={assignment.submissions[0]?.body}/></label><Submit text="Save submission"/>
    </form></section>}
    <section className="card"><h2>Submissions</h2>{assignment.submissions.length===0&&<p className="muted">No submissions yet.</p>}
      {assignment.submissions.map(row=><article className="announcement" key={row.id}><strong>{row.student.name} · {row.student.admissionNo}</strong><p>{row.body}</p>
      {staff ? <form action={reviewSubmission.bind(null,id,row.id)} className="stack"><div className="form-grid">
        <label>Score (out of 100)<input name="score" type="number" required min={0} max={100} defaultValue={row.score ?? ""}/></label>
        <label>Feedback<textarea name="feedback" required maxLength={4000} defaultValue={row.feedback ?? ""}/></label>
      </div><Submit text="Save review"/></form> : <p>{row.score==null?"Awaiting review":row.score+"/100 · "+row.feedback}</p>}</article>)}</section>
  </Shell>;
}
