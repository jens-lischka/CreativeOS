# CreativeOS

> Not a PM tool. A memory system for creative work.

CreativeOS is a minimal, tier-aware creative work intelligence system. People give it explicit
inputs (via a command bar / quick actions) and it turns each into a **structured event**. The
append-only event log is the source of truth; everything users see is a projection of the work
graph (Initiative → Project → Workstream → Deliverable → Commitment → Action).

This repo is being built in testable vertical slices. See
`creative_work_intelligence_system.md` for the full product spec.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) + React 19, Tailwind v4
- **Drizzle ORM** with two interchangeable backends:
  - **PGlite** (in-process Postgres) for local dev and tests — zero external services
  - **Supabase Postgres** in production (set `DATABASE_URL`) — identical schema & migrations
- **Vitest** (unit + integration) and **Playwright** (e2e)

## Getting started

```bash
pnpm install
cp .env.example .env        # PGLITE_DATA_DIR=./.pglite by default
pnpm db:reset               # apply migrations + seed sample data
pnpm dev                    # http://localhost:3000  (redirects to /today)
```

To run against Supabase instead of PGlite, set `DATABASE_URL` (and the `NEXT_PUBLIC_SUPABASE_*`
keys) in `.env`, then `pnpm db:migrate`.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev / build / serve |
| `pnpm test` | Vitest unit + integration |
| `pnpm test:e2e` | Playwright e2e (requires browsers: `pnpm exec playwright install`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate a SQL migration from `lib/db/schema.ts` |
| `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:reset` | Apply migrations / seed / reset+seed |

## Layout

```
app/                 (app)/ route group: today, work, work/[id], work/new, files, reports
                     api/work-objects[...] route handlers
components/          client UI: command/quick-action forms, badges
lib/
  db/                Drizzle schema, client (PGlite ↔ Supabase), migrate/seed/reset
  domain/            work hierarchy, tiers, lifecycle state machine, role rights (§4,§6,§12,§13)
  events/            event types (Zod), pure projection reducers, transactional append+project
  queries.ts         read helpers for the views
  labels.ts          pure presentation helpers (incl. Project Log lines, §37)
drizzle/             generated SQL migrations
tests/               unit, integration (PGlite), e2e (Playwright)
```

## Build status (phased)

- **Phase 0 — Foundations:** scaffolding, DB, migrations/seed, test harness, CI. ✅
- **Phase 1 — Work graph + event log:** hierarchy, tiers, append-only events, transactional
  projection, Today/Work views, project log. ✅
- **Phase 2 — Explicit updates + LLM command bar:** next.
- Phases 3–6: tiering/gates, artifacts/reviews, closeout/memory/reporting, integrations.
