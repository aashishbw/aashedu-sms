import Link from "next/link";
import { requireUser } from "../../lib/auth";
import { canRead } from "../../lib/permissions";
import { catalog } from "../../lib/catalog";
import { Shell } from "../shell";
import { PrintButton } from "../print-button";
const reportKeys = ["students","enrollments","attendance","staff-attendance","fees","payments","marks","payroll","loans","riders"];
export default async function Reports(){
  const user=await requireUser();
  const visible=reportKeys.filter(key=>canRead(user.role,key));
  return <Shell user={user} active="reports"><div className="page-head"><div><p className="eyebrow">Exports and records</p><h1>Reports</h1></div><PrintButton/></div>
    <section className="card">{visible.length ? visible.map(key=><div key={key} className="line"><Link href={"/modules/"+key}>{catalog[key].title}</Link><div className="actions"><Link href={"/export/"+key}>Download CSV</Link><Link href={"/export/"+key+"?format=pdf"}>Download PDF</Link></div></div>) : <p className="muted">No reports are available for your role.</p>}</section>
  </Shell>;
}
