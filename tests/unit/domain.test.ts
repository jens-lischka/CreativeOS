import { describe, expect, it } from "vitest";
import { permissionFor } from "@/lib/domain/roles";
import { canHaveParent, canTransition, LIFECYCLE_BY_TIER } from "@/lib/domain/work-object";

describe("work hierarchy (§4)", () => {
  it("allows a deliverable under a project", () => {
    expect(canHaveParent("deliverable", "project")).toBe(true);
  });
  it("rejects an initiative under a project", () => {
    expect(canHaveParent("initiative", "project")).toBe(false);
  });
  it("allows a deliverable to attach directly to an initiative (skipped levels)", () => {
    expect(canHaveParent("deliverable", "initiative")).toBe(true);
  });
});

describe("tier lifecycles (§12)", () => {
  it("keeps Tier 3 short", () => {
    expect(LIFECYCLE_BY_TIER[3]).toEqual([
      "requested",
      "in_production",
      "in_review",
      "delivered",
      "closed",
    ]);
  });

  it("includes exploration for Tier 1 but not Tier 3", () => {
    expect(LIFECYCLE_BY_TIER[1]).toContain("exploring");
    expect(LIFECYCLE_BY_TIER[3]).not.toContain("exploring");
  });

  it("allows forward transitions only", () => {
    expect(canTransition(2, "shaping", "in_production")).toBe(true);
    expect(canTransition(2, "in_production", "shaping")).toBe(false);
  });

  it("permits blocking from any active state and returning", () => {
    expect(canTransition(2, "in_production", "waiting")).toBe(true);
    expect(canTransition(2, "waiting", "in_production")).toBe(true);
  });

  it("rejects exploring for a Tier 3 lifecycle", () => {
    expect(canTransition(3, "requested", "exploring")).toBe(false);
  });
});

describe("role rights (§13)", () => {
  it("lets a PM change scope directly but a designer only propose", () => {
    expect(permissionFor("project_manager", "change_scope")).toBe("yes");
    expect(permissionFor("designer", "change_scope")).toBe("propose");
  });

  it("does not let a designer assign a tier", () => {
    expect(permissionFor("designer", "assign_tier")).toBe("no");
  });

  it("lets anyone with a creative role raise a blocker", () => {
    expect(permissionFor("designer", "raise_blocker")).toBe("yes");
  });
});
