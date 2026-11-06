import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

export const nepaliMonths = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export function nepaliDate(gregorian: string) {
  try {
    const converted = adToBs(gregorian);
    if (typeof converted !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(converted)) return null;
    const [year, month, day] = converted.split("-").map(Number);
    return {year, month, day, label:day + " " + nepaliMonths[month - 1] + " " + year + " BS"};
  } catch {
    return null;
  }
}

export function nepaliMonthStart(year: number, month: number) {
  return bsToAd(year + "-" + String(month).padStart(2,"0") + "-01");
}

export function nepalFiscalYear(date: NonNullable<ReturnType<typeof nepaliDate>>) {
  const year = date.month < 4 ? date.year - 1 : date.year;
  return {
    label:year + "/" + String(year + 1).slice(-2),
    start:nepaliMonthStart(year,4),
    endExclusive:nepaliMonthStart(year + 1,4)
  };
}
