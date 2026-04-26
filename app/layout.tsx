import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopProgressBar } from "@/components/TopProgressBar";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans text-zinc-900 antialiased dark:text-zinc-100`}
      >
        <ThemeProvider>
          <TopProgressBar />
          <SiteNav />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-sky-200/60 px-4 py-8 text-center text-sm text-zinc-600 dark:border-sky-500/20 dark:text-zinc-400">
            <a
              href="https://github.com/charlieviettq"
              className="font-medium text-sky-700 hover:text-indigo-600 dark:text-sky-400 dark:hover:text-indigo-300"
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://www.linkedin.com/in/aivietqt/"
              className="font-medium text-sky-700 hover:text-indigo-600 dark:text-sky-400 dark:hover:text-indigo-300"
            >
              LinkedIn
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
