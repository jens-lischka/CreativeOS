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
- Phases 4–6: artifacts/reviews, closeout/memory/reporting, integrations.

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




Short answer: it depends what you're optimizing, and the catch is where the secret actually needs to be readable. A credential helps only the thing that can read it, and there are three different "things" in play here — they don't share secrets:

Where the secret lives	Who can read it	What it's good for
Claude Code environment (env var/secret on this web environment)	Me, in a session's container	Me running pnpm db:migrate && pnpm db:seed and verifying right now
GitHub Actions secret	A CI workflow on push/deploy	Automated, repeatable migrations in CI — secret never leaves GitHub
Host runtime (e.g. Vercel env, or the Supabase→Vercel integration)	The deployed app at runtime	The live app reading the DB in production
The key point: a secret you set in GitHub or in Supabase is not visible to this Claude Code session. GitHub Actions secrets are scoped to Actions runners; Supabase just holds the connection string/password, it doesn't inject env vars into other systems. So if I'm the one running the migration from here, the value has to be in the Claude Code environment — that's the only place my process reads from. (I also can't read GitHub secrets via my GitHub access — they're masked.)

Is the GitHub route "better"? For production automation, yes — running migrations from a GitHub Actions workflow on push, with the secret stored as a GitHub secret, is a clean, reproducible pattern (probably what you did before). It's better than a human/agent running migrations by hand. The tradeoff: we don't have such a workflow yet, and it only runs on push — it won't let me connect from this session to poke around and verify.

So the choice is really about how you want migrations to run.

Asked
Migration path
Asked
Migration path
How would you like Supabase migrations to run?

Paste it here now

Sounds good — go ahead and paste the Session pooler connection string (port 5432, with your password filled in). Let me confirm .env is gitignored first so the secret never gets committed.

Ran
Confirm .env is gitignored
DATABASE_URL=postgresql://postgres.rklzxvhrvmfhswaecyuk:iBtlBL80CWtUjtQk@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

.env is gitignored, and I see your connection string. I'll store it only in .env, never commit or echo it. Let me check how the db scripts load env and the connection precedence first.

Ran
Inspect env loading and connection precedence
.env exists (with PGLITE_DATA_DIR), migrate.ts loads dotenv and prefers DATABASE_URL. Let me read the db scripts to be sure none of them print the connection string, then add the secret to .env.


Read a file, ran a command
All scripts load .env via dotenv and none print the URL. Now I'll add the secret to .env (idempotently, without echoing it) and run the migration against Supabase.

Ran
Add DATABASE_URL to .env and run migrations against Supabase
A connection timeout — the migration couldn't reach the Supabase host at all. Let me diagnose whether this is a network-egress block (this environment uses an allowlist) versus a host/port issue.

Ran
Diagnose Supabase egress reachability
I found the blocker, and it's not your credentials — it's network egress. Here's the diagnosis:

DNS resolves the pooler host fine.
Port 5432 and 6543 (Postgres) both time out — blocked.
Port 443 (HTTPS) is reachable — both the pooler host and your project API answered (403, i.e. the connection succeeded, auth just wasn't provided).
So this Claude Code environment's network policy allows HTTPS (443) only and blocks raw Postgres ports. The connection string is correct; the sandbox simply can't open a Postgres connection out to Supabase. Let me revert the .env change so this session keeps working on PGlite.

Ran
Remove DATABASE_URL from .env to keep sandbox on PGlite
The good news: your credentials and connection string are correct. The blocker is purely this sandbox's egress policy (HTTPS-only), so I can't run the migration from here no matter what. There are three ways around it — all standard, and the data layer is already Supabase-ready so no code changes are needed:

GitHub Actions (what you did before, and it works): GitHub's runners have open egress and can reach Supabase:5432. I add a workflow that runs pnpm db:migrate (and seed on demand); you store DATABASE_URL as a GitHub Actions secret in the repo. Migrations run in CI, secret stays in GitHub.
Run it locally: on your machine, put the connection string in .env and run pnpm db:migrate && pnpm db:seed. One command, done — nothing more needed from me.
Open Postgres egress here: adjust this Claude Code environment's network policy to allow outbound port 5432 to the Supabase host (configured per code.claude.com/docs/en/claude-code-on-the-web). Then in a new session I can migrate, seed, and verify end-to-end from here.
One security note regardless of which you pick: that password is now in this chat's history, so I'd rotate it once you're set up (Supabase → Project Settings → Database → Reset database password) and use the fresh one in the secret store.

Asked
How to migrate
The sandbox can't reach Postgres (egress is HTTPS-only). How do you want to run the Supabase migration?

GitHub Actions workflow

I'll create the GitHub Actions workflow. Let me check package.json for the package manager, Node version, and any install hooks so the workflow matches the project.

Read
package.json
No packageManager field or install hooks, and pnpm only builds esbuild — clean. @supabase/supabase-js is already a dependency. I'll create a CI workflow that runs migrations where egress is open.


Created a file, edited a file, ran a command
Done — the workflow is pushed to claude/exciting-cori-Bu8Fh. Here's what's left, all on your side (the sandbox can't reach Postgres, but a GitHub runner can):

1. Add the secret — Repo → Settings → Secrets and variables → Actions → New repository secret:

Name: DATABASE_URL
Value: your Session-pooler string (use the rotated password — see below)
2. Get the workflow onto the default branch — workflow_dispatch and the push trigger only work once .github/workflows/db-migrate.yml is on main. So merge claude/exciting-cori-Bu8Fh into main (or tell me to open a PR — I won't without your say-so).

3. Run it — Actions tab → DB migrate (Supabase) → Run workflow → toggle seed ON for this first run (loads the demo data you asked for). It runs pnpm db:migrate then pnpm db:seed against Supabase. Future pushes to main that touch drizzle/** or lib/db/** re-run migrate only (no duplicate seeding).

4. Rotate the password — since the connection string was pasted in this chat, reset it at Supabase → Project Settings → Database → Reset database password, and store the new one in the GitHub secret.

Two notes:

The workflow fails fast with a clear message if the DATABASE_URL secret is missing, so it won't silently "succeed" against a throwaway DB.
Once migrated, your deployed app also needs DATABASE_URL in its host runtime env (Vercel, etc.) to read Supabase — separate from the CI secret.
If you'd like, I can open the PR to main for you, or move on to Phase 4 (artifacts, review/approval flow, and versioned deliverables). Which would you prefer?




