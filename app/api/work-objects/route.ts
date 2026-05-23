import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createWorkObject } from "@/lib/events/append";
import { payloadSchemas } from "@/lib/events/types";
import { listWorkObjects } from "@/lib/queries";

export async function GET() {
  const items = await listWorkObjects();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { actorId, ...rest } = (body ?? {}) as Record<string, unknown>;
  const parsed = payloadSchemas.work_object_created.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const db = await getDb();
  const result = await createWorkObject(db, parsed.data, (actorId as string) ?? null);
  return NextResponse.json(result, { status: 201 });
}
