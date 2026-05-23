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
- **Phase 2 — Explicit updates + LLM command bar:** free-text command bar parsed by Claude
  (`claude-opus-4-7`, tool use) into structured events, with a confirm-before-apply fallback;
  budget burn on work detail. Set `ANTHROPIC_API_KEY` to enable parsing. ✅
- **Phase 3 — Tiering, modes & gates:** tier suggestion + PM/CD-confirmed assignment (§3),
  exploration→production lock (§7), tier-aware lifecycle transitions (§12), and the §13/§14
  rights matrix enforced on every event-applying endpoint (anyone can raise reality; only
  authorized roles change commitments); scope proposals show a neutral trade-off (§24). ✅
- **Phase 4 — Artifacts, review/approval flow & versioned deliverables:** artifact table with
  versioned file/link references; `artifact_added` and `review_outcome` event types; review
  outcome gate (creative lead/PM/CD only); approved → delivered, needs_revision → back to
  in_production with auto version bump; version badge on work detail; review panel shown when
  status is `in_review`. ✅
- **Phase 5 — Closeout, memory & reporting:** `project_closed` event (reflection, what worked,
  what to improve) gated to PM; `CloseoutForm` shown on `closing` work; `MemoryCard` rendered on
  `closed` work; Reports page with Pulse (active/in-review/at-risk/closed counts), risk signals
  (overdue, over-budget, blocked), and recently-closed memory cards. ✅
- Phase 6: integrations.

### Connecting Supabase

The data layer uses PGlite locally and switches to Supabase whenever `DATABASE_URL`
is set (identical schema/migrations). To point at Supabase:

1. Get the **Session pooler** connection string (Supabase → Project Settings → Database;
   port `5432`, IPv4) and add your DB password.
2. Run migrations where Postgres egress is open:
   - **CI:** add `DATABASE_URL` as a GitHub Actions repo secret, then run the
     **DB migrate (Supabase)** workflow (`.github/workflows/db-migrate.yml`) — toggle
     `seed` on for the first run to load demo data. The workflow lives on the default
     branch once merged.
   - **Local:** put `DATABASE_URL` in `.env` and run `pnpm db:migrate && pnpm db:seed`.
3. Set `DATABASE_URL` in your app host's runtime env so the deployed app reads Supabase.

(The Claude Code web sandbox allows HTTPS only, so it can't open a Postgres connection
to Supabase directly — run migrations from CI or locally.)

The Today page and each work detail page have a command bar. Type a plain-language update
(e.g. *"Finished v1 of the teaser, ready for review, 2h"*) and Claude parses it into structured
events. Unambiguous updates apply directly; ambiguous ones show a confirm step. Without
`ANTHROPIC_API_KEY`, the bar points you to the structured quick-action form instead.




