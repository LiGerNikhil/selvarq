/**
 * Whether the seeded demo catalogue, accounts and orders should be loaded.
 *
 * Mock mode keeps the demo content so the storefront is usable offline. Mongo
 * mode defaults to an empty production database: only the accounts configured
 * through `SEED_*` environment variables are created. Set `SEED_DEMO_DATA=true`
 * to seed the demo content into MongoDB as well (useful for staging).
 */
export function demoDataEnabled(): boolean {
  const explicit = process.env.SEED_DEMO_DATA?.trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  // `NEXT_PUBLIC_DATA_SOURCE` mirrors `DATA_SOURCE` for client bundles, where
  // server-only variables are not available. Keep the two in sync.
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? process.env.DATA_SOURCE ?? "mock";
  return source !== "mongo";
}
