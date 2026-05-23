import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { ROLES, WORK_MODES, WORK_OBJECT_TYPES, WORK_STATUSES } from "../domain/types";

export const workObjectTypeEnum = pgEnum("work_object_type", WORK_OBJECT_TYPES);
export const workStatusEnum = pgEnum("work_status", WORK_STATUSES);
export const workModeEnum = pgEnum("work_mode", WORK_MODES);
export const roleEnum = pgEnum("role", ROLES);

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roleAssignments = pgTable(
  "role_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
  },
  (t) => [index("role_assignments_person_idx").on(t.personId)],
);

// The single consistent work graph (§4). `parentId` is self-referential so the same
// table holds initiatives through actions; not every level is required.
export const workObjects = pgTable(
  "work_objects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: workObjectTypeEnum("type").notNull(),
    parentId: uuid("parent_id").references((): import("drizzle-orm/pg-core").AnyPgColumn => workObjects.id, {
      onDelete: "set null",
    }),
    tier: integer("tier"),
    status: workStatusEnum("status").notNull().default("requested"),
    mode: workModeEnum("mode"),
    // §5 "minimum definition of work" kernel:
    title: text("title").notNull(), // what is being made
    why: text("why"), // why it is needed
    requesterId: uuid("requester_id").references(() => people.id),
    ownerId: uuid("owner_id").references(() => people.id),
    deciderId: uuid("decider_id").references(() => people.id),
    dueAt: timestamp("due_at", { withTimezone: true }),
    effortBudgetHours: doublePrecision("effort_budget_hours"),
    definitionOfDone: text("definition_of_done"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("work_objects_parent_idx").on(t.parentId),
    index("work_objects_status_idx").on(t.status),
    index("work_objects_owner_idx").on(t.ownerId),
  ],
);

// The Project Log (§37): append-only, the source of truth. Every meaningful
// project action becomes a structured event (§rule 11).
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workObjectId: uuid("work_object_id").notNull().references(() => workObjects.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(),
    actorId: uuid("actor_id").references(() => people.id),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("events_work_object_idx").on(t.workObjectId),
    index("events_created_idx").on(t.createdAt),
  ],
);

// Time is organizational memory, not a weapon (§23). One official way to log it.
export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workObjectId: uuid("work_object_id").notNull().references(() => workObjects.id, {
      onDelete: "cascade",
    }),
    personId: uuid("person_id").references(() => people.id),
    hours: doublePrecision("hours").notNull(),
    note: text("note"),
    eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
    loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("time_entries_work_object_idx").on(t.workObjectId)],
);

// Artifacts: versioned file/link references attached to work objects (§Phase 4).
// Each artifact records which review version it belongs to so reviewers can see
// exactly what was submitted at each round.
export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workObjectId: uuid("work_object_id")
      .notNull()
      .references(() => workObjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    fileType: text("file_type"),
    version: integer("version").notNull().default(1),
    eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("artifacts_work_object_idx").on(t.workObjectId),
    index("artifacts_version_idx").on(t.workObjectId, t.version),
  ],
);

export type WorkObjectRow = typeof workObjects.$inferSelect;
export type NewWorkObjectRow = typeof workObjects.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type PersonRow = typeof people.$inferSelect;
export type ArtifactRow = typeof artifacts.$inferSelect;
