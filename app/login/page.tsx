import { publicBranding } from "../../lib/institution";
import { InstitutionMark } from "../institution-brand";
import { login } from "./actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{error},brand]=await Promise.all([searchParams,publicBranding()]);
  return <main className="login">
    <section className="login-identity" aria-labelledby="login-institution">
      <InstitutionMark logoUrl={brand.logoUrl}/>
      <h1 className="institution-name" id="login-institution">{brand.name}</h1>
      <p>{brand.configured ? "School Management System" : "Access your school workspace."}</p>
    </section>
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-form">
        <h2 id="login-title">Sign in</h2>
        {error && <p role="alert" className="alert">{error === "limited" ? "Too many attempts. Try again in 15 minutes." : "Sign-in failed. Check your email and password."}</p>}
        <form action={login} className="stack">
          <label>Email<input name="email" type="email" required autoComplete="username"/></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password"/></label>
          <button>Sign in</button>
        </form>
        <p className="login-credit">Powered by AashEdu SMS</p>
      </div>
    </section>
  </main>;
}

