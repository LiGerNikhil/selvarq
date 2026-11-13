import { enIN } from "date-fns/locale";
import { format, formatDistanceToNowStrict, isSameMonth, parseISO } from "date-fns";
import type { ISODateString, Paise } from "@/types";

const LOCALE = "en-IN";

const inrWhole = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrFraction = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plainNumber = new Intl.NumberFormat(LOCALE);

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}

/**
 * Formats paise as INR with Indian digit grouping.
 * Whole-rupee amounts drop the decimals: 129900 -> "₹1,299"; 129950 -> "₹1,299.50".
 */
export function formatINR(paise: Paise, options?: { decimals?: "auto" | "always" }): string {
  const rupees = paise / 100;
  const useFraction = options?.decimals === "always" || paise % 100 !== 0;
  return (useFraction ? inrFraction : inrWhole).format(rupees);
}

/** 1284 -> "1,284"; 1284567 -> "12,84,567". */
export function formatNumber(value: number): string {
  return plainNumber.format(value);
}

/** Percent off the MRP, rounded down so we never overstate a saving. 0 when there is none. */
export function discountPercent(mrp: Paise, price: Paise): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.floor(((mrp - price) / mrp) * 100);
}

function toDate(value: ISODateString | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

/** "12 Nov 2026" */
export function formatDate(value: ISODateString | Date): string {
  return format(toDate(value), "d MMM yyyy", { locale: enIN });
}

/** "12 Nov 2026, 1:28 pm" */
export function formatDateTime(value: ISODateString | Date): string {
  return format(toDate(value), "d MMM yyyy, h:mm a", { locale: enIN });
}

/** "3 days ago" */
export function formatRelative(value: ISODateString | Date): string {
  return formatDistanceToNowStrict(toDate(value), { addSuffix: true, locale: enIN });
}

/** "Mon 16 to Wed 18 Nov", or "Fri 27 Nov to Tue 1 Dec" across months. */
export function formatDeliveryWindow(from: ISODateString | Date, to: ISODateString | Date): string {
  const start = toDate(from);
  const end = toDate(to);
  const startFmt = isSameMonth(start, end) ? "EEE d" : "EEE d MMM";
  return `${format(start, startFmt, { locale: enIN })} to ${format(end, "EEE d MMM", { locale: enIN })}`;
}
