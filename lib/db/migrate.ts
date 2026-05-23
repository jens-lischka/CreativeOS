import "dotenv/config";
import * as schema from "./schema";

const MIGRATIONS_FOLDER = "./drizzle";

export async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = (await import("postgres")).default;
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const parsed = new URL(url);
    // Try transaction pooler port (6543) first; if the URL already specifies a
    // port, respect it — the caller can override by adjusting the secret.
    const port = Number(parsed.port) || 5432;
    const client = postgres({
      host: parsed.hostname,
      port: port === 5432 ? 6543 : port,
      database: parsed.pathname.replace(/^\//, ""),
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      max: 1,
      prepare: false,
      ssl: "require",
    });
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    await client.end();
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(process.env.PGLITE_DATA_DIR);
    await client.waitReady;
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    await client.close();
  }
}

runMigrations()
  .then(() => {
    console.log("Migrations applied.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
