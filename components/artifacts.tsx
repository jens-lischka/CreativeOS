"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ArtifactEntry {
  id: string;
  name: string;
  url: string;
  fileType: string | null;
  version: number;
  createdAt: Date;
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
  return { ok: false, error: data.error ?? "Failed." };
}

export function Artifacts({
  workObjectId,
  artifactList,
  currentVersion,
  people,
}: {
  workObjectId: string;
  artifactList: ArtifactEntry[];
  currentVersion: number;
  people: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [actorId, setActorId] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = "rounded border border-neutral-300 px-2 py-1.5 text-sm";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!actorId) { setError("Choose who is attaching this artifact."); return; }
    if (!name.trim()) { setError("Name is required."); return; }
    if (!url.trim()) { setError("URL is required."); return; }
    setError(null);
    setBusy(true);
    const res = await postEvent(workObjectId, "artifact_added", {
      name: name.trim(),
      url: url.trim(),
      version: currentVersion,
      fileType: fileType.trim() || undefined,
    }, actorId);
    setBusy(false);
    if (res.ok) {
      setName(""); setUrl(""); setFileType("");
      router.refresh();
    } else {
      setError(res.error ?? "Failed to add artifact.");
    }
  }

  // Group artifacts by version for display
  const byVersion = artifactList.reduce<Record<number, ArtifactEntry[]>>((acc, a) => {
    (acc[a.version] ??= []).push(a);
    return acc;
  }, {});
  const versions = Object.keys(byVersion).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4 rounded border border-neutral-200 bg-white p-4">
      {artifactList.length === 0 ? (
        <p className="text-sm text-neutral-400">No artifacts yet.</p>
      ) : (
        versions.map((v) => (
          <div key={v}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              v{v}
            </div>
            <ul className="space-y-1">
              {byVersion[v].map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-medium hover:underline"
                  >
                    {a.name}
                  </a>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {a.fileType ?? "link"} · {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <form onSubmit={submit} className="space-y-2 border-t border-neutral-100 pt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Add artifact (v{currentVersion})
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={field}
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
          >
            <option value="">Who is attaching?</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            className={`${field} flex-1 min-w-32`}
            placeholder="Name (e.g. Teaser v1 Figma)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={`${field} flex-1 min-w-48`}
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className={`${field} w-28`}
            placeholder="Type (optional)"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Attach
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
