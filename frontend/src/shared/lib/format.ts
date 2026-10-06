const amountFormat = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Formats a money amount without a currency sign: `1 234,50`. */
export function formatAmount(amount: number): string {
  return amountFormat.format(amount);
}

/**
 * Formats a backend `LocalDate` (`YYYY-MM-DD`). Parsed as a local date on
 * purpose — `new Date("2026-09-01")` is UTC midnight and may show the day before.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}
