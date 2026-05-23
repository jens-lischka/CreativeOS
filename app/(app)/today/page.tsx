import Link from "next/link";
import { Badge } from "@/components/badge";
import { CommandBar } from "@/components/command-bar";
import { statusLabel, tierLabel, typeLabel } from "@/lib/labels";
import { listWorkObjects, type WorkObjectListItem } from "@/lib/queries";

export const dynamic = "force-dynamic";

function Section({ title, items }: { title: string; items: WorkObjectListItem[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <Link href={`/work/${item.id}`} className="hover:underline">
                {item.title}
                <span className="ml-2 text-xs text-neutral-400">{typeLabel(item.type)}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Badge>{tierLabel(item.tier)}</Badge>
                <Badge tone="blue">{statusLabel(item.status)}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const ACTIVE = ["shaping", "exploring", "ready_for_production", "in_production"];

export default async function TodayPage() {
  const items = await listWorkObjects();
  const reviews = items.filter((i) => i.status === "in_review");
  const blocked = items.filter((i) => i.status === "waiting");
  const commitments = items.filter((i) => ACTIVE.includes(i.status));

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Today</h1>
      <CommandBar />
      <Section title="My commitments" items={commitments} />
      <Section title="Reviews to respond to" items={reviews} />
      <Section title="Blocked work" items={blocked} />
    </div>
  );
}
