import Link from "next/link";
import { Badge } from "@/components/badge";
import { statusLabel, tierLabel, typeLabel } from "@/lib/labels";
import {
  getAtRiskItems,
  getRecentlyClosed,
  getStatusCounts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = new Set([
  "requested", "clarifying", "shaping", "exploring",
  "ready_for_production", "in_production", "in_review",
]);

const RISK_LABELS: Record<string, string> = {
  overdue: "Overdue",
  over_budget: "Over budget",
  blocked: "Blocked",
};

const RISK_TONES: Record<string, "neutral" | "blue" | "amber" | "green" | "red"> = {
  overdue: "red",
  over_budget: "amber",
  blocked: "blue",
};

export default async function ReportsPage() {
  const [counts, recentlyClosed, atRisk] = await Promise.all([
    getStatusCounts(),
    getRecentlyClosed(30),
    getAtRiskItems(),
  ]);

  const activeTotal = counts
    .filter((c) => ACTIVE_STATUSES.has(c.status))
    .reduce((s, c) => s + c.count, 0);
  const inReview = counts.find((c) => c.status === "in_review")?.count ?? 0;
  const closedTotal = counts.find((c) => c.status === "closed")?.count ?? 0;

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold">Reports</h1>

      {/* Pulse */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Pulse
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Active", value: activeTotal },
            { label: "In review", value: inReview },
            { label: "At risk", value: atRisk.length },
            { label: "Closed (all time)", value: closedTotal },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded border border-neutral-200 bg-white p-4 text-center"
            >
              <div className="text-2xl font-semibold">{value}</div>
              <div className="mt-1 text-xs text-neutral-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk signals */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Risk signals
        </h2>
        {atRisk.length === 0 ? (
          <p className="text-sm text-neutral-400">No risk signals — all clear.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
            {atRisk.map((item) => (
              <li key={`${item.id}-${item.risk}`} className="flex items-center justify-between px-4 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <Badge tone={RISK_TONES[item.risk]}>{RISK_LABELS[item.risk]}</Badge>
                  <Link href={`/work/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                  <span className="text-xs text-neutral-400">{item.detail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{tierLabel(item.tier)}</Badge>
                  <Badge tone="blue">{statusLabel(item.status)}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recently closed + memory */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Closed — last 30 days
        </h2>
        {recentlyClosed.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing closed in the last 30 days.</p>
        ) : (
          <div className="space-y-3">
            {recentlyClosed.map((item) => (
              <div
                key={item.id}
                className="rounded border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/work/${item.id}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {typeLabel(item.type)} · {tierLabel(item.tier)} ·{" "}
                      {item.totalHours}h logged
                      {item.revisionRounds > 0
                        ? ` · ${item.revisionRounds} revision round${item.revisionRounds !== 1 ? "s" : ""}`
                        : ""}
                      {" · "}closed {new Date(item.closedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{item.reflection}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
