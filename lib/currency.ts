export const defaultCurrency = "NPR";
export const currencyLabel = (currency = defaultCurrency) => currency === "NPR" ? "Rs." : currency;
export function formatMoney(amount: string | number, currency = defaultCurrency) {
  const value = typeof amount === "number"
    ? new Intl.NumberFormat("en", {minimumFractionDigits:2, maximumFractionDigits:2}).format(amount)
    : amount;
  return currencyLabel(currency) + " " + value;
}
