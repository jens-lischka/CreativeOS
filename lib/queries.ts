import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { events, people, workObjects } from "./db/schema";

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
