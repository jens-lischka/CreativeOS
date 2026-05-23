import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appendEvent } from "@/lib/events/append";
import { parseEvent } from "@/lib/events/types";
import { getEventLog } from "@/lib/queries";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const log = await getEventLog(id);
  return NextResponse.json({ log });
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, payload, actorId } = (body ?? {}) as {
    type?: string;
    payload?: unknown;
    actorId?: string;
  };

  if (typeof type !== "string") {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  try {
    const event = parseEvent(type, payload ?? {});
    const db = await getDb();
    const result = await appendEvent(db, id, event, actorId ?? null);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to append event" },
      { status: 400 },
    );
  }
}
