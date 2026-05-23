// Pure presentation helpers shared by server components and tests.

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export const statusLabel = titleCase;
export const typeLabel = titleCase;

export function tierLabel(tier: number | null | undefined): string {
  return tier == null ? "—" : `Tier ${tier}`;
}

function asRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
}

// Turns a structured event into a human-readable Project Log line (§37).
export function describeEvent(type: string, payload: unknown): string {
  const p = asRecord(payload);
  switch (type) {
    case "work_object_created":
      return `Created ${typeLabel(String(p.workObjectType ?? "work"))} "${String(p.title ?? "")}"`;
    case "tier_assigned":
      return `Assigned ${tierLabel(Number(p.tier))}`;
    case "status_changed":
      return `Status → ${statusLabel(String(p.to ?? ""))}`;
    case "production_locked":
      return "Locked into production";
    case "progress_updated":
      return `Progress: ${String(p.note ?? "")}`;
    case "time_logged":
      return `Logged ${p.hours}h${p.note ? ` — ${String(p.note)}` : ""}`;
    case "review_requested":
      return `Requested review${p.note ? ` — ${String(p.note)}` : ""}`;
    case "blocker_raised":
      return `Blocker raised: ${String(p.reason ?? "")}`;
    case "scope_change_proposed":
      return `Scope change proposed: ${String(p.description ?? "")}${
        p.estimateHours != null ? ` (est. ${String(p.estimateHours)}h)` : ""
      }`;
    default:
      return titleCase(type);
  }
}
