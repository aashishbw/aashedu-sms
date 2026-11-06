import Link from "next/link";
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import type { Role } from "@prisma/client";
import { publicBranding, readInstitution } from "../lib/institution";
import { InstitutionMark } from "./institution-brand";
import { logout } from "./login/actions";
import { catalog } from "../lib/catalog";
import { canRead, isAdmin } from "../lib/permissions";
const groups: Record<string, string[]> = {
  "People": ["students", "enrollments"],
  "Academics": ["years","classes","sections","subjects","teaching","timetable","attendance","exams","exam-subjects","marks","grading","homework"],
  "HRMS & Payroll": ["employees","staff-attendance","leave","payroll"],
  "Operations": ["fee-categories","fee-structures","fees","payments","books","loans","vehicles","transport","riders","communication"]
};
export async function Shell({ user, active, children }: { user: {name: string; role: Role}; active?: string; children: React.ReactNode }) {
  const [brand,profile]=await Promise.all([publicBranding(),readInstitution()]);
  return <div className="frame">
    <aside><Link href="/" className="brand"><InstitutionMark logoUrl={brand.logoUrl}/><strong className="institution-name">{profile?.shortName || brand.name}</strong></Link>
      <details className="navigation" open><summary>Workspace <ChevronDown size={15}/></summary><nav aria-label="Workspace">
      <Link className={!active ? "active" : ""} href="/"><LayoutDashboard size={16}/> Overview</Link>
      {Object.entries(groups).map(([group, keys]) => {
        const visible = keys.filter(key => canRead(user.role, key));
        return visible.length > 0 && <div className="nav-group" key={group}><p>{group}</p>
          {visible.map(key => <Link aria-current={active === key ? "page" : undefined} className={active === key ? "active" : ""} key={key} href={"/modules/" + key}>{catalog[key].title}</Link>)}
        </div>;
      })}
      <Link className={active === "reports" ? "active" : ""} href="/reports">Reports</Link>
      {isAdmin(user.role) && <Link className={active === "institution" ? "active" : ""} href="/settings/institution">Admin settings · Institution Profile</Link>}
      {isAdmin(user.role) && <Link className={active === "users" ? "active" : ""} href="/users">User accounts</Link>}
      </nav></details>
    </aside>
    <div className="workspace">
      <header><strong className="institution-name">{brand.name}</strong><div><span><strong>{user.name}</strong><small>{user.role.toLowerCase().replaceAll("_", " ")}</small></span><form action={logout}><button className="icon secondary" aria-label="Sign out"><LogOut size={17}/></button></form></div></header>
      <main className="content"><div className="print-institution">
        <InstitutionMark logoUrl={brand.logoUrl}/><div><strong>{brand.name}</strong>
        <p>{[profile?.address,profile?.phone,profile?.email,profile?.website].filter(Boolean).join(" | ")}</p></div>
      </div>{children}</main>
    </div>
  </div>;
}
