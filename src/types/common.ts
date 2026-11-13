/** Integer paise (1 INR = 100 paise). Money is never stored as a float. */
export type Paise = number;

/** ISO 8601 timestamp, e.g. "2026-11-12T08:00:00.000Z". */
export type ISODateString = string;

export type Id = string;

export type Gender = "women" | "men" | "unisex" | "kids";

export interface RatingSummary {
  /** 0 to 5, one decimal place. */
  average: number;
  count: number;
}
