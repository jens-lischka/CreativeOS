import { NewWorkForm } from "@/components/new-work-form";
import { listPeople } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewWorkPage() {
  const people = await listPeople();
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">New work</h1>
      <NewWorkForm people={people.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
