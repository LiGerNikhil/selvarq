import { applyAdminDocuments, adminDocuments } from "@/lib/admin-store";
import { applyAccountDocuments, accountDocuments } from "@/lib/demo-account-store";
import { applyMerchantDocuments, merchantDocuments } from "@/lib/demo-merchant-store";
import { applyOrderRequestDocuments, orderRequestDocuments } from "@/lib/demo-order-requests";
import { applyOrderDocuments, orderDocuments } from "@/lib/repo/orders";
import { demoDataEnabled } from "@/lib/demo-data";
import { isMongoEnabled } from "./connection";
import { DOMAIN_META_KIND, loadDomain, markDomainSeeded, saveDomain } from "./entities";
import { ensureProductionAccess } from "./production-seed";
import type { DataDomain, EntityInput, EntityRecord } from "./types";

interface DomainDefinition {
  domain: DataDomain;
  /** Current in-memory state as persistable records. */
  snapshot: () => EntityInput[];
  /** Replaces the in-memory state with records read from MongoDB. */
  apply: (records: EntityRecord[]) => void;
}

const DOMAINS: DomainDefinition[] = [
  { domain: "admin", snapshot: adminDocuments, apply: applyAdminDocuments },
  { domain: "merchant", snapshot: merchantDocuments, apply: applyMerchantDocuments },
  { domain: "accounts", snapshot: accountDocuments, apply: applyAccountDocuments },
  { domain: "orders", snapshot: orderDocuments, apply: applyOrderDocuments },
  { domain: "orderRequests", snapshot: orderRequestDocuments, apply: applyOrderRequestDocuments },
];

interface HydrationState {
  promise: Promise<void> | null;
}

const globalHydration = globalThis as typeof globalThis & { __selvarqHydration?: HydrationState };

/**
 * Loads the persisted working set once per server process.
 *
 * With demo data enabled, an unseeded domain starts from the demo content the
 * mock source shows. With demo data disabled (the production default), domains
 * start empty and only the `SEED_*` access accounts are created. In both cases a
 * seeded domain replaces the in-memory state, which is what makes edits —
 * including deletions — survive a restart.
 */
export function hydrateFromDb(): Promise<void> {
  const state = (globalHydration.__selvarqHydration ??= { promise: null });
  state.promise ??= run().catch((error: unknown) => {
    state.promise = null;
    throw error;
  });
  return state.promise;
}

async function run(): Promise<void> {
  if (!isMongoEnabled()) return;

  const demo = demoDataEnabled();
  let seeded = 0;
  for (const definition of DOMAINS) {
    const records = await loadDomain(definition.domain);
    const marked = records.some((record) => record.kind === DOMAIN_META_KIND);

    if (records.length === 0) {
      // Brand-new domain. Only demo mode fills it; production starts empty.
      if (demo) {
        await saveDomain(definition.domain, definition.snapshot());
        seeded += 1;
      }
      await markDomainSeeded(definition.domain);
      continue;
    }

    definition.apply(records.filter((record) => record.kind !== DOMAIN_META_KIND));
    // A domain written before the marker existed is adopted as-is, never reseeded.
    if (!marked) await markDomainSeeded(definition.domain);
  }

  if (!demo) await ensureProductionAccess();

  console.info(
    `[db] Hydrated ${DOMAINS.length} domain(s) from MongoDB${seeded ? `, seeded ${seeded} demo` : ""}.`,
  );
}
