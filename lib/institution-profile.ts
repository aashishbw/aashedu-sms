import { z } from "zod";

export const defaultName = "AashEdu School Management System";
export const themeColor = z.string().regex(/^#[0-9a-f]{6}$/i);
const optional = (limit: number) => z.string().trim().max(limit);
export const institutionForm = z.object({
  institutionType: z.enum(["School", "College"]),
  name: z.string().trim().min(1).max(160),
  shortName: optional(40),
  address: optional(400),
  phone: optional(60),
  email: z.union([z.literal(""), z.email().max(254)]),
  website: z.union([z.literal(""), z.url({protocol:/^https?$/}).max(255)]),
  registrationNumber: optional(80),
  headName: optional(120),
  academicYear: optional(40),
  primaryColor: themeColor,
  secondaryColor: themeColor,
  currency: z.string().regex(/^[A-Z]{3}$/),
  timezone: z.string().max(80).refine(value => {
    try { new Intl.DateTimeFormat("en", {timeZone:value}); return true; } catch { return false; }
  })
});
export type InstitutionForm = z.infer<typeof institutionForm>;
export type InstitutionProfile = {
  [Key in keyof InstitutionForm]: InstitutionForm[Key] | null;
} & { hasLogo: boolean };

