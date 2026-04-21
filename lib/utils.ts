import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function toMonthInput(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, monthIndex - 1, 1));
}

export function addMonthsToMonthInput(month: string, monthsToAdd: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  return toMonthInput(new Date(year, monthIndex - 1 + monthsToAdd, 1));
}

export function buildRecentMonths(month: string, total: number) {
  return Array.from({ length: total }, (_, index) => addMonthsToMonthInput(month, -index));
}

export function monthBounds(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
  return { start, end };
}
