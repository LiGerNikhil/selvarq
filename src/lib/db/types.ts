/**
 * Domains that own a slice of mutable application state. Each domain is
 * persisted as its own set of records in MongoDB.
 */
export type DataDomain = "admin" | "merchant" | "accounts" | "orders" | "orderRequests";

/** A record ready to be written to MongoDB. */
export interface EntityInput {
  /** Logical collection inside the domain, e.g. "products" or "settings". */
  kind: string;
  /** Stable identifier inside the kind, e.g. a product id. */
  entityId: string;
  /** Keeps ordered lists (banners, stories) in their display order. */
  position?: number;
  data: unknown;
}

/** A record loaded from MongoDB. */
export interface EntityRecord {
  domain: DataDomain;
  kind: string;
  entityId: string;
  position: number;
  data: unknown;
}

/** Groups loaded records by kind, preserving the persisted order. */
export function groupRecords(records: EntityRecord[]): Map<string, EntityRecord[]> {
  const grouped = new Map<string, EntityRecord[]>();
  for (const record of [...records].sort((a, b) => a.position - b.position)) {
    const list = grouped.get(record.kind) ?? [];
    list.push(record);
    grouped.set(record.kind, list);
  }
  return grouped;
}
