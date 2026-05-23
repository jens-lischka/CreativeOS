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
