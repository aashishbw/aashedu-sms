"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "./password-actions";

export function ChangePassword({prompt}:{prompt?:string}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [error, action, pending] = useActionState(changePassword,"");
  useEffect(() => {
    if (!prompt) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("changePassword");
    window.history.replaceState(window.history.state,"",url);
    const key = "aashedu:password-reminder:" + prompt;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key,"shown");
    } catch {
      // The dialog can still open when browser storage is unavailable.
    }
    if (!dialog.current?.open) dialog.current?.showModal();
  },[prompt]);

  return <>
    <button type="button" className="secondary" onClick={()=>dialog.current?.showModal()}>Change password</button>
    <dialog ref={dialog} className="card password-dialog" aria-labelledby="password-dialog-title"
      onClose={()=>form.current?.reset()}>
      <h2 id="password-dialog-title">Change password</h2>
      <p className="muted">You’ll sign in again after saving a new password.</p>
      {error && <p className="alert" role="alert">{error}</p>}
      <form ref={form} action={action} className="stack">
        <label>Current password<input name="current" type="password" autoComplete="current-password" required maxLength={256}/></label>
        <label>New password<input name="next" type="password" autoComplete="new-password" required minLength={14} maxLength={256}/></label>
        <label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" required minLength={14} maxLength={256}/></label>
        <p className="muted">Use at least 14 characters.</p>
        <div className="actions">
          <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save password"}</button>
          <button type="button" className="secondary" onClick={()=>dialog.current?.close()}>Later</button>
        </div>
      </form>
    </dialog>
  </>;
}

