import { z } from "zod";
import { WORK_OBJECT_TYPES, WORK_STATUSES } from "../domain/types";

// Every meaningful project action becomes a structured event (§rule 11, §37).
// Each event has a `type` discriminator and a validated `payload`.
export const EVENT_TYPES = [
  "work_object_created",
  "tier_assigned",
  "status_changed",
  "production_locked",
  "progress_updated",
  "time_logged",
  "review_requested",
  "blocker_raised",
  "scope_change_proposed",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const tierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const payloadSchemas = {
  work_object_created: z.object({
    workObjectType: z.enum(WORK_OBJECT_TYPES),
    title: z.string().min(1),
    tier: tierSchema.nullable().optional(),
    why: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    ownerId: z.string().uuid().nullable().optional(),
    requesterId: z.string().uuid().nullable().optional(),
    deciderId: z.string().uuid().nullable().optional(),
    dueAt: z.string().nullable().optional(),
    effortBudgetHours: z.number().nonnegative().nullable().optional(),
    definitionOfDone: z.string().optional(),
    initialStatus: z.enum(WORK_STATUSES).optional(),
  }),
  tier_assigned: z.object({ tier: tierSchema }),
  status_changed: z.object({
    to: z.enum(WORK_STATUSES),
    from: z.enum(WORK_STATUSES).optional(),
  }),
  production_locked: z.object({ note: z.string().optional() }),
  progress_updated: z.object({
    note: z.string().min(1),
    status: z.enum(WORK_STATUSES).optional(),
  }),
  time_logged: z.object({ hours: z.number().positive(), note: z.string().optional() }),
  review_requested: z.object({ note: z.string().optional() }),
  blocker_raised: z.object({ reason: z.string().min(1) }),
  scope_change_proposed: z.object({
    description: z.string().min(1),
    estimateHours: z.number().nonnegative().optional(),
  }),
} satisfies Record<EventType, z.ZodTypeAny>;

export type PayloadOf<T extends EventType> = z.infer<(typeof payloadSchemas)[T]>;

export type DomainEvent = {
  [T in EventType]: { type: T; payload: PayloadOf<T> };
}[EventType];

export function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

// Validate a (type, payload) pair into a typed DomainEvent. Throws on invalid input.
export function parseEvent(type: string, payload: unknown): DomainEvent {
  if (!isEventType(type)) {
    throw new Error(`Unknown event type: ${type}`);
  }
  const parsed = payloadSchemas[type].parse(payload);
  return { type, payload: parsed } as DomainEvent;
}
