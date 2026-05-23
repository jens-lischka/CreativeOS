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
