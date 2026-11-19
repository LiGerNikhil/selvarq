import type { Connection } from "mongoose";
import { env } from "@/lib/env";

interface MongoCache {
  connection: Connection | null;
  promise: Promise<Connection> | null;
}

const globalCache = globalThis as typeof globalThis & { __selvarqMongo?: MongoCache };

/** True when the app is configured to persist through MongoDB. */
export function isMongoEnabled(): boolean {
  return (process.env.DATA_SOURCE ?? "mock") === "mongo";
}

/**
 * Connects once per server process and reuses the connection. Mongoose buffers
 * commands until the connection is ready, so early writes are not dropped.
 */
export async function connectDb(): Promise<Connection> {
  const cache = (globalCache.__selvarqMongo ??= { connection: null, promise: null });
  if (cache.connection) return cache.connection;

  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'DATA_SOURCE="mongo" requires MONGODB_URI. Add the Atlas connection string to .env.local and restart the server.',
    );
  }

  cache.promise ??= (async () => {
    const { default: mongoose } = await import("mongoose");
    const instance = await mongoose.connect(uri, {
      dbName: env.MONGODB_DB,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
    return instance.connection;
  })().catch((error: unknown) => {
    cache.promise = null;
    throw error;
  });

  cache.connection = await cache.promise;
  return cache.connection;
}

/** Closes the shared connection. Used by scripts and graceful shutdown. */
export async function disconnectDb(): Promise<void> {
  const cache = globalCache.__selvarqMongo;
  if (!cache?.connection) return;
  await cache.connection.close();
  cache.connection = null;
  cache.promise = null;
}
