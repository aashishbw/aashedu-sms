import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { publicBranding, readInstitution, readLogo } from "./institution";
const printable = (value:string) => value.replace(/[^\x20-\x7e\xa0-\xff]/g,"?");
export async function reportPdf(title:string, columns:string[], rows:string[][]) {
  const doc=await PDFDocument.create();
  const font=await doc.embedFont(StandardFonts.Helvetica);
  const bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const [brand,profile]=await Promise.all([publicBranding(),readInstitution()]);
  const logoBytes=brand.logoUrl ? await readLogo() : null;
  const logo=logoBytes ? await doc.embedPng(logoBytes) : null;
  const headerLines=[profile?.address,[profile?.phone,profile?.email,profile?.website].filter(Boolean).join(" | ")].filter(Boolean);
  const ink=brand.primaryColor ? rgb(...([1,3,5].map(i=>parseInt(brand.primaryColor!.slice(i,i+2),16)/510) as [number,number,number])) : rgb(.12,.22,.42);
  function fit(text:string,size:number,width:number,face=font) {
    let line=printable(text);
    while (face.widthOfTextAtSize(line,size)>width) line=line.slice(0,-1);
    return line;
  }
  let page=doc.addPage([595,842]);
  let y=782;
  function heading() {
    const x=logo ? 98 : 42;
    if (logo) page.drawImage(logo,{x:42,y:757,...logo.scaleToFit(42,42)});
    page.drawText(fit(brand.name,15,553-x,bold),{x,y:800,size:15,font:bold,color:ink});
    for (const [index,line] of headerLines.entries())
      page.drawText(fit(line!,9,553-x),{x,y:784-index*13,size:9,font});
    page.drawText(fit(title,17,511,bold),{x:42,y:728,size:17,font:bold,color:ink});
    y=701;
  }
  heading();
  for (const [index,row] of rows.entries()) {
    const lines=row.map((value, i)=>fit(columns[i]+": "+value,9,511));
    if (y-(lines.length+2)*13<42) {page=doc.addPage([595,842]);heading();}
    page.drawText("Record "+(index+1),{x:42,y,size:11,font:bold});
    y-=16;
    for (const line of lines) {page.drawText(line,{x:42,y,size:9,font});y-=13;}
    y-=8;
  }
  if (!rows.length) page.drawText("No records match this report.",{x:42,y,size:11,font});
  return doc.save();
}
