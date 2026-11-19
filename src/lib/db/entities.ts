import type { Model } from "mongoose";
import { connectDb } from "./connection";
import type { DataDomain, EntityInput, EntityRecord } from "./types";

interface EntityDocument {
  domain: DataDomain;
  kind: string;
  entityId: string;
  position: number;
  data: unknown;
}

/**
 * Every mutable record is stored as one document keyed by (domain, kind,
 * entityId). That keeps products, orders, accounts and admin settings as
 * separate documents while letting each in-memory store save itself with one
 * call, without rewriting its synchronous call sites.
 */
async function entityModel(): Promise<Model<EntityDocument>> {
  const connection = await connectDb();
  const existing = connection.models.Entity as Model<EntityDocument> | undefined;
  if (existing) return existing;

  const { Schema } = await import("mongoose");
  const schema = new Schema<EntityDocument>(
    {
      domain: { type: String, required: true, index: true },
      kind: { type: String, required: true },
      entityId: { type: String, required: true },
      position: { type: Number, default: 0 },
      data: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true, minimize: false, versionKey: false },
  );
  schema.index({ domain: 1, kind: 1, entityId: 1 }, { unique: true });
  return connection.model<EntityDocument>("Entity", schema);
}

/** Loads every record for one domain, ordered by their persisted position. */
export async function loadDomain(domain: DataDomain): Promise<EntityRecord[]> {
  const Entity = await entityModel();
  const documents = await Entity.find({ domain }).sort({ kind: 1, position: 1 }).lean().exec();
  return documents.map((document) => ({
    domain: document.domain,
    kind: document.kind,
    entityId: document.entityId,
    position: document.position ?? 0,
    data: document.data,
  }));
}

/** Marker record that proves a domain was seeded at least once. */
export const DOMAIN_META_KIND = "__meta";

/** Records that a domain has been initialised, without touching its data. */
export async function markDomainSeeded(domain: DataDomain): Promise<void> {
  const Entity = await entityModel();
  await Entity.updateOne(
    { domain, kind: DOMAIN_META_KIND, entityId: "seeded" },
    { $set: { position: 0, data: { seededAt: new Date().toISOString() } } },
    { upsert: true },
  );
}

/**
 * Writes the full current state of a domain: upserts every record and removes
 * records that no longer exist. The in-memory store stays the working copy, so
 * this is a replace-in-place sync rather than a per-field patch.
 */
export async function saveDomain(domain: DataDomain, inputs: EntityInput[]): Promise<void> {
  const Entity = await entityModel();

  if (inputs.length) {
    await Entity.bulkWrite(
      inputs.map((input) => ({
        updateOne: {
          filter: { domain, kind: input.kind, entityId: input.entityId },
          update: { $set: { position: input.position ?? 0, data: input.data } },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  const keep = new Set(inputs.map((input) => `${input.kind}\u0000${input.entityId}`));
  const existing = await Entity.find({ domain }, { kind: 1, entityId: 1 }).lean().exec();
  const stale = existing
    .filter((document) => document.kind !== DOMAIN_META_KIND && !keep.has(`${document.kind}\u0000${document.entityId}`))
    .map((document) => ({ kind: document.kind, entityId: document.entityId }));

  if (stale.length) {
    await Entity.deleteMany({ domain, $or: stale });
  }
}
