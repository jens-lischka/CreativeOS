import { getDb } from "../db";
import { authorizeEvent } from "../domain/gates";
import type { Tier } from "../domain/types";
import { getPersonRoles, getWorkObject } from "../queries";
import { appendEvent } from "./append";
import type { DomainEvent } from "./types";

// Thrown when a human gate (§14) or the rights matrix (§13) blocks an event.
export class GateError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "GateError";
  }
}

// Loads the work object's context and the actor's roles, runs the gate, and
// appends the event only if authorized. Used by every event-applying endpoint.
export async function applyEventAuthorized(
  workObjectId: string,
  event: DomainEvent,
  actorId: string | null,
) {
  const wo = await getWorkObject(workObjectId);
  if (!wo) throw new GateError(`Work object not found: ${workObjectId}`);

  const roles = actorId ? await getPersonRoles(actorId) : [];
  const decision = authorizeEvent(roles, event, {
    tier: (wo.tier as Tier | null) ?? null,
    status: wo.status,
    mode: wo.mode ?? null,
  });
  if (decision.action === "deny") throw new GateError(decision.reason);

  const db = await getDb();
  return appendEvent(db, workObjectId, event, actorId);
}

// Pre-authorizes a batch against the current context so the command bar never
// partially applies a set of events when one is denied.
export async function authorizeAll(
  workObjectId: string,
  events: DomainEvent[],
  actorId: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const wo = await getWorkObject(workObjectId);
  if (!wo) return { ok: false, reason: "Work object not found" };
  const roles = actorId ? await getPersonRoles(actorId) : [];
  const ctx = {
    tier: (wo.tier as Tier | null) ?? null,
    status: wo.status,
    mode: wo.mode ?? null,
  };
  for (const event of events) {
    const decision = authorizeEvent(roles, event, ctx);
    if (decision.action === "deny") return { ok: false, reason: decision.reason };
  }
  return { ok: true };
}
