import type { Tier, WorkMode, WorkObjectType, WorkStatus } from "../domain/types";
import type { DomainEvent } from "./types";

// The projected current state of a work object, folded from its event log.
// This is a pure function of the events — the primary unit-test target (§37).
export interface WorkObjectState {
  type: WorkObjectType;
  tier: Tier | null;
  status: WorkStatus;
  mode: WorkMode | null;
  title: string;
  totalHours: number;
  blocked: boolean;
  reviewRequested: boolean;
  // Increments on each needs_revision/rejected outcome, so v1 → v2 → etc. (§Phase 4).
  currentVersion: number;
  reviewDecision: "approved" | "needs_revision" | "rejected" | null;
}

export function applyEvent(
  state: WorkObjectState | null,
  event: DomainEvent,
): WorkObjectState {
  if (event.type === "work_object_created") {
    const p = event.payload;
    return {
      type: p.workObjectType,
      tier: p.tier ?? null,
      status: p.initialStatus ?? "requested",
      // Tier 1 protects ambiguity in exploration first (§7); others start unset.
      mode: p.tier === 1 ? "exploration" : null,
      title: p.title,
      totalHours: 0,
      blocked: false,
      reviewRequested: false,
      currentVersion: 1,
      reviewDecision: null,
    };
  }

  if (state === null) {
    throw new Error(
      `Cannot apply "${event.type}" before a work_object_created event`,
    );
  }

  switch (event.type) {
    case "tier_assigned":
      return { ...state, tier: event.payload.tier };

    case "production_locked":
      // The formal exploration→production moment (§7): work becomes structured.
      return { ...state, mode: "production", status: "in_production" };

    case "status_changed": {
      const to = event.payload.to;
      return {
        ...state,
        status: to,
        // Leaving "waiting" clears the blocked flag; entering review keeps the request.
        blocked: to === "waiting" ? state.blocked : false,
        reviewRequested: to === "in_review" ? state.reviewRequested : false,
      };
    }

    case "progress_updated":
      return event.payload.status
        ? { ...state, status: event.payload.status }
        : state;

    case "time_logged":
      return { ...state, totalHours: state.totalHours + event.payload.hours };

    case "review_requested":
      return { ...state, reviewRequested: true };

    case "review_outcome": {
      const { decision } = event.payload;
      const statusMap = {
        approved: "delivered" as WorkStatus,
        needs_revision: "in_production" as WorkStatus,
        rejected: "closing" as WorkStatus,
      };
      return {
        ...state,
        status: statusMap[decision],
        reviewRequested: false,
        reviewDecision: decision,
        // Each non-approval outcome starts a new revision round.
        currentVersion: decision !== "approved" ? state.currentVersion + 1 : state.currentVersion,
      };
    }

    case "artifact_added":
      // Artifacts are stored in their own table; the event is the log entry.
      return state;

    case "blocker_raised":
      return { ...state, blocked: true };

    case "scope_change_proposed":
      // A proposal is a signal, not a change (§13). No state mutation.
      return state;

    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

export function foldEvents(events: DomainEvent[]): WorkObjectState {
  if (events.length === 0 || events[0].type !== "work_object_created") {
    throw new Error("Event stream must begin with work_object_created");
  }
  return events.reduce<WorkObjectState | null>(applyEvent, null) as WorkObjectState;
}
