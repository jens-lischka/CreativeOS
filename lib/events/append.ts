import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { events as eventsTable, timeEntries, workObjects } from "../db/schema";
import type { Tier } from "../domain/types";
import { applyEvent, type WorkObjectState } from "./reducers";
import type { DomainEvent, PayloadOf } from "./types";

// Creates a work object and records its first event in one transaction.
export async function createWorkObject(
  db: Database,
  payload: PayloadOf<"work_object_created">,
  actorId?: string | null,
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(workObjects)
      .values({
        type: payload.workObjectType,
        title: payload.title,
        tier: payload.tier ?? null,
        why: payload.why ?? null,
        parentId: payload.parentId ?? null,
        ownerId: payload.ownerId ?? null,
        requesterId: payload.requesterId ?? null,
        deciderId: payload.deciderId ?? null,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
        effortBudgetHours: payload.effortBudgetHours ?? null,
        definitionOfDone: payload.definitionOfDone ?? null,
        status: payload.initialStatus ?? "requested",
        mode: payload.tier === 1 ? "exploration" : null,
      })
      .returning({ id: workObjects.id });

    await tx.insert(eventsTable).values({
      workObjectId: row.id,
      type: "work_object_created",
      actorId: actorId ?? null,
      payload,
    });

    return { id: row.id };
  });
}

// Appends an event to an existing work object and projects it onto the current
// state in the same transaction. The event log stays the source of truth (§37).
export async function appendEvent(
  db: Database,
  workObjectId: string,
  event: DomainEvent,
  actorId?: string | null,
): Promise<{ eventId: string; status: WorkObjectState["status"] }> {
  if (event.type === "work_object_created") {
    throw new Error("Use createWorkObject for work_object_created events");
  }

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(workObjects)
      .where(eq(workObjects.id, workObjectId));
    if (!current) {
      throw new Error(`Work object not found: ${workObjectId}`);
    }

    const currentState: WorkObjectState = {
      type: current.type,
      tier: (current.tier as Tier | null) ?? null,
      status: current.status,
      mode: current.mode ?? null,
      title: current.title,
      totalHours: 0,
      blocked: false,
      reviewRequested: false,
    };
    const next = applyEvent(currentState, event);

    const [eventRow] = await tx
      .insert(eventsTable)
      .values({
        workObjectId,
        type: event.type,
        actorId: actorId ?? null,
        payload: event.payload,
      })
      .returning({ id: eventsTable.id });

    await tx
      .update(workObjects)
      .set({ status: next.status, tier: next.tier, mode: next.mode, updatedAt: new Date() })
      .where(eq(workObjects.id, workObjectId));

    if (event.type === "time_logged") {
      await tx.insert(timeEntries).values({
        workObjectId,
        personId: actorId ?? null,
        hours: event.payload.hours,
        note: event.payload.note ?? null,
        eventId: eventRow.id,
      });
    }

    return { eventId: eventRow.id, status: next.status };
  });
}
