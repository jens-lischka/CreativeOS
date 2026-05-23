"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  return { ok: false, error: data.error ?? "Failed." };
}

export function ReviewOutcome({
  workObjectId,
  people,
}: {
  workObjectId: string;
  people: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [actorId, setActorId] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = "rounded border border-neutral-300 px-2 py-1.5 text-sm";

  async function record(decision: "approved" | "needs_revision" | "rejected") {
    if (!actorId) { setError("Choose who is recording this outcome."); return; }
    setError(null);
    setBusy(true);
    const res = await postEvent(workObjectId, "review_outcome", { decision, note: note.trim() || undefined }, actorId);
    setBusy(false);
    if (res.ok) {
      setNote("");
      router.refresh();
    } else {
      setError(res.error ?? "Failed.");
    }
  }

  return (
    <div className="space-y-3 rounded border border-amber-200 bg-amber-50 p-4">
      <div className="text-sm font-medium text-amber-800">This work is in review — record an outcome</div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={field}
          value={actorId}
          onChange={(e) => setActorId(e.target.value)}
        >
          <option value="">Who is deciding?</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          className={`${field} flex-1 min-w-48`}
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => record("approved")}
          disabled={busy}
          className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
        >
          Approve → Delivered
        </button>
        <button
          onClick={() => record("needs_revision")}
          disabled={busy}
          className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
          Needs revision → back to In production
        </button>
        <button
          onClick={() => record("rejected")}
          disabled={busy}
          className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Reject → Closing
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
