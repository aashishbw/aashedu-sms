import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import type { Role } from "@prisma/client";
import { logout } from "./login/actions";
import { catalog } from "../lib/catalog";
import { canRead, isAdmin } from "../lib/permissions";
const groups: Record<string, string[]> = {
  "People": ["students", "enrollments"],
  "Academics": ["years","classes","sections","subjects","teaching","timetable","attendance","exams","exam-subjects","marks","grading","homework"],
  "HRMS & Payroll": ["employees","staff-attendance","leave","payroll"],
  "Operations": ["fee-categories","fee-structures","fees","payments","books","loans","vehicles","transport","riders","communication","settings"]
};
export function Shell({ user, active, children }: { user: {name: string; role: Role}; active?: string; children: React.ReactNode }) {
  return <div className="frame">
    <aside><Link href="/" className="brand"><span><GraduationCap size={21}/></span> AashEdu School Management System</Link>
      <details className="navigation" open><summary>Workspace <ChevronDown size={15}/></summary><nav aria-label="Workspace">
      <Link className={!active ? "active" : ""} href="/"><LayoutDashboard size={16}/> Overview</Link>
      {Object.entries(groups).map(([group, keys]) => {
        const visible = keys.filter(key => canRead(user.role, key));
        return visible.length > 0 && <div className="nav-group" key={group}><p>{group}</p>
          {visible.map(key => <Link aria-current={active === key ? "page" : undefined} className={active === key ? "active" : ""} key={key} href={"/modules/" + key}>{catalog[key].title}</Link>)}
        </div>;
      })}
      <Link className={active === "reports" ? "active" : ""} href="/reports">Reports</Link>
      {isAdmin(user.role) && <Link className={active === "users" ? "active" : ""} href="/users">User accounts</Link>}
      </nav></details>
    </aside>
    <div className="workspace">
      <header><span>School administration</span><div><span><strong>{user.name}</strong><small>{user.role.toLowerCase().replaceAll("_", " ")}</small></span><form action={logout}><button className="icon secondary" aria-label="Sign out"><LogOut size={17}/></button></form></div></header>
      <main className="content">{children}</main>
    </div>
  </div>;
}
