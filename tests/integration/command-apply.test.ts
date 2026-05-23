import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/lib/db/schema";
import { appendEvent, createWorkObject } from "@/lib/events/append";
import { parseCommand, type RawParse } from "@/lib/intel/command-parser";

let db: PgliteDatabase<typeof schema>;

beforeAll(async () => {
  const client = new PGlite();
  await client.waitReady;
  db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

// End-to-end through the parser (with a stubbed LLM) into the event log.
describe("command → events → projection", () => {
  it("applies a multi-event free-text update to the resolved work object", async () => {
    const { id } = await createWorkObject(db, { workObjectType: "project", title: "Teaser", tier: 2 });

    const fakeLLM = async (): Promise<RawParse> => ({
      targetWorkObjectId: id,
      needsConfirmation: false,
      summary: "Finished v1, ready for review, 2h",
      events: [
        { type: "progress_updated", note: "Finished v1", status: "in_review" },
        { type: "time_logged", hours: 2 },
        { type: "review_requested" },
      ],
    });

    const parsed = await parseCommand(fakeLLM, {
      text: "Finished v1 of the teaser, ready for review, 2h",
      candidates: [{ id, title: "Teaser" }],
    });
    expect(parsed.needsConfirmation).toBe(false);

    for (const event of parsed.events) {
      await appendEvent(db, parsed.targetWorkObjectId!, event, null);
    }

    const [row] = await db.select().from(schema.workObjects).where(eq(schema.workObjects.id, id));
    expect(row.status).toBe("in_review");

    const time = await db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.workObjectId, id));
    expect(time).toHaveLength(1);
    expect(time[0].hours).toBe(2);

    const log = await db.select().from(schema.events).where(eq(schema.events.workObjectId, id));
    expect(log.map((e) => e.type)).toEqual([
      "work_object_created",
      "progress_updated",
      "time_logged",
      "review_requested",
    ]);
  });
});
