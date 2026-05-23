import { describe, expect, it } from "vitest";
import { describeEvent, statusLabel, tierLabel } from "@/lib/labels";

describe("labels", () => {
  it("formats statuses and tiers", () => {
    expect(statusLabel("in_production")).toBe("In Production");
    expect(tierLabel(1)).toBe("Tier 1");
    expect(tierLabel(null)).toBe("—");
  });
});

describe("describeEvent (§37 log lines)", () => {
  it("describes creation", () => {
    expect(
      describeEvent("work_object_created", { workObjectType: "project", title: "Teaser" }),
    ).toBe('Created Project "Teaser"');
  });
  it("describes a time log", () => {
    expect(describeEvent("time_logged", { hours: 2, note: "edit" })).toBe("Logged 2h — edit");
  });
  it("describes a scope proposal with estimate", () => {
    expect(
      describeEvent("scope_change_proposed", { description: "Add slides", estimateHours: 6 }),
    ).toBe("Scope change proposed: Add slides (est. 6h)");
  });
});
