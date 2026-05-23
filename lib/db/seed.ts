import "dotenv/config";
import { getDb } from "./index";
import { people, roleAssignments } from "./schema";
import { appendEvent, createWorkObject } from "../events/append";

// Seeds a small, realistic graph so the Today/Work views and project log have
// something to show. Idempotent-ish: clears the seeded tables first.
async function runSeed(): Promise<void> {
  const db = await getDb();

  await db.delete(roleAssignments);
  await db.delete(people);

  const [pm, designer, cd] = await db
    .insert(people)
    .values([
      { email: "pm@creativeos.dev", name: "Priya (PM)" },
      { email: "designer@creativeos.dev", name: "Dana (Designer)" },
      { email: "cd@creativeos.dev", name: "Cleo (Creative Director)" },
    ])
    .returning();

  await db.insert(roleAssignments).values([
    { personId: pm.id, role: "project_manager" },
    { personId: designer.id, role: "designer" },
    { personId: cd.id, role: "creative_director" },
  ]);

  const initiative = await createWorkObject(
    db,
    {
      workObjectType: "initiative",
      title: "Leadership Summit",
      why: "Flagship internal event needing a coherent creative platform.",
      requesterId: pm.id,
      ownerId: pm.id,
      tier: 1,
    },
    pm.id,
  );

  const project = await createWorkObject(
    db,
    {
      workObjectType: "project",
      title: "Summit Teaser Video",
      why: "Build anticipation ahead of the summit.",
      parentId: initiative.id,
      ownerId: designer.id,
      deciderId: cd.id,
      tier: 2,
      effortBudgetHours: 42,
      definitionOfDone: "Approved 60s teaser, captioned, delivered in 16:9 and 9:16.",
    },
    pm.id,
  );

  const deck = await createWorkObject(
    db,
    {
      workObjectType: "deliverable",
      title: "Keynote Deck",
      parentId: initiative.id,
      ownerId: designer.id,
      tier: 3,
    },
    pm.id,
  );

  // A little history so the project log and time data are non-empty.
  await appendEvent(db, project.id, { type: "status_changed", payload: { to: "shaping" } }, pm.id);
  await appendEvent(
    db,
    project.id,
    { type: "progress_updated", payload: { note: "Drafted three creative routes.", status: "exploring" } },
    designer.id,
  );
  await appendEvent(db, project.id, { type: "time_logged", payload: { hours: 6, note: "Route exploration" } }, designer.id);

  await appendEvent(db, deck.id, { type: "status_changed", payload: { to: "in_production" } }, designer.id);
  await appendEvent(db, deck.id, { type: "time_logged", payload: { hours: 2 } }, designer.id);
  await appendEvent(db, deck.id, { type: "review_requested", payload: { note: "First pass ready" } }, designer.id);

  console.log("Seed complete:", { initiative: initiative.id, project: project.id, deck: deck.id });
}

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
