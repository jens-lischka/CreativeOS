// Core domain vocabulary for the CreativeOS work graph.
// Mirrors the spec: the work hierarchy (§4), tiers (§6), project states (§12), roles (§13).

export const WORK_OBJECT_TYPES = [
  "initiative",
  "project",
  "workstream",
  "deliverable",
  "commitment",
  "action",
] as const;
export type WorkObjectType = (typeof WORK_OBJECT_TYPES)[number];

// Allowed parent for each type. Not every level is required (§4), so a child may
// attach to any ancestor type that is allowed to contain it.
export const ALLOWED_PARENT_TYPES: Record<WorkObjectType, WorkObjectType[]> = {
  initiative: [],
  project: ["initiative"],
  workstream: ["initiative", "project"],
  deliverable: ["initiative", "project", "workstream"],
  commitment: ["deliverable", "workstream", "project"],
  action: ["commitment", "deliverable"],
};

export const TIERS = [1, 2, 3] as const;
export type Tier = (typeof TIERS)[number];

// Project states (§12). Not every work type uses every state.
export const WORK_STATUSES = [
  "requested",
  "clarifying",
  "shaping",
  "exploring",
  "ready_for_production",
  "in_production",
  "in_review",
  "waiting",
  "delivered",
  "closing",
  "closed",
  "archived",
] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

// Exploration protects ambiguity; production is structured (§7).
export const WORK_MODES = ["exploration", "production"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

// Roles (§13).
export const ROLES = [
  "requester",
  "designer",
  "creative_lead",
  "creative_director",
  "project_manager",
  "account_manager",
  "resource_manager",
  "operations",
  "admin",
] as const;
export type Role = (typeof ROLES)[number];

export function isWorkObjectType(value: string): value is WorkObjectType {
  return (WORK_OBJECT_TYPES as readonly string[]).includes(value);
}
