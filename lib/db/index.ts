import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

// One query API, two backends: PGlite (in-process Postgres) for local/dev/test,
// and postgres.js against Supabase when DATABASE_URL is set. The Drizzle schema and
// migrations are identical for both.
export type Database = PgliteDatabase<typeof schema>;

type Holder = typeof globalThis & { __creativeosDb?: Promise<Database> };

async function create(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = (await import("postgres")).default;
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const client = postgres(url, { prepare: false });
    return drizzle(client, { schema }) as unknown as Database;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(process.env.PGLITE_DATA_DIR);
  await client.waitReady;
  return drizzle(client, { schema });
}

export function getDb(): Promise<Database> {
  const holder = globalThis as Holder;
  if (!holder.__creativeosDb) {
    holder.__creativeosDb = create();
  }
  return holder.__creativeosDb;
}

export { schema };
