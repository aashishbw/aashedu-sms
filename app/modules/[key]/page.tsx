import { formatMoney } from "../../../lib/currency";
import { db } from "../../../lib/db";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLine, Plus, Search } from "lucide-react";
import { catalog, fieldKey, label } from "../../../lib/catalog";
import { requireUser } from "../../../lib/auth";
import { canRead, canWrite, listFields } from "../../../lib/permissions";
import { records, display, choices, recordName } from "../../../lib/records";
import { Shell } from "../../shell";
import { Submit } from "../../submit";
import { filters } from "../../../lib/filters";
import { scopeFor } from "../../../lib/scopes";
import { save } from "../actions";
export default async function Module({ params, searchParams }: {
  params: Promise<{key: string}>;
  searchParams: Promise<Record<string,string | undefined>>;
}) {
  const user = await requireUser();
  const {key} = await params;
  if (!Object.hasOwn(catalog,key) || !canRead(user.role,key)) notFound();
  const resource = catalog[key];
  const {q, p, add, edit, error, saved, sort, from, to} = await searchParams;
  const path = "/modules/" + key;
  const writable = canWrite(user.role,key);
  const allowed = listFields(user.role,key);
  const settings=resource.fields.some(field=>field.type==="money") ? await db.schoolSetting.findFirst({where:{archived:false},select:{currency:true}}) : null;
  const fields = resource.fields.filter(field => !allowed || allowed.includes(field.name));
  const scope = {archived:false,...scopeFor(user,key)};
  const where=filters(user,key,fields,{q,from,to});
  const page = Math.max(1,Math.min(5000,Number.parseInt(p ?? "1",10) || 1));
  const table = records(resource);
  const editing = writable && Boolean(add || edit);
  const [rows,count,selected] = await Promise.all([
    table.findMany({where,skip:(page-1)*20,take:20,orderBy:[{createdAt:sort === "oldest" ? "asc" : "desc"},{id:"asc"}],
      select:{id:true,...Object.fromEntries(fields.map(field => [field.target ? field.name : fieldKey(field), field.target ? {select:{id:true,...Object.fromEntries(catalog[field.target].fields.filter(f => ["name","title","reference","registration","rollNo"].includes(f.name)).map(f=>[f.name,true]))}} : true]))}}),
    table.count({where}),
    edit && editing ? table.findFirst({where:{...scope,id:edit}}) : null
  ]);
  const options = editing ? Object.fromEntries(await Promise.all(resource.fields.filter(field=>field.target && !(key==="leave" && ["STUDENT","TEACHER","PRINCIPAL"].includes(user.role))).map(async field => [
    field.name, await records(catalog[field.target!]).findMany({where:{archived:false,...scopeFor(user,field.target!)},orderBy:{createdAt:"desc"},take:500})
  ] as const))) : {};
  const pageLink = (next: number) => path + "?" + new URLSearchParams({p:String(next),q:q ?? "",sort:sort ?? "",from:from ?? "",to:to ?? ""});
  const requester=key==="leave" && ["STUDENT","TEACHER"].includes(user.role);
  const reviewer=key==="leave" && user.role==="PRINCIPAL";
  const visibleFields=fields.filter(field=>!requester || !["student","employee"].includes(field.name));
  const immutable = ["fees","payments"].includes(key);
  return <Shell user={user} active={key}>
    <div className="page-head"><div><p className="eyebrow">School records</p><h1>{resource.title}</h1><p className="muted">{count} matching {count === 1 ? "record" : "records"}</p></div>
      <div className="actions"><Link className="button secondary" href={"/export/" + key + "?" + new URLSearchParams({q:q ?? "",from:from ?? "",to:to ?? ""})}><ArrowDownToLine size={16}/> CSV</Link><Link className="button secondary" href={"/export/" + key + "?" + new URLSearchParams({q:q ?? "",from:from ?? "",to:to ?? "",format:"pdf"})}>PDF</Link>
      {writable && !reviewer && <Link className="button" href={path + "?add=1"}><Plus size={16}/> Add record</Link>}</div></div>
    {error && <p className="alert" role="alert">{error}</p>}
    {saved && <p className="success" role="status">Record saved.</p>}
    {editing && (!edit || selected) && !(edit && immutable) && <section className="card editor">
      <div className="page-head"><h2>{edit ? "Edit record" : "New record"}</h2><Link href={path}>Cancel</Link></div>
      <form action={save.bind(null,key,edit ?? null,false)}><div className="form-grid">
      {resource.fields.map(field => {
        if (requester && ["student","employee","status"].includes(field.name)) return field.name==="status"?<input key="status" type="hidden" name="status" value="Pending"/>:null;
        if (reviewer && field.name!=="status") return <input key={field.name} type="hidden" name={fieldKey(field)} value={selected?.[fieldKey(field)]==null?"":display(selected[fieldKey(field)])}/>;
        const name = fieldKey(field);
        const current = selected?.[name];
        const value = current == null ? "" : display(current);
        const generated = !edit && ["admissionNo","employeeNo"].includes(name);
        return <label key={name}>{key==="payroll" && name==="base" ? "Base pay (defaults to staff salary)" : key==="payroll" && name==="period" ? "Pay month (choose any date)" : label(field.name)}{generated ? " (optional)" : ""}
          {field.target || (name === "status" && choices[key]) ? <select name={name} defaultValue={value} required={!field.optional}>
            <option value="">Select…</option>
            {field.target ? options[field.name]?.map(row=><option key={row.id} value={row.id}>{recordName(row)}</option>)
              : choices[key].map(choice=><option key={choice}>{choice}</option>)}
          </select> : <input name={name} type={field.type === "date" ? "date" : name === "email" ? "email" : "text"} inputMode={field.type === "int" ? "numeric" : field.type === "money" ? "decimal" : undefined}
             defaultValue={value} required={!field.optional && !generated} maxLength={4000}/>}
        </label>;
      })}
      </div><Submit text="Save record"/></form>
    </section>}
    <section className="card list">
      <form className="search"><label><span className="sr-only">Search records</span><input name="q" defaultValue={q} placeholder="Search records"/></label>
      <label><span className="sr-only">Sort order</span><select name="sort" defaultValue={sort ?? ""}><option value="">Newest first</option><option value="oldest">Oldest first</option></select></label>
      <label>From<input type="date" name="from" defaultValue={from}/></label><label>Through<input type="date" name="to" defaultValue={to}/></label>
      <button className="secondary"><Search size={16}/> Search</button></form>
      {rows.length > 0 ? <div className="scroll"><table><thead><tr>{visibleFields.map(f=><th scope="col" key={f.name}>{label(f.name)}</th>)}{(key === "students" || key === "homework" || immutable || writable) && <th scope="col">Actions</th>}{key==="payroll" && <th scope="col">Net pay</th>}</tr></thead><tbody>
        {rows.map(row=><tr key={row.id}>{visibleFields.map(f=><td key={f.name}>{f.target && row[f.name] ? recordName(row[f.name] as typeof row) : f.type==="money" && row[fieldKey(f)]!=null ? formatMoney(new Prisma.Decimal(String(row[fieldKey(f)])).toFixed(2),settings?.currency) : display(row[fieldKey(f)])}</td>)}
          {(key === "students" || key === "homework" || immutable || writable) && <td><div className="actions">{key === "students" && ["SUPER_ADMIN","SCHOOL_ADMIN","STUDENT","PARENT"].includes(user.role) && <Link href={"/students/" + row.id}>Profile</Link>}{key==="homework" && <Link href={"/homework/"+row.id}>Open</Link>}{immutable && <Link href={"/finance/"+key+"/"+row.id}>{key==="fees"?"Invoice PDF":"Receipt PDF"}</Link>}{writable && !immutable && !(key==="payroll" && row.status==="Paid") && <Link href={path + "?edit=" + row.id}>Edit</Link>}
          {writable && !reviewer && !immutable && key !== "settings" && key !== "payroll" && <form action={save.bind(null,key,row.id,true)}><Submit text="Archive" confirm/></form>}</div></td>}{key==="payroll" && <td>{formatMoney(new Prisma.Decimal(String(row.base)).plus(String(row.allowances)).minus(String(row.deductions)).toFixed(2),settings?.currency)}</td>}</tr>)}
      </tbody></table></div> : <p className="empty">No records match this view.</p>}
      <div className="pagination">{page > 1 && <Link href={pageLink(page-1)}>Previous</Link>} <span>Page {page}</span> {page * 20 < count && <Link href={pageLink(page+1)}>Next</Link>}</div>
    </section>
  </Shell>;
}
