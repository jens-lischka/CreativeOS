import type { DomainEvent } from "../events/types";
import { permissionFor } from "./roles";
import type { Role, Tier, WorkMode, WorkObjectType, WorkStatus } from "./types";
import { canTransition } from "./work-object";

// Human-in-the-loop gates (§14) and the rights matrix (§13). The system can
// propose; humans decide when consequences matter. "Anyone can raise reality;
// only authorized roles can change commitments."

export interface WorkContext {
  tier: Tier | null;
  status: WorkStatus;
  mode: WorkMode | null;
}

export type GateDecision = { action: "allow" } | { action: "deny"; reason: string };

export function authorizeEvent(
  roles: Role[],
  event: DomainEvent,
  ctx: WorkContext,
): GateDecision {
  switch (event.type) {
    // Routine updates and "raising reality" need no approval (§14).
    case "work_object_created":
    case "time_logged":
    case "progress_updated":
    case "review_requested":
    case "blocker_raised":
    case "scope_change_proposed":
      return { action: "allow" };

    case "tier_assigned":
      return roles.some((r) => permissionFor(r, "assign_tier") === "yes")
        ? { action: "allow" }
        : {
            action: "deny",
            reason: "Only a PM or Creative Director can assign or change the tier (§3).",
          };

    case "status_changed": {
      if (ctx.tier != null && !canTransition(ctx.tier, ctx.status, event.payload.to)) {
        return {
          action: "deny",
          reason: `Cannot move a Tier ${ctx.tier} work object from "${ctx.status}" to "${event.payload.to}" (§12).`,
        };
      }
      return { action: "allow" };
    }

    case "production_locked": {
      // Exploration→production is a formal moment (§7): Tier 1 needs the CD; others a PM (§14).
      const required: Role = ctx.tier === 1 ? "creative_director" : "project_manager";
      if (roles.includes(required)) return { action: "allow" };
      return {
        action: "deny",
        reason:
          ctx.tier === 1
            ? "Tier 1 work can only move into production with Creative Director approval (§14)."
            : "Only a PM can lock a project into production (§14).",
      };
    }

    case "review_outcome": {
      // Approving, requesting revision, or rejecting is a formal human decision (§14).
      if (roles.some((r) => permissionFor(r, "approve_review") === "yes")) {
        return { action: "allow" };
      }
      return {
        action: "deny",
        reason: "Only a Creative Lead, PM, or Creative Director can record a review outcome (§14).",
      };
    }

    case "artifact_added":
      // Attaching a file is open to any authorized contributor (§13).
      if (roles.some((r) => permissionFor(r, "attach_file") === "yes")) {
        return { action: "allow" };
      }
      return { action: "deny", reason: "You do not have permission to attach files (§13)." };

    default:
      return { action: "allow" };
  }
}

// The system suggests a tier; a human confirms (§3). Heuristic only — never the
// final word, and never a creative judgment.
export function suggestTier(input: { type: WorkObjectType; title: string }): Tier {
  const t = input.title.toLowerCase();
  if (/(campaign|brand|identity|keynote|launch|pitch|hero|film|platform|summit)/.test(t)) {
    return 1;
  }
  if (/(proof|resize|format|template|adapt|minor|tweak|update|polish|social)/.test(t)) {
    return 3;
  }
  return 2;
}

// Neutral, stakeholder-safe trade-off language for a scope proposal (§9, §24).
export function scopeTradeOff(estimateHours?: number): string {
  const effort =
    estimateHours != null
      ? `about ${estimateHours} hours`
      : "additional creative capacity";
  return `This addition is estimated at ${effort}. To keep the current deadline, reduce another deliverable or approve the additional effort.`;
}
