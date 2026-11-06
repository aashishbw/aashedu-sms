"use server";
import sharp from "sharp";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "../../../lib/auth";
import { isAdmin } from "../../../lib/permissions";
import { institutionForm } from "../../../lib/institution-profile";
import { saveInstitution } from "../../../lib/institution";

const path="/settings/institution";
export async function updateInstitution(form:FormData) {
  if (!isAdmin((await requireUser()).role)) notFound();
  const parsed=institutionForm.safeParse(Object.fromEntries(
    Object.keys(institutionForm.shape).map(key=>[key,form.get(key)])
  ));
  if (!parsed.success) redirect(path+"?error=fields");

  const file=form.get("logo");
  let logo:Buffer|null|undefined=form.get("removeLogo")==="on" ? null : undefined;
  if (file instanceof File && file.size) {
    if (file.size>2*1024*1024 || !["image/png","image/jpeg"].includes(file.type)) redirect(path+"?error=logo");
    try {
      const image=sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:4096*4096});
      const metadata=await image.metadata();
      if (!["png","jpeg"].includes(metadata.format) || (metadata.pages ?? 1)>1) throw new Error("Invalid logo");
      logo=await image.rotate().resize(512,512,{fit:"inside",withoutEnlargement:true}).png().toBuffer();
    } catch { redirect(path+"?error=logo"); }
  }

  try { await saveInstitution(parsed.data,logo); }
  catch (error) {
    console.error("Institution profile update failed", error instanceof Error ? error.name : "UnknownError");
    redirect(path+"?error=save");
  }
  revalidatePath("/","layout");
  redirect(path+"?saved=1");
}

