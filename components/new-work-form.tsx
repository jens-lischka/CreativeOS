"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_OBJECT_TYPES } from "@/lib/domain/types";

interface PersonOption {
  id: string;
  name: string;
}

export function NewWorkForm({ people }: { people: PersonOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [workObjectType, setWorkObjectType] = useState<string>("project");
  const [tier, setTier] = useState<string>("");
  const [why, setWhy] = useState("");
  const [ownerId, setOwnerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/work-objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workObjectType,
        title,
        tier: tier ? Number(tier) : null,
        why: why || undefined,
        ownerId: ownerId || null,
        actorId: ownerId || null,
      }),
    });
    if (!res.ok) {
      setSubmitting(false);
      setError("Could not create work. Check the required fields.");
      return;
    }
    const { id } = await res.json();
    router.push(`/work/${id}`);
  }

  const field = "w-full rounded border border-neutral-300 px-3 py-2 text-sm";
  const label = "block text-sm font-medium text-neutral-700 mb-1";

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className={label} htmlFor="title">
          What is being made?
        </label>
        <input
          id="title"
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Summit Teaser Video"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="type">
            Type
          </label>
          <select
            id="type"
            className={field}
            value={workObjectType}
            onChange={(e) => setWorkObjectType(e.target.value)}
          >
            {WORK_OBJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="tier">
            Tier
          </label>
          <select id="tier" className={field} value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">Unassigned</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="owner">
          Owner
        </label>
        <select id="owner" className={field} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
          <option value="">Unassigned</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="why">
          Why is it needed?
        </label>
        <textarea
          id="why"
          className={field}
          rows={2}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !title}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create work"}
      </button>
    </form>
  );
}
