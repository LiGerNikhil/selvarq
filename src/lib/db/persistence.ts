import { saveDomain } from "./entities";
import type { DataDomain, EntityInput } from "./types";

type Serializer = () => EntityInput[];

interface PersistenceQueue {
  dirty: Map<DataDomain, Serializer>;
  chain: Promise<void>;
  scheduled: boolean;
}

const globalQueue = globalThis as typeof globalThis & { __selvarqPersistence?: PersistenceQueue };

function queue(): PersistenceQueue {
  return (globalQueue.__selvarqPersistence ??= { dirty: new Map(), chain: Promise.resolve(), scheduled: false });
}

/**
 * Marks a domain as changed and schedules a write. Mutations stay synchronous:
 * the store keeps serving reads from memory while MongoDB catches up. Calls made
 * in the same tick are coalesced into one write per domain.
 */
export function markDirty(domain: DataDomain, serialize: Serializer): void {
  if ((process.env.DATA_SOURCE ?? "mock") !== "mongo") return;

  const state = queue();
  state.dirty.set(domain, serialize);
  if (state.scheduled) return;

  state.scheduled = true;
  state.chain = state.chain.then(async () => {
    state.scheduled = false;
    const entries = [...state.dirty];
    state.dirty.clear();
    for (const [dirtyDomain, serializer] of entries) {
      try {
        await saveDomain(dirtyDomain, serializer());
      } catch (error) {
        console.error(`[db] Could not persist "${dirtyDomain}" to MongoDB.`, error);
      }
    }
  });
}

/** Waits for every queued write. Used at boot and by the seed script. */
export async function flushPersistence(): Promise<void> {
  const state = globalQueue.__selvarqPersistence;
  if (!state) return;
  await state.chain;
}
