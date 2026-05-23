import { NextResponse } from "next/server";
import { applyEventAuthorized, GateError } from "@/lib/events/apply";
import { parseEvent } from "@/lib/events/types";

// Applies events the user confirmed after an ambiguous parse.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { targetWorkObjectId, events, actorId } = (body ?? {}) as {
    targetWorkObjectId?: string;
    events?: { type: string; payload: unknown }[];
    actorId?: string | null;
  };

  if (!targetWorkObjectId || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "Missing target or events" }, { status: 400 });
  }

  try {
    for (const raw of events) {
      const event = parseEvent(raw.type, raw.payload ?? {});
      await applyEventAuthorized(targetWorkObjectId, event, actorId ?? null);
    }
  } catch (err) {
    if (err instanceof GateError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to apply events" },
      { status: 400 },
    );
  }

  return NextResponse.json({ applied: true });
}
