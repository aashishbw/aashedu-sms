import type { Metadata } from "next";
import "./style.css";
import { publicBranding } from "../lib/institution";
import { institutionTheme } from "../lib/theme";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return {title:(await publicBranding()).name,description:"School administration workspace"};
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const {primaryColor,secondaryColor}=await publicBranding();
  return <html lang="en" style={institutionTheme(primaryColor,secondaryColor)}><body>{children}</body></html>;
}
