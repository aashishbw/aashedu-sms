import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { isAdmin } from "../../../lib/permissions";
import { PrintButton } from "../../print-button";
import { Shell } from "../../shell";

const base = "/reports/exam-results";

export default async function ExamResults({searchParams}: {
  searchParams: Promise<{exam?: string; enrollment?: string}>;
}) {
  const user = await requireUser();
  if (!isAdmin(user.role) && user.role !== "PRINCIPAL") notFound();
  const {exam: examId, enrollment: enrollmentId} = await searchParams;
  const exams = await db.exam.findMany({
    where:{archived:false},
    select:{id:true,name:true,classroom:{select:{name:true}}},
    orderBy:[{day:"desc"},{id:"asc"}]
  });
  const exam = examId ? await db.exam.findFirst({
    where:{id:examId,archived:false},
    select:{
      id:true,name:true,classroomId:true,classroom:{select:{name:true}},
      ExamSubject_exam:{
        where:{archived:false},
        select:{id:true,fullMarks:true,passMarks:true,subject:{select:{name:true}}},
        orderBy:[{subject:{name:"asc"}},{id:"asc"}]
      }
    }
  }) : null;
  if (examId && !exam) notFound();

  const papers = exam?.ExamSubject_exam ?? [];
  const fullMarks = papers.reduce((total,paper)=>total+paper.fullMarks,0);
  const [enrollments,grades] = exam ? await Promise.all([
    db.enrollment.findMany({
      where:{section:{classroomId:exam.classroomId},OR:[
        {archived:false,student:{archived:false},section:{archived:false}},
        {Mark_enrollment:{some:{archived:false,paperId:{in:papers.map(paper=>paper.id)}}}}
      ]},
      select:{
        id:true,rollNo:true,student:{select:{name:true,admissionNo:true}},
        section:{select:{name:true}},
        Mark_enrollment:{where:{archived:false,paperId:{in:papers.map(paper=>paper.id)}},select:{paperId:true,score:true}}
      },
      orderBy:[{section:{name:"asc"}},{rollNo:"asc"},{id:"asc"}]
    }),
    db.grade.findMany({where:{archived:false},select:{name:true,minimum:true},orderBy:{minimum:"desc"}})
  ]) : [[],[]];

  const results = enrollments.map(enrollment => {
    const marks = new Map(enrollment.Mark_enrollment.map(mark=>[mark.paperId,mark.score]));
    const scores = papers.map(paper=>marks.get(paper.id));
    const complete = fullMarks > 0 && scores.every(score=>score !== undefined);
    const total = scores.reduce<number>((sum,score)=>sum+(score ?? 0),0);
    const percentage = complete ? total*100/fullMarks : null;
    const passed = complete && papers.every((paper,index)=>(scores[index] ?? 0)>=paper.passMarks);
    return {
      enrollment,scores,total,percentage,
      status:!complete ? "Incomplete" : passed ? "Pass" : "Fail",
      grade:percentage===null ? null : grades.find(grade=>percentage>=grade.minimum)?.name
    };
  });
  const ranking = new Map<number,number>();
  results.filter(result=>result.status==="Pass").sort((a,b)=>b.total-a.total)
    .forEach((result,index)=>{if(!ranking.has(result.total)) ranking.set(result.total,index+1);});
  const rows = enrollmentId ? results.filter(result=>result.enrollment.id===enrollmentId) : results;
  if (enrollmentId && !rows.length) notFound();

  return <Shell user={user} active="reports">
    <div className="page-head">
      <div><p className="eyebrow">Examinations</p><h1>{enrollmentId ? "Student marksheet" : "Class result sheet"}</h1></div>
      {exam && <PrintButton/>}
    </div>
    <form action={base} className="search no-print">
      <label>Exam<select name="exam" defaultValue={exam?.id ?? ""} required>
        <option value="">Choose an exam</option>
        {exams.map(option=><option key={option.id} value={option.id}>{option.name} · {option.classroom.name}</option>)}
      </select></label>
      <button>View results</button>
      {enrollmentId && exam && <Link href={base+"?exam="+exam.id}>Back to class results</Link>}
    </form>
    {!exam && <p className="empty">{exams.length ? "Choose an exam to see its results." : "Create an examination before viewing results."}</p>}
    {exam && <section className="card">
      <h2>{exam.name} · {exam.classroom.name}</h2>
      <p className="muted">Ranks apply to complete, passing results. Equal totals share a rank.</p>
      {!papers.length ? <p>No exam subjects have been configured.</p> : !rows.length ? <p>No students are enrolled.</p> :
        <div className="scroll exam-result-table"><table>
          <thead><tr>
            <th scope="col">Student</th><th scope="col">Section / Roll</th>
            {papers.map(paper=><th scope="col" key={paper.id}>{paper.subject.name}<br/><small>Out of {paper.fullMarks}</small></th>)}
            <th scope="col">Total / {fullMarks}</th><th scope="col">Percentage</th><th scope="col">Grade</th><th scope="col">Result</th><th scope="col">Rank</th>
            {!enrollmentId && <th scope="col" className="no-print">Marksheet</th>}
          </tr></thead>
          <tbody>{rows.map(result=><tr key={result.enrollment.id}>
            <th scope="row">{result.enrollment.student.name}<br/><small>{result.enrollment.student.admissionNo}</small></th>
            <td>{result.enrollment.section.name} / {result.enrollment.rollNo}</td>
            {result.scores.map((score,index)=><td key={papers[index].id}>{score ?? "—"}</td>)}
            <td>{result.percentage===null ? "—" : result.total}</td>
            <td>{result.percentage===null ? "—" : result.percentage.toFixed(2)+"%"}</td>
            <td>{result.grade ?? "—"}</td><td>{result.status}</td>
            <td>{result.status==="Pass" ? ranking.get(result.total) : "—"}</td>
            {!enrollmentId && <td className="no-print"><Link href={base+"?"+new URLSearchParams({exam:exam.id,enrollment:result.enrollment.id})}>View</Link></td>}
          </tr>)}</tbody>
        </table></div>}
    </section>}
  </Shell>;
}
