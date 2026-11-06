import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../lib/auth";
import { db } from "../../lib/db";
import { Shell } from "../shell";
import { Submit } from "../submit";
import { registerInstitution } from "./actions";

const errors: Record<string,string> = {
  invalid:"Check the institution name, registration number, contact email and sign-in URL.",
  duplicate:"An institution with that registration number already exists.",
  save:"The institution could not be registered. Try again."
};

export default async function Institutions({searchParams}:{
  searchParams:Promise<{error?:string; saved?:string; edit?:string}>;
}) {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") notFound();
  const {error,saved,edit} = await searchParams;
  const entries = await db.institutionRegistration.findMany({orderBy:[{name:"asc"},{id:"asc"}]});

  const selected = entries.find(entry => entry.id === edit);
  return <Shell user={user} active="institutions">
    <div><p className="eyebrow">Global administration</p><h1>Schools &amp; Colleges</h1>
      <p className="muted">Register institutions and keep their separate AashEdu sign-in URLs in one place.</p></div>
    {saved && <p className="success" role="status">{saved === "updated" ? "Institution updated." : "Institution registered."}</p>}
    {error && <p className="alert" role="alert">{Object.hasOwn(errors,error) ? errors[error] : errors.save}</p>}
    <section className="card">
      <h2>{selected ? "Edit institution" : "Register an institution"}</h2>
      <form action={registerInstitution.bind(null,selected?.id ?? null)} className="stack">
        <div className="form-grid">
          <label>Institution type<select name="type" defaultValue={selected?.type ?? "School"}><option>School</option><option>College</option></select></label>
          <label>Institution name<input name="name" defaultValue={selected?.name ?? ""} required maxLength={160}/></label>
          <label>Registration number<input name="registrationNumber" defaultValue={selected?.registrationNumber ?? ""} required maxLength={80}/></label>
          <label>Contact email<input name="contactEmail" defaultValue={selected?.contactEmail ?? ""} type="email" required maxLength={254}/></label>
          <label>Sign-in URL (optional)<input name="loginUrl" defaultValue={selected?.loginUrl ?? ""} type="url" maxLength={512} placeholder="https://school.example.com/login"/></label>
        </div>
        <div className="actions"><Submit text={selected ? "Save changes" : "Register institution"}/>{selected && <Link href="/institutions">Cancel</Link>}</div>
      </form>
    </section>
    <section className="card">
      <h2>Registered institutions</h2>
      {entries.length ? <div className="scroll"><table>
        <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Registration number</th><th scope="col">Contact email</th><th scope="col">Sign-in</th><th scope="col">Actions</th></tr></thead>
        <tbody>{entries.map(entry => <tr key={entry.id}>
          <td>{entry.name}</td><td>{entry.type}</td><td>{entry.registrationNumber}</td><td>{entry.contactEmail}</td>
          <td>{entry.loginUrl ? <a href={entry.loginUrl}>Open sign-in</a> : "Pending setup"}</td>
          <td><Link href={"/institutions?edit="+entry.id}>Edit</Link></td>
        </tr>)}</tbody>
      </table></div> : <p className="muted">No institutions registered yet.</p>}
    </section>
  </Shell>;
}

