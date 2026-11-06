import type { Metadata } from "next";
import "./style.css";
export const metadata: Metadata = { title: "AashEdu School Management System", description: "School administration workspace" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
