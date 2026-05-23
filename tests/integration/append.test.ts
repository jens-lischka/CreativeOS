import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/lib/db/schema";
import { appendEvent, createWorkObject } from "@/lib/events/append";

let db: PgliteDatabase<typeof schema>;

beforeAll(async () => {
  const client = new PGlite();
  await client.waitReady;
  db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

describe("append + project (event sourcing)", () => {
  it("creates a work object and writes its first event", async () => {
    const { id } = await createWorkObject(db, {
      workObjectType: "project",
      title: "Teaser",
      tier: 2,
    });

    const rows = await db.select().from(schema.workObjects).where(eq(schema.workObjects.id, id));
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("requested");

    const log = await db.select().from(schema.events).where(eq(schema.events.workObjectId, id));
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe("work_object_created");
  });

  it("projects status changes and records a time entry", async () => {
    const { id } = await createWorkObject(db, { workObjectType: "deliverable", title: "Deck" });

    await appendEvent(db, id, { type: "status_changed", payload: { to: "in_production" } });
    await appendEvent(db, id, { type: "time_logged", payload: { hours: 3, note: "build" } });

    const [row] = await db.select().from(schema.workObjects).where(eq(schema.workObjects.id, id));
    expect(row.status).toBe("in_production");

    const log = await db.select().from(schema.events).where(eq(schema.events.workObjectId, id));
    expect(log.map((e) => e.type)).toEqual([
      "work_object_created",
      "status_changed",
      "time_logged",
    ]);

    const time = await db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.workObjectId, id));
    expect(time).toHaveLength(1);
    expect(time[0].hours).toBe(3);
  });

  it("rejects appending to a missing work object", async () => {
    await expect(
      appendEvent(db, "00000000-0000-0000-0000-000000000000", {
        type: "time_logged",
        payload: { hours: 1 },
      }),
    ).rejects.toThrow(/not found/);
  });
});
