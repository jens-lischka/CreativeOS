import Link from "next/link";

const NAV = [
  { href: "/today", label: "Today" },
  { href: "/work", label: "Work" },
  { href: "/files", label: "Files" },
  { href: "/reports", label: "Reports" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-3">
          <Link href="/today" className="font-semibold tracking-tight">
            CreativeOS
          </Link>
          <nav className="flex gap-4 text-sm text-neutral-600">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-neutral-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
