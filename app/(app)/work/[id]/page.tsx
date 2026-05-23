import Link from "next/link";
import { notFound } from "next/navigation";
import { AddUpdate } from "@/components/add-update";
import { Artifacts } from "@/components/artifacts";
import { Badge } from "@/components/badge";
import { CloseoutForm } from "@/components/closeout-form";
import { CommandBar } from "@/components/command-bar";
import { Governance } from "@/components/governance";
import { MemoryCard } from "@/components/memory-card";
import { ReviewOutcome } from "@/components/review-outcome";
import { suggestTier } from "@/lib/domain/gates";
import type { WorkObjectType } from "@/lib/domain/types";
import { describeEvent, statusLabel, tierLabel, typeLabel } from "@/lib/labels";
import {
  getArtifacts,
  getBudgetSummary,
  getChildren,
  getCurrentVersion,
  getEventLog,
  getMemoryCard,
  getWorkObject,
  listPeople,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWorkObject(id);
  if (!work) notFound();

  const [log, children, people, budget, artifactList, currentVersion, memoryCard] = await Promise.all([
    getEventLog(id),
    getChildren(id),
    listPeople(),
    getBudgetSummary(id),
    getArtifacts(id),
    getCurrentVersion(id),
    getMemoryCard(id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/work" className="text-sm text-neutral-500 hover:underline">
          ← Work
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{work.title}</h1>
            <div className="mt-1 text-sm text-neutral-500">{typeLabel(work.type)}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge>{tierLabel(work.tier)}</Badge>
            <Badge tone="blue">{statusLabel(work.status)}</Badge>
            {work.mode && <Badge tone="amber">{statusLabel(work.mode)}</Badge>}
            {currentVersion > 1 && <Badge>v{currentVersion}</Badge>}
          </div>
        </div>
        {work.why && <p className="mt-3 text-sm text-neutral-700">{work.why}</p>}
        {work.definitionOfDone && (
          <p className="mt-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-700">Done means:</span> {work.definitionOfDone}
          </p>
        )}
      </div>

      {children.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Contains
          </h2>
          <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
            {children.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <Link href={`/work/${c.id}`} className="hover:underline">
                  {c.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge>{tierLabel(c.tier)}</Badge>
                  <Badge tone="blue">{statusLabel(c.status)}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tier &amp; production
        </h2>
        <Governance
          workObjectId={id}
          tier={work.tier}
          mode={work.mode}
          suggestedTier={suggestTier({ type: work.type as WorkObjectType, title: work.title })}
          people={people.map((p) => ({ id: p.id, name: p.name }))}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Effort budget
        </h2>
        <div className="grid grid-cols-2 gap-3 rounded border border-neutral-200 bg-white p-4 text-sm sm:grid-cols-4">
          <div>
            <div className="text-xs text-neutral-500">Approved</div>
            <div className="font-medium">
              {budget.approvedHours == null ? "—" : `${budget.approvedHours}h`}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Confirmed</div>
            <div className="font-medium">{budget.confirmedHours}h</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Remaining</div>
            <div className="font-medium">
              {budget.remainingHours == null ? "—" : `${budget.remainingHours}h`}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Variance</div>
            <div className="font-medium">
              {budget.varianceHours == null
                ? "—"
                : `${budget.varianceHours > 0 ? "+" : ""}${budget.varianceHours}h`}
            </div>
          </div>
        </div>
      </section>

      {work.status === "in_review" && (
        <section>
          <ReviewOutcome
            workObjectId={id}
            people={people.map((p) => ({ id: p.id, name: p.name }))}
          />
        </section>
      )}

      {work.status === "closing" && (
        <section>
          <CloseoutForm
            workObjectId={id}
            people={people.map((p) => ({ id: p.id, name: p.name }))}
          />
        </section>
      )}

      {memoryCard && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Memory
          </h2>
          <MemoryCard card={memoryCard} />
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Artifacts
        </h2>
        <Artifacts
          workObjectId={id}
          artifactList={artifactList}
          currentVersion={currentVersion}
          people={people.map((p) => ({ id: p.id, name: p.name }))}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Add an update
        </h2>
        <div className="space-y-3">
          <CommandBar currentWorkObjectId={id} />
          <AddUpdate workObjectId={id} people={people.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Project log
        </h2>
        <ol className="space-y-2">
          {log.map((entry) => (
            <li
              key={entry.id}
              className="flex items-baseline justify-between gap-4 rounded border border-neutral-200 bg-white px-4 py-2 text-sm"
            >
              <span>{describeEvent(entry.type, entry.payload)}</span>
              <span className="shrink-0 text-xs text-neutral-400">
                {entry.actorName ?? "system"} · {new Date(entry.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
