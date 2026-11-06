import { GraduationCap } from "lucide-react";
import { login } from "./actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="login"><section className="card login-card">
    <div className="brand"><GraduationCap/> AashEdu School Management System</div>
    <h1>Sign in</h1><p className="muted">Access your school workspace.</p>
    {error && <p role="alert" className="alert">{error === "limited" ? "Too many attempts. Try again in 15 minutes." : "Sign-in failed. Check your email and password."}</p>}
    <form action={login} className="stack">
      <label>Email<input name="email" type="email" required autoComplete="username"/></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password"/></label>
      <button>Sign in</button>
    </form>
  </section></main>;
}
