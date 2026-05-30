import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-12">
      {children}
    </main>
  );
}
