import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { isAdmin } from "../../../lib/permissions";
import { readInstitution } from "../../../lib/institution";
import { defaultCurrency } from "../../../lib/currency";
import { themeColor, type InstitutionForm } from "../../../lib/institution-profile";
import { Shell } from "../../shell";
import { Submit } from "../../submit";
import { updateInstitution } from "./actions";

const fields = [
  ["name","Institution name",160],["shortName","Short name",40],["address","Address",400],
  ["phone","Phone number",60,"tel"],["email","Email address",254,"email"],["website","Website",255,"url"],
  ["registrationNumber","Registration number",80],["headName","Principal / head name",120],
  ["academicYear","Academic year",40],["currency","Currency code",3],["timezone","Time zone",80]
] as const satisfies readonly (readonly [keyof InstitutionForm,string,number,string?])[];

export default async function InstitutionSettings({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}) {
  const user=await requireUser();
  if (!isAdmin(user.role)) notFound();
  const profile=await readInstitution();
  const {saved,error}=await searchParams;
  const message=error==="logo" ? "Choose a valid PNG or JPEG logo up to 2 MB." :
    error==="fields" ? "Check the profile fields, website URL, currency code and time zone." :
    "The institution profile could not be saved.";
  const color=(value:string|null|undefined,fallback:string) => themeColor.safeParse(value).data ?? fallback;
  return <Shell user={user} active="institution">
    <div><p className="eyebrow">Admin settings</p><h1>Institution Profile</h1></div>
    {saved && <p className="success" role="status">Institution profile saved.</p>}
    {error && <p className="alert" role="alert">{message}</p>}
    <section className="card"><form action={updateInstitution} className="stack">
      <div className="form-grid">
        <label>Institution type<select name="institutionType" defaultValue={profile?.institutionType ?? "School"}>
          <option>School</option><option>College</option>
        </select></label>
        {fields.map(([key,label,length,type]) => <label key={key}>{label}<input name={key} type={type ?? "text"} maxLength={length}
          required={["name","currency","timezone"].includes(key)}
          defaultValue={profile?.[key] ?? (key==="currency" ? defaultCurrency : key==="timezone" ? "Asia/Kathmandu" : "")}/></label>)}
        <label>Primary theme color<input type="color" name="primaryColor" defaultValue={color(profile?.primaryColor,"#1465b8")}/></label>
        <label>Secondary theme color<input type="color" name="secondaryColor" defaultValue={color(profile?.secondaryColor,"#9dd6ff")}/></label>
      </div>
      {profile?.hasLogo && <img className="institution-logo" src="/api/institution/logo" alt="Current institution logo" width={48} height={48}/>}
      <label>Institution logo (PNG or JPEG, up to 2 MB)<input type="file" name="logo" accept="image/png,image/jpeg"/></label>
      {profile?.hasLogo && <label className="logo-removal"><input type="checkbox" name="removeLogo"/> Remove existing logo</label>}
      <div><Submit text="Save institution profile"/></div>
    </form></section>
  </Shell>;
}

