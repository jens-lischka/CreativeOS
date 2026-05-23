import { asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { artifacts, events, people, roleAssignments, timeEntries, workObjects } from "./db/schema";
import type { Role } from "./domain/types";

export interface WorkObjectListItem {
  id: string;
  type: string;
  tier: number | null;
  status: string;
  title: string;
  ownerName: string | null;
  updatedAt: Date;
}

export async function listWorkObjects(): Promise<WorkObjectListItem[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: workObjects.id,
      type: workObjects.type,
      tier: workObjects.tier,
      status: workObjects.status,
      title: workObjects.title,
      ownerName: people.name,
      updatedAt: workObjects.updatedAt,
    })
    .from(workObjects)
    .leftJoin(people, eq(workObjects.ownerId, people.id))
    .orderBy(desc(workObjects.updatedAt));
  return rows;
}

export async function getWorkObject(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(workObjects).where(eq(workObjects.id, id));
  return row ?? null;
}

export interface LogEntry {
  id: string;
  type: string;
  payload: unknown;
  actorName: string | null;
  createdAt: Date;
}

// The Project Log (§37): what happened, when, who did it — from explicit events.
export async function getEventLog(workObjectId: string): Promise<LogEntry[]> {
  const db = await getDb();
  return db
    .select({
      id: events.id,
      type: events.type,
      payload: events.payload,
      actorName: people.name,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(people, eq(events.actorId, people.id))
    .where(eq(events.workObjectId, workObjectId))
    .orderBy(asc(events.createdAt));
}

export async function getChildren(parentId: string): Promise<WorkObjectListItem[]> {
  const db = await getDb();
  return db
    .select({
      id: workObjects.id,
      type: workObjects.type,
      tier: workObjects.tier,
      status: workObjects.status,
      title: workObjects.title,
      ownerName: people.name,
      updatedAt: workObjects.updatedAt,
    })
    .from(workObjects)
    .leftJoin(people, eq(workObjects.ownerId, people.id))
    .where(eq(workObjects.parentId, parentId))
    .orderBy(asc(workObjects.createdAt));
}

export async function listPeople() {
  const db = await getDb();
  return db.select().from(people).orderBy(asc(people.name));
}

export async function getPersonRoles(personId: string): Promise<Role[]> {
  const db = await getDb();
  const rows = await db
    .select({ role: roleAssignments.role })
    .from(roleAssignments)
    .where(eq(roleAssignments.personId, personId));
  return rows.map((r) => r.role as Role);
}

export interface BudgetSummary {
  approvedHours: number | null;
  confirmedHours: number;
  remainingHours: number | null;
  varianceHours: number | null;
}

// Basic budget awareness (§24): approved effort vs confirmed time. Time is
// organizational memory, not a productivity weapon (§23).
export async function getBudgetSummary(workObjectId: string): Promise<BudgetSummary> {
  const db = await getDb();
  const [wo] = await db
    .select({ approved: workObjects.effortBudgetHours })
    .from(workObjects)
    .where(eq(workObjects.id, workObjectId));
  const [agg] = await db
    .select({ total: sql<number>`coalesce(sum(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .where(eq(timeEntries.workObjectId, workObjectId));

  const approvedHours = wo?.approved ?? null;
  const confirmedHours = Number(agg?.total ?? 0);
  const remainingHours = approvedHours == null ? null : approvedHours - confirmedHours;
  const varianceHours =
    approvedHours == null ? null : confirmedHours - approvedHours;

  return { approvedHours, confirmedHours, remainingHours, varianceHours };
}

export interface ArtifactItem {
  id: string;
  name: string;
  url: string;
  fileType: string | null;
  version: number;
  createdAt: Date;
}

export async function getArtifacts(workObjectId: string): Promise<ArtifactItem[]> {
  const db = await getDb();
  return db
    .select({
      id: artifacts.id,
      name: artifacts.name,
      url: artifacts.url,
      fileType: artifacts.fileType,
      version: artifacts.version,
      createdAt: artifacts.createdAt,
    })
    .from(artifacts)
    .where(eq(artifacts.workObjectId, workObjectId))
    .orderBy(asc(artifacts.version), asc(artifacts.createdAt));
}

export interface MemoryCard {
  id: string;
  title: string;
  type: string;
  tier: number | null;
  totalHours: number;
  artifactCount: number;
  revisionRounds: number;
  createdAt: Date;
  closedAt: Date;
  reflection: string;
  whatWorked: string | null;
  whatToImprove: string | null;
}

// Assembles a memory card for a closed work object from its events and aggregates.
export async function getMemoryCard(workObjectId: string): Promise<MemoryCard | null> {
  const db = await getDb();

  const [wo] = await db.select().from(workObjects).where(eq(workObjects.id, workObjectId));
  if (!wo || wo.status !== "closed") return null;

  const [hoursRow] = await db
    .select({ total: sql<number>`coalesce(sum(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .where(eq(timeEntries.workObjectId, workObjectId));

  const [artifactRow] = await db
    .select({ n: count() })
    .from(artifacts)
    .where(eq(artifacts.workObjectId, workObjectId));

  const [revisionsRow] = await db
    .select({ n: count() })
    .from(events)
    .where(
      sql`${events.workObjectId} = ${workObjectId}
        AND ${events.type} = 'review_outcome'
        AND ${events.payload}->>'decision' IN ('needs_revision', 'rejected')`,
    );

  const closeEvent = await db
    .select({ payload: events.payload, createdAt: events.createdAt })
    .from(events)
    .where(sql`${events.workObjectId} = ${workObjectId} AND ${events.type} = 'project_closed'`)
    .orderBy(desc(events.createdAt))
    .limit(1);

  if (closeEvent.length === 0) return null;
  const cp = closeEvent[0].payload as Record<string, unknown>;

  return {
    id: wo.id,
    title: wo.title,
    type: wo.type,
    tier: wo.tier,
    totalHours: Number(hoursRow?.total ?? 0),
    artifactCount: Number(artifactRow?.n ?? 0),
    revisionRounds: Number(revisionsRow?.n ?? 0),
    createdAt: wo.createdAt,
    closedAt: closeEvent[0].createdAt,
    reflection: String(cp.reflection ?? ""),
    whatWorked: cp.whatWorked != null ? String(cp.whatWorked) : null,
    whatToImprove: cp.whatToImprove != null ? String(cp.whatToImprove) : null,
  };
}

export interface StatusCount {
  status: string;
  count: number;
}

export async function getStatusCounts(): Promise<StatusCount[]> {
  const db = await getDb();
  const rows = await db
    .select({ status: workObjects.status, n: count() })
    .from(workObjects)
    .groupBy(workObjects.status);
  return rows.map((r) => ({ status: r.status, count: Number(r.n) }));
}

export interface ClosedSummary {
  id: string;
  title: string;
  type: string;
  tier: number | null;
  totalHours: number;
  revisionRounds: number;
  closedAt: Date;
  reflection: string;
}

export async function getRecentlyClosed(days = 30): Promise<ClosedSummary[]> {
  const db = await getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const closeEvents = await db
    .select({
      workObjectId: events.workObjectId,
      payload: events.payload,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(sql`${events.type} = 'project_closed' AND ${events.createdAt} >= ${since}`)
    .orderBy(desc(events.createdAt));

  if (closeEvents.length === 0) return [];

  const ids = closeEvents.map((e) => e.workObjectId);
  const wos = await db
    .select({ id: workObjects.id, title: workObjects.title, type: workObjects.type, tier: workObjects.tier })
    .from(workObjects)
    .where(sql`${workObjects.id} = ANY(${ids})`);

  const hoursRows = await db
    .select({
      workObjectId: timeEntries.workObjectId,
      total: sql<number>`coalesce(sum(${timeEntries.hours}), 0)`,
    })
    .from(timeEntries)
    .where(sql`${timeEntries.workObjectId} = ANY(${ids})`)
    .groupBy(timeEntries.workObjectId);

  const revisionRows = await db
    .select({ workObjectId: events.workObjectId, n: count() })
    .from(events)
    .where(
      sql`${events.workObjectId} = ANY(${ids})
        AND ${events.type} = 'review_outcome'
        AND ${events.payload}->>'decision' IN ('needs_revision', 'rejected')`,
    )
    .groupBy(events.workObjectId);

  const woMap = Object.fromEntries(wos.map((w) => [w.id, w]));
  const hoursMap = Object.fromEntries(hoursRows.map((r) => [r.workObjectId, Number(r.total)]));
  const revMap = Object.fromEntries(revisionRows.map((r) => [r.workObjectId, Number(r.n)]));

  return closeEvents
    .filter((e) => woMap[e.workObjectId])
    .map((e) => {
      const wo = woMap[e.workObjectId];
      const cp = e.payload as Record<string, unknown>;
      return {
        id: wo.id,
        title: wo.title,
        type: wo.type,
        tier: wo.tier,
        totalHours: hoursMap[wo.id] ?? 0,
        revisionRounds: revMap[wo.id] ?? 0,
        closedAt: e.createdAt,
        reflection: String(cp.reflection ?? ""),
      };
    });
}

export interface AtRiskItem {
  id: string;
  title: string;
  type: string;
  tier: number | null;
  status: string;
  risk: "overdue" | "over_budget" | "blocked";
  detail: string;
}

const ACTIVE_FOR_RISK = [
  "shaping", "exploring", "ready_for_production",
  "in_production", "in_review", "waiting",
] as const;

export async function getAtRiskItems(): Promise<AtRiskItem[]> {
  const db = await getDb();
  const now = new Date();

  const active = await db
    .select({
      id: workObjects.id,
      title: workObjects.title,
      type: workObjects.type,
      tier: workObjects.tier,
      status: workObjects.status,
      dueAt: workObjects.dueAt,
      effortBudgetHours: workObjects.effortBudgetHours,
    })
    .from(workObjects)
    .where(sql`${workObjects.status} = ANY(${ACTIVE_FOR_RISK})`);

  if (active.length === 0) return [];

  const ids = active.map((w) => w.id);
  const hoursRows = await db
    .select({
      workObjectId: timeEntries.workObjectId,
      total: sql<number>`coalesce(sum(${timeEntries.hours}), 0)`,
    })
    .from(timeEntries)
    .where(sql`${timeEntries.workObjectId} = ANY(${ids})`)
    .groupBy(timeEntries.workObjectId);
  const hoursMap = Object.fromEntries(hoursRows.map((r) => [r.workObjectId, Number(r.total)]));

  const risks: AtRiskItem[] = [];
  for (const w of active) {
    if (w.status === "waiting") {
      risks.push({ id: w.id, title: w.title, type: w.type, tier: w.tier, status: w.status, risk: "blocked", detail: "Waiting on a blocker" });
      continue;
    }
    if (w.dueAt && w.dueAt < now) {
      risks.push({ id: w.id, title: w.title, type: w.type, tier: w.tier, status: w.status, risk: "overdue", detail: `Due ${w.dueAt.toLocaleDateString()}` });
      continue;
    }
    const hours = hoursMap[w.id] ?? 0;
    if (w.effortBudgetHours != null && hours > w.effortBudgetHours) {
      risks.push({ id: w.id, title: w.title, type: w.type, tier: w.tier, status: w.status, risk: "over_budget", detail: `${hours}h logged vs ${w.effortBudgetHours}h approved` });
    }
  }
  return risks;
}

// The current version number is 1 + how many non-approval review outcomes have occurred.
// This lets the add-artifact form default to the correct version without needing the
// full event log.
export async function getCurrentVersion(workObjectId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(events)
    .where(
      sql`${events.workObjectId} = ${workObjectId}
        AND ${events.type} = 'review_outcome'
        AND ${events.payload}->>'decision' IN ('needs_revision', 'rejected')`,
    );
  return 1 + Number(row?.n ?? 0);
}
