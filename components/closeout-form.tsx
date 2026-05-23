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

export function CloseoutForm({
  workObjectId,
  people,
}: {
  workObjectId: string;
  people: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [actorId, setActorId] = useState("");
  const [reflection, setReflection] = useState("");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!actorId) { setError("Choose who is closing this project."); return; }
    if (!reflection.trim()) { setError("Reflection is required before closing."); return; }
    setError(null);
    setBusy(true);
    const res = await postEvent(workObjectId, "project_closed", {
      reflection: reflection.trim(),
      whatWorked: whatWorked.trim() || undefined,
      whatToImprove: whatToImprove.trim() || undefined,
    }, actorId);
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error ?? "Failed to close project.");
    }
  }

  return (
    <div className="space-y-3 rounded border border-neutral-300 bg-neutral-50 p-4">
      <div className="text-sm font-medium text-neutral-700">
        This work is closing — capture what you learned before it's gone
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Reflection <span className="text-red-500">*</span>
          </label>
          <textarea
            className={field}
            rows={3}
            placeholder="What happened? How did it land?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">What worked</label>
            <textarea
              className={field}
              rows={2}
              placeholder="What should we repeat?"
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">What to improve</label>
            <textarea
              className={field}
              rows={2}
              placeholder="What would we do differently?"
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
          >
            <option value="">Who is closing this?</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Close project
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
