import {
  ALLOWED_PARENT_TYPES,
  type Tier,
  type WorkObjectType,
  type WorkStatus,
} from "./types";

// Whether a child of `childType` may attach under a parent of `parentType` (§4).
export function canHaveParent(
  childType: WorkObjectType,
  parentType: WorkObjectType,
): boolean {
  return ALLOWED_PARENT_TYPES[childType].includes(parentType);
}

// Tier-specific lifecycles (§12). The UX adapts to the work; the back-end model
// is consistent. Tier 3 stays light; Tier 1 runs the full path.
export const LIFECYCLE_BY_TIER: Record<Tier, WorkStatus[]> = {
  1: [
    "requested",
    "shaping",
    "exploring",
    "ready_for_production",
    "in_production",
    "in_review",
    "delivered",
    "closing",
    "closed",
    "archived",
  ],
  2: [
    "requested",
    "shaping",
    "ready_for_production",
    "in_production",
    "in_review",
    "delivered",
    "closing",
    "closed",
    "archived",
  ],
  3: ["requested", "in_production", "in_review", "delivered", "closed"],
};

// "waiting" is a side state reachable from any active state (e.g. a blocker, §38).
const ACTIVE_STATUSES: WorkStatus[] = [
  "shaping",
  "exploring",
  "ready_for_production",
  "in_production",
  "in_review",
];

// Is `to` a legal next status from `from` for the given tier? Forward moves along
// the tier lifecycle are allowed; any active state may go to/return from "waiting".
// Tier assignment and gated transitions are enforced at the role/gate layer (Phase 3).
export function canTransition(
  tier: Tier,
  from: WorkStatus,
  to: WorkStatus,
): boolean {
  if (from === to) return false;
  if (to === "waiting") return ACTIVE_STATUSES.includes(from);
  if (from === "waiting") return ACTIVE_STATUSES.includes(to);
  const order = LIFECYCLE_BY_TIER[tier];
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx > fromIdx;
}
