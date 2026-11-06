import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
const printable = (value:string) => value.replace(/[^\x20-\x7e\xa0-\xff]/g,"?");
export async function reportPdf(title:string, columns:string[], rows:string[][]) {
  const doc=await PDFDocument.create();
  const font=await doc.embedFont(StandardFonts.Helvetica);
  const bold=await doc.embedFont(StandardFonts.HelveticaBold);
  let page=doc.addPage([595,842]);
  let y=782;
  function heading() {
    page.drawText(printable(title),{x:42,y:800,size:19,font:bold,color:rgb(.12,.22,.42)});
    y=768;
  }
  heading();
  for (const [index,row] of rows.entries()) {
    const lines=row.map((value, i)=>printable(columns[i]+": "+value).slice(0,100));
    if (y-(lines.length+2)*13<42) {page=doc.addPage([595,842]);heading();}
    page.drawText("Record "+(index+1),{x:42,y,size:11,font:bold});
    y-=16;
    for (const line of lines) {page.drawText(line,{x:42,y,size:9,font});y-=13;}
    y-=8;
  }
  if (!rows.length) page.drawText("No records match this report.",{x:42,y,size:11,font});
  return doc.save();
}
