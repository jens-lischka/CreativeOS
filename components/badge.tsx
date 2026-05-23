export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "amber" | "green" | "red";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
