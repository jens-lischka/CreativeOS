import Anthropic from "@anthropic-ai/sdk";
import { WORK_STATUSES } from "../domain/types";
import { parseEvent, type DomainEvent } from "../events/types";

// Phase 2: the command bar accepts free text (spec §1, §41) and the Claude API parses
// it into structured events. The LLM call is injected as a `CommandLLM` so the
// mapping from the model's flat output to validated DomainEvents stays a pure,
// deterministic function (`interpretRawParse`) that we golden-set test without network.

export interface CommandInput {
  text: string;
  candidates: { id: string; title: string }[];
  currentWorkObjectId?: string | null;
}

// The flat per-event shape the model fills via tool use. Per-type fields are
// validated downstream by `parseEvent` (Zod).
export interface RawEvent {
  type: string;
  note?: string;
  hours?: number;
  status?: string;
  reason?: string;
  description?: string;
  estimateHours?: number;
}

export interface RawParse {
  targetWorkObjectId: string | null;
  needsConfirmation: boolean;
  summary: string;
  events: RawEvent[];
}

export interface ParsedCommand {
  targetWorkObjectId: string | null;
  events: DomainEvent[];
  needsConfirmation: boolean;
  summary: string;
}

function rawEventToPayload(r: RawEvent): Record<string, unknown> | null {
  switch (r.type) {
    case "progress_updated":
      return r.note ? { note: r.note, status: r.status } : null;
    case "time_logged":
      return typeof r.hours === "number" ? { hours: r.hours, note: r.note } : null;
    case "review_requested":
      return { note: r.note };
    case "blocker_raised":
      return r.reason ? { reason: r.reason } : null;
    case "status_changed":
      return r.status ? { to: r.status } : null;
    case "scope_change_proposed":
      return r.description ? { description: r.description, estimateHours: r.estimateHours } : null;
    default:
      return null;
  }
}

// Pure: map the model's raw parse into validated DomainEvents. Anything ambiguous,
// unresolved, or invalid forces confirmation so a wrong parse never silently mutates
// state (spec: ambiguous parses fall back to a structured form).
export function interpretRawParse(raw: RawParse): ParsedCommand {
  let needsConfirmation =
    Boolean(raw.needsConfirmation) || raw.targetWorkObjectId == null || raw.events.length === 0;

  const events: DomainEvent[] = [];
  for (const r of raw.events) {
    const payload = rawEventToPayload(r);
    if (!payload) {
      needsConfirmation = true;
      continue;
    }
    try {
      events.push(parseEvent(r.type, payload));
    } catch {
      needsConfirmation = true;
    }
  }
  if (events.length === 0) needsConfirmation = true;

  return {
    targetWorkObjectId: raw.targetWorkObjectId,
    events,
    needsConfirmation,
    summary: raw.summary ?? "",
  };
}

export type CommandLLM = (input: CommandInput) => Promise<RawParse>;

const SYSTEM_PROMPT = `You convert a creative team member's plain-language work update into structured CreativeOS events.

Rules:
- Only emit events from this list, with these fields:
  - progress_updated: note (required), status (optional)
  - time_logged: hours (number, required), note (optional)
  - review_requested: note (optional)
  - blocker_raised: reason (required)
  - status_changed: status (required)
  - scope_change_proposed: description (required), estimateHours (optional)
- A single update can produce several events. "Finished v1, ready for review, 2h" =>
  progress_updated(note, status=in_review) + time_logged(hours=2) + review_requested.
- A scope change is always a proposal (scope_change_proposed), never an applied change.
- Resolve the target work object to one id from the provided candidates. If the input
  references a current work object, prefer it. If you cannot confidently pick one target,
  set targetWorkObjectId to null and needsConfirmation to true.
- Set needsConfirmation to true whenever the target or the intent is ambiguous.
- Never judge creative quality, taste, or originality. Only structure what was stated.
- Valid status values: ${WORK_STATUSES.join(", ")}.`;

const TOOL: Anthropic.Tool = {
  name: "record_work_updates",
  description: "Record the structured events parsed from a plain-language work update.",
  input_schema: {
    type: "object",
    properties: {
      targetWorkObjectId: {
        type: ["string", "null"],
        description: "The id of the target work object from the candidates, or null if unclear.",
      },
      needsConfirmation: {
        type: "boolean",
        description: "True if the target or intent is ambiguous and a human should confirm.",
      },
      summary: { type: "string", description: "A one-line summary of what was understood." },
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "progress_updated",
                "time_logged",
                "review_requested",
                "blocker_raised",
                "status_changed",
                "scope_change_proposed",
              ],
            },
            note: { type: "string" },
            hours: { type: "number" },
            status: { type: "string", enum: [...WORK_STATUSES] },
            reason: { type: "string" },
            description: { type: "string" },
            estimateHours: { type: "number" },
          },
          required: ["type"],
        },
      },
    },
    required: ["targetWorkObjectId", "needsConfirmation", "summary", "events"],
  },
};

// Returns null when no API key is configured, so callers can fall back to the
// structured quick-action form.
export function createAnthropicCommandLLM(
  apiKey: string | undefined = process.env.ANTHROPIC_API_KEY,
): CommandLLM | null {
  if (!apiKey) return null;
  const client = new Anthropic({ apiKey });

  return async ({ text, candidates, currentWorkObjectId }) => {
    const candidateList =
      candidates.map((c) => `- ${c.id}: ${c.title}`).join("\n") || "(none)";
    const userText = `Candidate work objects:\n${candidateList}\n\nCurrent work object id: ${
      currentWorkObjectId ?? "none"
    }\n\nUpdate: ${text}`;

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      // Stable system prompt + tool definitions form the cacheable prefix; the
      // volatile candidate list lives in the user message after the breakpoint.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: [TOOL],
      tool_choice: { type: "tool", name: "record_work_updates" },
      messages: [{ role: "user", content: userText }],
    });

    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error("Model did not return a tool use block");
    }
    return block.input as RawParse;
  };
}

export async function parseCommand(
  llm: CommandLLM,
  input: CommandInput,
): Promise<ParsedCommand> {
  return interpretRawParse(await llm(input));
}
