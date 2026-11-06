import { publicBranding } from "../../lib/institution";
import { InstitutionMark } from "../institution-brand";
import { login } from "./actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{error},brand]=await Promise.all([searchParams,publicBranding()]);
  return <main className="login"><section className="card login-card">
    <div className="brand"><InstitutionMark logoUrl={brand.logoUrl}/><div>
      <h1 className="institution-name">{brand.name}</h1>
      <p className="muted">{brand.configured ? "School Management System" : "Access your school workspace."}</p>
    </div></div>
    <h2>Sign in</h2>
    {error && <p role="alert" className="alert">{error === "limited" ? "Too many attempts. Try again in 15 minutes." : "Sign-in failed. Check your email and password."}</p>}
    <form action={login} className="stack">
      <label>Email<input name="email" type="email" required autoComplete="username"/></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password"/></label>
      <button>Sign in</button>
    </form>
    <p className="muted login-credit">Powered by AashEdu SMS</p>
  </section></main>;
}
