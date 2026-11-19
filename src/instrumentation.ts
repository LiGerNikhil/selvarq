/**
 * Runs once per server instance, before the first request is handled.
 *
 * With DATA_SOURCE=mongo this restores the persisted working set from MongoDB
 * (and creates the `SEED_*` access accounts when demo data is disabled, which
 * is the production default).
 *
 * In mock mode the demo catalogue stays in memory, but the `SEED_*` accounts
 * are still created so the real admin and seller logins work during local
 * development. Mock mode never writes to MongoDB, so nothing leaks into the
 * production database.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { isMongoEnabled } = await import("@/lib/db/connection");

  try {
    if (isMongoEnabled()) {
      const { hydrateFromDb } = await import("@/lib/db/hydrate");
      await hydrateFromDb();
    } else {
      const { ensureProductionAccess } = await import("@/lib/db/production-seed");
      await ensureProductionAccess();
    }
  } catch (error) {
    // Keep serving with in-memory data rather than failing every request.
    console.error("[db] Startup seeding failed; falling back to in-memory data.", error);
  }
}
