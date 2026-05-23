import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appendEvent } from "@/lib/events/append";
import { createAnthropicCommandLLM, parseCommand } from "@/lib/intel/command-parser";
import { listWorkObjects } from "@/lib/queries";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, currentWorkObjectId, actorId } = (body ?? {}) as {
    text?: string;
    currentWorkObjectId?: string | null;
    actorId?: string | null;
  };

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Missing command text" }, { status: 400 });
  }

  const llm = createAnthropicCommandLLM();
  if (!llm) {
    return NextResponse.json({
      applied: false,
      needsConfirmation: true,
      configured: false,
      summary:
        "Natural-language parsing isn't configured (set ANTHROPIC_API_KEY). Use the quick-action form instead.",
      events: [],
    });
  }

  const items = await listWorkObjects();
  const candidates = items.map((i) => ({ id: i.id, title: i.title }));

  let parsed;
  try {
    parsed = await parseCommand(llm, { text, candidates, currentWorkObjectId: currentWorkObjectId ?? null });
  } catch {
    return NextResponse.json({
      applied: false,
      needsConfirmation: true,
      summary: "Could not parse that update. Try the quick-action form.",
      events: [],
    });
  }

  const target = parsed.targetWorkObjectId ?? currentWorkObjectId ?? null;
  const serializable = parsed.events.map((e) => ({ type: e.type, payload: e.payload }));

  // Only mutate when we have a target and the parse is unambiguous.
  if (parsed.needsConfirmation || !target || serializable.length === 0) {
    return NextResponse.json({
      applied: false,
      needsConfirmation: true,
      configured: true,
      targetWorkObjectId: target,
      events: serializable,
      summary: parsed.summary,
    });
  }

  const db = await getDb();
  for (const event of parsed.events) {
    await appendEvent(db, target, event, actorId ?? null);
  }

  return NextResponse.json({
    applied: true,
    targetWorkObjectId: target,
    events: serializable,
    summary: parsed.summary,
  });
}
