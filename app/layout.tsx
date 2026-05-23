import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreativeOS",
  description: "A memory system for creative work — built from explicit inputs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
