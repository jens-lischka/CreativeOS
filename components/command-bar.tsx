"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { describeEvent } from "@/lib/labels";

interface PreviewEvent {
  type: string;
  payload: unknown;
}

interface CommandResponse {
  applied: boolean;
  needsConfirmation?: boolean;
  configured?: boolean;
  summary?: string;
  targetWorkObjectId?: string | null;
  events?: PreviewEvent[];
}

export function CommandBar({ currentWorkObjectId }: { currentWorkObjectId?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<CommandResponse | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setMessage(null);
    setPending(null);

    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, currentWorkObjectId: currentWorkObjectId ?? null }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage("Something went wrong. Try the quick-action form.");
      return;
    }
    const data: CommandResponse = await res.json();

    if (data.applied) {
      setText("");
      setMessage(data.summary ?? "Recorded.");
      router.refresh();
      return;
    }
    if (data.events && data.events.length > 0 && data.targetWorkObjectId) {
      setPending(data);
      return;
    }
    setMessage(data.summary ?? "Couldn't act on that automatically.");
  }

  async function confirmPending() {
    if (!pending?.targetWorkObjectId || !pending.events) return;
    setBusy(true);
    const res = await fetch("/api/command/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetWorkObjectId: pending.targetWorkObjectId,
        events: pending.events,
      }),
    });
    setBusy(false);
    setPending(null);
    if (res.ok) {
      setText("");
      setMessage("Recorded.");
      router.refresh();
    } else {
      setMessage("Could not apply that update.");
    }
  }

  return (
    <div className="rounded border border-neutral-200 bg-white p-4">
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
          placeholder="What do you want to do? e.g. Finished v1 of the teaser, ready for review, 2h"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "…" : "Go"}
        </button>
      </form>

      {message && <p className="mt-2 text-sm text-neutral-600">{message}</p>}

      {pending && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="mb-2 font-medium text-amber-900">Confirm these updates:</p>
          <ul className="mb-3 list-disc pl-5 text-amber-900">
            {pending.events?.map((ev, i) => (
              <li key={i}>{describeEvent(ev.type, ev.payload)}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={confirmPending}
              disabled={busy}
              className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setPending(null)}
              className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
