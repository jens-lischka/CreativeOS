import "dotenv/config";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Resets the local PGlite database, then re-applies migrations and seed.
// For a DATABASE_URL (Supabase) target this only re-runs migrate + seed.
const dataDir = process.env.PGLITE_DATA_DIR;
if (!process.env.DATABASE_URL && dataDir) {
  rmSync(dataDir, { recursive: true, force: true });
  console.log(`Removed PGlite data dir: ${dataDir}`);
}

execSync("pnpm db:migrate", { stdio: "inherit" });
execSync("pnpm db:seed", { stdio: "inherit" });
