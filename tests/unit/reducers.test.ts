import { describe, expect, it } from "vitest";
import { applyEvent, foldEvents } from "@/lib/events/reducers";
import type { DomainEvent } from "@/lib/events/types";

const created: DomainEvent = {
  type: "work_object_created",
  payload: { workObjectType: "project", title: "Teaser", tier: 2 },
};

describe("applyEvent", () => {
  it("initializes state from work_object_created", () => {
    const state = applyEvent(null, created);
    expect(state).toMatchObject({
      type: "project",
      tier: 2,
      status: "requested",
      title: "Teaser",
      totalHours: 0,
      blocked: false,
      reviewRequested: false,
    });
  });

  it("throws when applying an event before creation", () => {
    expect(() =>
      applyEvent(null, { type: "time_logged", payload: { hours: 1 } }),
    ).toThrow(/before a work_object_created/);
  });

  it("accumulates logged time", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, { type: "time_logged", payload: { hours: 2 } });
    const s3 = applyEvent(s2, { type: "time_logged", payload: { hours: 1.5 } });
    expect(s3.totalHours).toBe(3.5);
  });

  it("treats a scope-change proposal as a signal, not a mutation", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, {
      type: "scope_change_proposed",
      payload: { description: "Add five slides", estimateHours: 6 },
    });
    expect(s2).toEqual(s1);
  });

  it("sets and clears the review-requested flag with status", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, { type: "review_requested", payload: {} });
    expect(s2.reviewRequested).toBe(true);
    const s3 = applyEvent(s2, { type: "status_changed", payload: { to: "delivered" } });
    expect(s3.reviewRequested).toBe(false);
    expect(s3.status).toBe("delivered");
  });

  it("starts Tier 1 work in exploration mode (§7)", () => {
    const t1 = applyEvent(null, {
      type: "work_object_created",
      payload: { workObjectType: "project", title: "Campaign", tier: 1 },
    });
    expect(t1.mode).toBe("exploration");
    expect(applyEvent(null, created).mode).toBeNull();
  });

  it("production_locked moves into structured production (§7)", () => {
    const s1 = applyEvent(null, {
      type: "work_object_created",
      payload: { workObjectType: "project", title: "Campaign", tier: 1 },
    });
    const s2 = applyEvent(s1, { type: "production_locked", payload: {} });
    expect(s2.mode).toBe("production");
    expect(s2.status).toBe("in_production");
  });

  it("keeps the blocked flag until the work leaves 'waiting'", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, { type: "blocker_raised", payload: { reason: "Copy missing" } });
    expect(s2.blocked).toBe(true);
    const s3 = applyEvent(s2, { type: "status_changed", payload: { to: "waiting" } });
    expect(s3.blocked).toBe(true);
    const s4 = applyEvent(s3, { type: "status_changed", payload: { to: "in_production" } });
    expect(s4.blocked).toBe(false);
  });
});

describe("review_outcome (§Phase 4)", () => {
  it("approved moves to delivered, keeps version", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, { type: "review_requested", payload: {} });
    const s3 = applyEvent(s2, {
      type: "review_outcome",
      payload: { decision: "approved" },
    });
    expect(s3.status).toBe("delivered");
    expect(s3.reviewRequested).toBe(false);
    expect(s3.reviewDecision).toBe("approved");
    expect(s3.currentVersion).toBe(1);
  });

  it("needs_revision moves to in_production and bumps version", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, { type: "review_requested", payload: {} });
    const s3 = applyEvent(s2, {
      type: "review_outcome",
      payload: { decision: "needs_revision", note: "Rework the headline" },
    });
    expect(s3.status).toBe("in_production");
    expect(s3.currentVersion).toBe(2);
  });

  it("rejected moves to closing and bumps version", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, {
      type: "review_outcome",
      payload: { decision: "rejected" },
    });
    expect(s2.status).toBe("closing");
    expect(s2.currentVersion).toBe(2);
  });

  it("artifact_added is a pure log entry — no state change", () => {
    const s1 = applyEvent(null, created);
    const s2 = applyEvent(s1, {
      type: "artifact_added",
      payload: { name: "Teaser v1", url: "https://figma.com/file/abc", version: 1 },
    });
    expect(s2).toEqual(s1);
  });

  it("initializes currentVersion to 1 on creation", () => {
    const s = applyEvent(null, created);
    expect(s.currentVersion).toBe(1);
    expect(s.reviewDecision).toBeNull();
  });
});

describe("foldEvents", () => {
  it("folds a full stream into current state", () => {
    const state = foldEvents([
      created,
      { type: "status_changed", payload: { to: "in_production" } },
      { type: "time_logged", payload: { hours: 4 } },
    ]);
    expect(state.status).toBe("in_production");
    expect(state.totalHours).toBe(4);
  });

  it("requires the stream to begin with creation", () => {
    expect(() => foldEvents([{ type: "time_logged", payload: { hours: 1 } }])).toThrow(
      /must begin with work_object_created/,
    );
  });
});
