import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite and the postgres driver ship native/wasm assets and resolve their own
  // files at runtime; keep them out of the server bundle so paths resolve correctly.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
};

export default nextConfig;
