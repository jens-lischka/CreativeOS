import Link from "next/link";
import { Badge } from "@/components/badge";
import { statusLabel, tierLabel, typeLabel } from "@/lib/labels";
import { listWorkObjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const items = await listWorkObjects();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Work</h1>
        <Link
          href="/work/new"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          New work
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No work yet. Create the first piece of work.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <Link href={`/work/${item.id}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  <span>{typeLabel(item.type)}</span>
                  {item.ownerName && <span>· {item.ownerName}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{tierLabel(item.tier)}</Badge>
                <Badge tone="blue">{statusLabel(item.status)}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
