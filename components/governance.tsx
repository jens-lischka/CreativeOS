"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PersonOption {
  id: string;
  name: string;
}

async function postEvent(
  workObjectId: string,
  type: string,
  payload: Record<string, unknown>,
  actorId: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/work-objects/${workObjectId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload, actorId: actorId || null }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: data.error ?? "Action failed." };
}

export function Governance({
  workObjectId,
  tier,
  mode,
  suggestedTier,
  people,
}: {
  workObjectId: string;
  tier: number | null;
  mode: string | null;
  suggestedTier: number;
  people: PersonOption[];
}) {
  const router = useRouter();
  const [actorId, setActorId] = useState("");
  const [tierValue, setTierValue] = useState(String(tier ?? suggestedTier));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function needActor(): boolean {
    if (!actorId) {
      setError("Choose who is acting first (gated actions need an authorized role).");
      return false;
    }
    return true;
  }

  async function run(type: string, payload: Record<string, unknown>) {
    setError(null);
    setNote(null);
    if (!needActor()) return;
    setBusy(true);
    const res = await postEvent(workObjectId, type, payload, actorId);
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error ?? "Action failed.");
    }
  }

  const field = "rounded border border-neutral-300 px-2 py-1.5 text-sm";

  return (
    <div className="space-y-3 rounded border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Acting as</span>
        <select className={field} value={actorId} onChange={(e) => setActorId(e.target.value)}>
          <option value="">Select person…</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Tier</span>
        <select className={field} value={tierValue} onChange={(e) => setTierValue(e.target.value)}>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <button
          onClick={() => run("tier_assigned", { tier: Number(tierValue) })}
          disabled={busy}
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Assign tier
        </button>
        {tier == null && (
          <span className="text-xs text-neutral-400">System suggests Tier {suggestedTier}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Mode: {mode ?? "—"}</span>
        <button
          onClick={() => run("production_locked", {})}
          disabled={busy || mode === "production"}
          className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
          {mode === "production" ? "In production" : "Lock to production"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {note && <p className="text-sm text-neutral-600">{note}</p>}
    </div>
  );
}
