import { readLogo } from "../../../../lib/institution";

export const dynamic = "force-dynamic";
export async function GET() {
  const logo=await readLogo();
  if (!logo) return new Response(null,{status:404});
  return new Response(new Uint8Array(logo),{headers:{
    "Content-Type":"image/png",
    "X-Content-Type-Options":"nosniff",
    "Cache-Control":"no-store",
    "Content-Security-Policy":"default-src 'none'; sandbox"
  }});
}

