import Link from "next/link";
import { LayoutDashboard, LogOut, ChevronDown, UsersRound, GraduationCap, BriefcaseBusiness, Layers3, ChartNoAxesColumn, Settings2, Building2, UserRoundCog } from "lucide-react";
import type { Role } from "@prisma/client";
import { publicBranding, readInstitution } from "../lib/institution";
import { InstitutionMark } from "./institution-brand";
import { ChangePassword } from "./change-password";
import { logout } from "./login/actions";
import { catalog } from "../lib/catalog";
import { canRead, isAdmin } from "../lib/permissions";
const groups = [
  { label:"People", icon:UsersRound, keys:["students","enrollments"] },
  { label:"Academics", icon:GraduationCap, keys:["years","classes","sections","subjects","teaching","timetable","attendance","exams","exam-subjects","marks","grading","homework"] },
  { label:"HRMS & Payroll", icon:BriefcaseBusiness, keys:["employees","staff-attendance","leave","payroll"] },
  { label:"Operations", icon:Layers3, keys:["fee-categories","fee-structures","fees","payments","books","loans","vehicles","transport","riders","communication"] }
];
export async function Shell({ user, active, children, promptPassword }: { user: {name: string; role: Role}; active?: string; children: React.ReactNode; promptPassword?:string }) {
  const [brand,profile]=await Promise.all([publicBranding(),readInstitution()]);
  return <div className="frame">
    <aside className="workspace-sidebar">
      <Link href="/" className="brand workspace-brand">
        <InstitutionMark logoUrl={brand.logoUrl}/>
        <div><strong className="institution-name">{profile?.shortName || brand.name}</strong><small>School workspace</small></div>
      </Link>
      <details className="navigation workspace-nav" open>
        <summary>Workspace <ChevronDown size={15} aria-hidden="true"/></summary>
        <nav aria-label="Workspace">
          <Link aria-current={!active ? "page" : undefined} className={!active ? "active" : ""} href="/">
            <LayoutDashboard size={17} aria-hidden="true"/> Overview
          </Link>
          <p className="workspace-nav-label">Modules</p>
          {groups.map(({label,icon:Icon,keys}) => {
            const visible = keys.filter(key => canRead(user.role, key));
            if (!visible.length) return null;
            return <details className="workspace-nav-group" key={label} open={active ? visible.includes(active) : label==="People"}>
              <summary><Icon size={17} aria-hidden="true"/><span>{label}</span><ChevronDown size={14} aria-hidden="true"/></summary>
              <div className="workspace-nav-items">
                {visible.map(key => <Link aria-current={active===key ? "page" : undefined} className={active===key ? "active" : ""} key={key} href={"/modules/" + key}>{catalog[key].title}</Link>)}
              </div>
            </details>;
          })}
          <p className="workspace-nav-label">Workspace tools</p>
          <Link aria-current={active==="reports" ? "page" : undefined} className={active==="reports" ? "active" : ""} href="/reports"><ChartNoAxesColumn size={17} aria-hidden="true"/> Reports</Link>
          {isAdmin(user.role) && <Link aria-current={active==="institution" ? "page" : undefined} className={active==="institution" ? "active" : ""} href="/settings/institution"><Settings2 size={17} aria-hidden="true"/> Institution Profile</Link>}
          {user.role==="SUPER_ADMIN" && <Link aria-current={active==="institutions" ? "page" : undefined} className={active==="institutions" ? "active" : ""} href="/institutions"><Building2 size={17} aria-hidden="true"/> Schools &amp; Colleges</Link>}
          {isAdmin(user.role) && <Link aria-current={active==="users" ? "page" : undefined} className={active==="users" ? "active" : ""} href="/users"><UserRoundCog size={17} aria-hidden="true"/> User accounts</Link>}
        </nav>
      </details>
    </aside>
    <div className="workspace">
      <header><strong className="institution-name">{brand.name}</strong><div><span><strong>{user.name}</strong><small>{user.role.toLowerCase().replaceAll("_", " ")}</small></span><ChangePassword prompt={promptPassword}/><form action={logout}><button className="icon secondary" aria-label="Sign out"><LogOut size={17}/></button></form></div></header>
      <main className="content"><div className="print-institution">
        <InstitutionMark logoUrl={brand.logoUrl}/><div><strong>{brand.name}</strong>
        <p>{[profile?.address,profile?.phone,profile?.email,profile?.website].filter(Boolean).join(" | ")}</p></div>
      </div>{children}</main>
    </div>
  </div>;
}
