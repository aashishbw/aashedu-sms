"use client";
import { useFormStatus } from "react-dom";
export function Submit({ text, confirm }: { text: string; confirm?: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={confirm ? "secondary" : undefined} onClick={event => {
    if (confirm && !window.confirm("Archive this record?")) event.preventDefault();
  }}>{pending ? "Saving…" : text}</button>;
}
