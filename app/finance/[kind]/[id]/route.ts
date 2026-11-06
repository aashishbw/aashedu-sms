import { defaultCurrency, formatMoney } from "../../../../lib/currency";
import { currentUser } from "../../../../lib/auth";
import { canRead } from "../../../../lib/permissions";
import { db } from "../../../../lib/db";
import { reportPdf } from "../../../../lib/pdf";
import { display } from "../../../../lib/records";
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;id:string}>}) {
  const user=await currentUser();
  const {kind,id}=await params;
  if (!user || !["fees","payments"].includes(kind) || !canRead(user.role,kind)) return new Response("Unavailable",{status:404});
  const payment=kind==="payments" ? await db.payment.findUnique({where:{id}}) : null;
  if(kind==="payments" && !payment) return new Response("Unavailable",{status:404});
  const invoice=await db.invoice.findUnique({where:{id:payment?.invoiceId ?? id},include:{student:true,Payment_invoice:true}});
  if(!invoice) return new Response("Unavailable",{status:404});
  const settings=await db.schoolSetting.findFirst({where:{archived:false}});
  const paid=invoice.Payment_invoice.reduce((sum,row)=>sum.plus(row.amount),invoice.amount.minus(invoice.amount));
  const currency=settings?.currency ?? defaultCurrency;
  const money=(value:{toFixed(digits:number):string})=>formatMoney(value.toFixed(2), currency);
  const columns=["School","Student","Admission number","Invoice reference","Due date","Invoice amount","Discount","Total paid","Balance"];
  const row=[settings?.name ?? "School",invoice.student.name,invoice.student.admissionNo,invoice.reference,display(invoice.due),money(invoice.amount),money(invoice.discount),money(paid),money(invoice.amount.minus(invoice.discount).minus(paid))];
  if(payment){columns.push("Receipt reference","Payment date","Payment amount");row.push(payment.reference,display(payment.day),money(payment.amount));}
  const bytes=await reportPdf(payment?"Payment receipt":"Student fee invoice",columns,[row]);
  return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":payment?'attachment; filename="receipt.pdf"':'attachment; filename="invoice.pdf"',"Cache-Control":"private, no-store"}});
}
