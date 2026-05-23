import type { Role } from "./types";

// "Anyone can raise reality. Only authorized roles can change commitments." (§13)
// Permission levels: a role may do an action directly ("yes"), only raise it as a
// signal/request ("propose"), or not at all ("no").
export type Permission = "yes" | "propose" | "no";

export const ACTIONS = [
  "log_time",
  "attach_file",
  "request_review",
  "raise_blocker",
  "update_progress",
  "change_scope",
  "change_deadline",
  "assign_tier",
  "close_project",
  "archive_project",
] as const;
export type Action = (typeof ACTIONS)[number];

// Coarse rights matrix (§13). Tier-specific quality-approval rights and the full
// human-gate logic (§14) are layered on in Phase 3; this is the Phase 1 baseline.
const MATRIX: Record<Action, Partial<Record<Role, Permission>>> = {
  log_time: { designer: "yes", project_manager: "yes", creative_lead: "yes", creative_director: "yes", account_manager: "yes", resource_manager: "yes" },
  attach_file: { designer: "yes", project_manager: "yes", creative_lead: "yes", creative_director: "yes" },
  update_progress: { designer: "yes", project_manager: "yes", creative_lead: "yes", creative_director: "yes" },
  raise_blocker: { designer: "yes", project_manager: "yes", creative_lead: "yes", creative_director: "yes", account_manager: "yes" },
  request_review: { designer: "yes", project_manager: "yes", creative_lead: "yes", creative_director: "yes", account_manager: "yes" },
  change_scope: { designer: "propose", creative_lead: "propose", project_manager: "yes", account_manager: "propose", creative_director: "yes" },
  change_deadline: { designer: "propose", project_manager: "yes", account_manager: "yes", creative_director: "propose" },
  assign_tier: { project_manager: "yes", creative_director: "yes" },
  close_project: { project_manager: "yes" },
  archive_project: { project_manager: "yes", operations: "yes" },
};

export function permissionFor(role: Role, action: Action): Permission {
  return MATRIX[action][role] ?? "no";
}

export function can(role: Role, action: Action): boolean {
  return permissionFor(role, action) === "yes";
}
