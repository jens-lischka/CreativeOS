import { defineConfig } from "drizzle-kit";

// Generates plain PostgreSQL migrations from the Drizzle schema. The same SQL
// applies to both PGlite (local/test) and Supabase Postgres (production).
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
