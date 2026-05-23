import { describe, expect, it } from "vitest";
import { authorizeEvent, scopeTradeOff, suggestTier } from "@/lib/domain/gates";
import type { DomainEvent } from "@/lib/events/types";

const ctx = (tier: number | null, status = "in_production", mode: string | null = null) =>
  ({ tier, status, mode } as Parameters<typeof authorizeEvent>[2]);

describe("authorizeEvent — rights & gates (§13/§14)", () => {
  it("lets anyone raise reality without approval", () => {
    const blocker: DomainEvent = { type: "blocker_raised", payload: { reason: "copy late" } };
    expect(authorizeEvent([], blocker, ctx(1)).action).toBe("allow");
    const proposal: DomainEvent = {
      type: "scope_change_proposed",
      payload: { description: "add slides" },
    };
    expect(authorizeEvent(["designer"], proposal, ctx(2)).action).toBe("allow");
  });

  it("only PM/CD can assign a tier", () => {
    const ev: DomainEvent = { type: "tier_assigned", payload: { tier: 1 } };
    expect(authorizeEvent(["designer"], ev, ctx(null)).action).toBe("deny");
    expect(authorizeEvent(["project_manager"], ev, ctx(null)).action).toBe("allow");
    expect(authorizeEvent(["creative_director"], ev, ctx(null)).action).toBe("allow");
  });

  it("gates Tier 1 production lock to the Creative Director", () => {
    const ev: DomainEvent = { type: "production_locked", payload: {} };
    expect(authorizeEvent(["project_manager"], ev, ctx(1, "ready_for_production")).action).toBe(
      "deny",
    );
    expect(authorizeEvent(["designer"], ev, ctx(1, "ready_for_production")).action).toBe("deny");
    expect(
      authorizeEvent(["creative_director"], ev, ctx(1, "ready_for_production")).action,
    ).toBe("allow");
  });

  it("lets a PM lock non-Tier-1 work into production", () => {
    const ev: DomainEvent = { type: "production_locked", payload: {} };
    expect(authorizeEvent(["project_manager"], ev, ctx(2, "ready_for_production")).action).toBe(
      "allow",
    );
    expect(authorizeEvent(["designer"], ev, ctx(2, "ready_for_production")).action).toBe("deny");
  });

  it("rejects illegal status transitions for the tier", () => {
    const back: DomainEvent = { type: "status_changed", payload: { to: "shaping" } };
    expect(authorizeEvent(["project_manager"], back, ctx(2, "in_production")).action).toBe("deny");
    const fwd: DomainEvent = { type: "status_changed", payload: { to: "in_review" } };
    expect(authorizeEvent(["designer"], fwd, ctx(2, "in_production")).action).toBe("allow");
  });

  it("skips transition checks when no tier is set", () => {
    const ev: DomainEvent = { type: "status_changed", payload: { to: "delivered" } };
    expect(authorizeEvent([], ev, ctx(null, "requested")).action).toBe("allow");
  });
});

describe("authorizeEvent — review_outcome & artifact_added (§Phase 4)", () => {
  it("blocks a designer from recording a review outcome", () => {
    const ev: DomainEvent = {
      type: "review_outcome",
      payload: { decision: "approved" },
    };
    expect(authorizeEvent(["designer"], ev, ctx(2, "in_review")).action).toBe("deny");
  });

  it("allows a creative_lead to approve", () => {
    const ev: DomainEvent = {
      type: "review_outcome",
      payload: { decision: "approved" },
    };
    expect(authorizeEvent(["creative_lead"], ev, ctx(2, "in_review")).action).toBe("allow");
  });

  it("allows a PM to request needs_revision", () => {
    const ev: DomainEvent = {
      type: "review_outcome",
      payload: { decision: "needs_revision" },
    };
    expect(authorizeEvent(["project_manager"], ev, ctx(1, "in_review")).action).toBe("allow");
  });

  it("allows a designer to add an artifact", () => {
    const ev: DomainEvent = {
      type: "artifact_added",
      payload: { name: "Hero visual", url: "https://figma.com/file/xyz", version: 1 },
    };
    expect(authorizeEvent(["designer"], ev, ctx(2)).action).toBe("allow");
  });

  it("blocks a requester from adding an artifact", () => {
    const ev: DomainEvent = {
      type: "artifact_added",
      payload: { name: "Brief", url: "https://docs.google.com/x", version: 1 },
    };
    expect(authorizeEvent(["requester"], ev, ctx(2)).action).toBe("deny");
  });
});

describe("suggestTier (§3)", () => {
  it("suggests Tier 1 for high-impact work", () => {
    expect(suggestTier({ type: "project", title: "Brand campaign hero film" })).toBe(1);
  });
  it("suggests Tier 3 for fast repeatable work", () => {
    expect(suggestTier({ type: "action", title: "Resize social banners" })).toBe(3);
  });
  it("defaults to Tier 2", () => {
    expect(suggestTier({ type: "deliverable", title: "Quarterly report layout" })).toBe(2);
  });
});

describe("scopeTradeOff (§24 neutral language)", () => {
  it("includes the estimate and a neutral choice", () => {
    expect(scopeTradeOff(6)).toContain("about 6 hours");
    expect(scopeTradeOff(6)).toContain("reduce another deliverable or approve");
  });
});
