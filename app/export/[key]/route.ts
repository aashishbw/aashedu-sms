import { reportPdf } from "../../../lib/pdf";
import { currentUser } from "../../../lib/auth";
import { catalog, fieldKey, label } from "../../../lib/catalog";
import { canRead, listFields } from "../../../lib/permissions";
import { filters } from "../../../lib/filters";
import { records, display } from "../../../lib/records";
export async function GET(request: Request,{params}: {params:Promise<{key:string}>}) {
  const user = await currentUser();
  const {key} = await params;
  if (!user || key==="settings" || !Object.hasOwn(catalog,key) || !canRead(user.role,key)) return new Response("Unavailable",{status:404});
  const resource = catalog[key];
  const allowed = listFields(user.role,key);
  const fields = resource.fields.filter(field => (!allowed || allowed.includes(field.name)) && !(key==="leave" && ["STUDENT","TEACHER"].includes(user.role) && ["student","employee"].includes(field.name)));
  const query=new URL(request.url).searchParams;
  const q=query.get("q")?.slice(0,100);
  const pdf=query.get("format")==="pdf";
  const rows = await records(resource).findMany({
    where:filters(user,key,fields,{q,from:query.get("from") ?? undefined,to:query.get("to") ?? undefined}),
    select:Object.fromEntries(fields.map(f=>[fieldKey(f),true])),orderBy:[{createdAt:"desc"},{id:"asc"}],take:pdf ? 501 : 10001
  });
  if (pdf) {
    if (rows.length>500) return new Response("Filter the PDF to 500 records or fewer.",{status:422});
    const bytes=await reportPdf(resource.title,fields.map(f=>label(f.name)),rows.map(row=>fields.map(f=>display(row[fieldKey(f)]))));
    return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="'+key+'.pdf"',"Cache-Control":"private, no-store"}});
  }
  if (rows.length > 10000) return new Response("Filter the results to 10,000 records or fewer.",{status:422});
  const cell = (s: string) => '"' + (/^[\s]*[=+@-]|^[\t\r]/.test(s) ? "'" + s : s).replaceAll('"','""') + '"';
  const csv = [fields.map(f=>cell(label(f.name))).join(","),...rows.map(row=>fields.map(f=>cell(row[fieldKey(f)] == null ? "" : display(row[fieldKey(f)]))).join(","))].join("\r\n");
  return new Response("\ufeff" + csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="' + key + '.csv"',"Cache-Control":"private, no-store"}});
}
