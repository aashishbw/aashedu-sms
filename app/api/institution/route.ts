import { publicBranding } from "../../../lib/institution";

export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await publicBranding(), {headers:{"Cache-Control":"no-store"}});
}

