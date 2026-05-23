import { describe, expect, it } from "vitest";
import {
  interpretRawParse,
  parseCommand,
  type RawParse,
} from "@/lib/intel/command-parser";

const TARGET = "11111111-1111-1111-1111-111111111111";

// Golden set: the §41 example phrases, expressed as the raw parse the model would
// return, must map to the same structured events the quick-action path produces.
describe("interpretRawParse — §41 golden set", () => {
  it('"Finished v1, ready for review, 2h" → progress + time + review', () => {
    const raw: RawParse = {
      targetWorkObjectId: TARGET,
      needsConfirmation: false,
      summary: "Finished v1, ready for review, logged 2h",
      events: [
        { type: "progress_updated", note: "Finished v1", status: "in_review" },
        { type: "time_logged", hours: 2 },
        { type: "review_requested" },
      ],
    };
    const parsed = interpretRawParse(raw);
    expect(parsed.needsConfirmation).toBe(false);
    expect(parsed.targetWorkObjectId).toBe(TARGET);
    expect(parsed.events).toEqual([
      { type: "progress_updated", payload: { note: "Finished v1", status: "in_review" } },
      { type: "time_logged", payload: { hours: 2, note: undefined } },
      { type: "review_requested", payload: { note: undefined } },
    ]);
  });

  it('"Blocked until copy arrives." → blocker_raised', () => {
    const parsed = interpretRawParse({
      targetWorkObjectId: TARGET,
      needsConfirmation: false,
      summary: "Blocked",
      events: [{ type: "blocker_raised", reason: "copy arrives" }],
    });
    expect(parsed.needsConfirmation).toBe(false);
    expect(parsed.events).toEqual([
      { type: "blocker_raised", payload: { reason: "copy arrives" } },
    ]);
  });

  it('"Add five slides" → scope_change_proposed (a proposal, not a change)', () => {
    const parsed = interpretRawParse({
      targetWorkObjectId: TARGET,
      needsConfirmation: false,
      summary: "Scope change proposed",
      events: [{ type: "scope_change_proposed", description: "Add five slides", estimateHours: 6 }],
    });
    expect(parsed.events).toEqual([
      {
        type: "scope_change_proposed",
        payload: { description: "Add five slides", estimateHours: 6 },
      },
    ]);
  });

  it("drops an invalid event and forces confirmation", () => {
    const parsed = interpretRawParse({
      targetWorkObjectId: TARGET,
      needsConfirmation: false,
      summary: "ambiguous time",
      events: [{ type: "time_logged" }], // missing hours
    });
    expect(parsed.events).toHaveLength(0);
    expect(parsed.needsConfirmation).toBe(true);
  });

  it("forces confirmation when no target resolved", () => {
    const parsed = interpretRawParse({
      targetWorkObjectId: null,
      needsConfirmation: false,
      summary: "which project?",
      events: [{ type: "review_requested" }],
    });
    expect(parsed.needsConfirmation).toBe(true);
  });
});

describe("parseCommand", () => {
  it("runs the injected LLM and interprets its output", async () => {
    const fakeLLM = async (): Promise<RawParse> => ({
      targetWorkObjectId: TARGET,
      needsConfirmation: false,
      summary: "logged time",
      events: [{ type: "time_logged", hours: 3, note: "edit" }],
    });
    const parsed = await parseCommand(fakeLLM, { text: "3h on the edit", candidates: [] });
    expect(parsed.events).toEqual([
      { type: "time_logged", payload: { hours: 3, note: "edit" } },
    ]);
  });
});
