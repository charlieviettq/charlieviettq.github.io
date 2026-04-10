import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://charlieviettq.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Charlie Viet — Data, ML & GenAI",
    template: "%s · Charlie Viet",
  },
  description:
    "Personal site — Data platform, ML, GenAI, credit risk DS; blog and links.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Charlie Viet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <SiteNav />
        <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
        <footer className="mx-auto max-w-3xl border-t border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <a
            href="https://github.com/charlieviettq"
            className="hover:text-sky-600 dark:hover:text-sky-400"
          >
            GitHub
          </a>
          {" · "}
          <a
            href="https://www.linkedin.com/in/aivietqt/"
            className="hover:text-sky-600 dark:hover:text-sky-400"
          >
            LinkedIn
          </a>
        </footer>
      </body>
    </html>
  );
}
