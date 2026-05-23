"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_STATUSES } from "@/lib/domain/types";

interface PersonOption {
  id: string;
  name: string;
}

const KINDS = [
  { value: "progress_updated", label: "Update progress" },
  { value: "time_logged", label: "Log time" },
  { value: "review_requested", label: "Request review" },
  { value: "blocker_raised", label: "Raise blocker" },
  { value: "status_changed", label: "Change status" },
  { value: "scope_change_proposed", label: "Propose scope change" },
] as const;

export function AddUpdate({
  workObjectId,
  people,
}: {
  workObjectId: string;
  people: PersonOption[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("progress_updated");
  const [actorId, setActorId] = useState<string>("");
  const [text, setText] = useState("");
  const [num, setNum] = useState("");
  const [status, setStatus] = useState<string>("in_production");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function buildPayload(): Record<string, unknown> {
    switch (kind) {
      case "progress_updated":
        return { note: text };
      case "time_logged":
        return { hours: Number(num), note: text || undefined };
      case "review_requested":
        return { note: text || undefined };
      case "blocker_raised":
        return { reason: text };
      case "status_changed":
        return { to: status };
      case "scope_change_proposed":
        return { description: text, estimateHours: num ? Number(num) : undefined };
      default:
        return {};
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/work-objects/${workObjectId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind, payload: buildPayload(), actorId: actorId || null }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Could not record update.");
      return;
    }
    setText("");
    setNum("");
    router.refresh();
  }

  const field = "rounded border border-neutral-300 px-2 py-1.5 text-sm";
  const needsText = kind !== "status_changed";
  const needsNum = kind === "time_logged" || kind === "scope_change_proposed";

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <select className={field} value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <select className={field} value={actorId} onChange={(e) => setActorId(e.target.value)}>
          <option value="">Who? (optional)</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {needsNum && (
          <input
            className={`${field} w-24`}
            type="number"
            step="0.25"
            min="0"
            placeholder={kind === "time_logged" ? "hours" : "est. h"}
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
        )}
        {kind === "status_changed" && (
          <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
            {WORK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      {needsText && (
        <input
          className={`${field} w-full`}
          placeholder={
            kind === "blocker_raised"
              ? "What is blocking the work?"
              : kind === "scope_change_proposed"
                ? "Describe the scope change"
                : "Add a note…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {submitting ? "Recording…" : "Record update"}
      </button>
    </form>
  );
}
