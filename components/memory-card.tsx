import type { MemoryCard as MemoryCardData } from "@/lib/queries";
import { tierLabel, typeLabel } from "@/lib/labels";

export function MemoryCard({ card }: { card: MemoryCardData }) {
  const duration = Math.round(
    (card.closedAt.getTime() - card.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-4 rounded border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
        <span>{typeLabel(card.type)} · {tierLabel(card.tier)}</span>
        <span>{card.totalHours}h logged</span>
        {card.artifactCount > 0 && <span>{card.artifactCount} artifact{card.artifactCount !== 1 ? "s" : ""}</span>}
        {card.revisionRounds > 0 && <span>{card.revisionRounds} revision round{card.revisionRounds !== 1 ? "s" : ""}</span>}
        <span>{duration} day{duration !== 1 ? "s" : ""} total</span>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Reflection</div>
        <p className="text-sm text-neutral-700">{card.reflection}</p>
      </div>

      {(card.whatWorked || card.whatToImprove) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {card.whatWorked && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">What worked</div>
              <p className="text-sm text-neutral-700">{card.whatWorked}</p>
            </div>
          )}
          {card.whatToImprove && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">What to improve</div>
              <p className="text-sm text-neutral-700">{card.whatToImprove}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
