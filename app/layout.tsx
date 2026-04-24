import type { Metadata } from "next";
import { Exo_2, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ThemeProvider } from "@/components/ThemeProvider";

const exo2 = Exo_2({
  variable: "--font-exo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
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
        className={`${exo2.variable} ${robotoMono.variable} min-h-screen font-sans text-zinc-900 antialiased dark:text-zinc-100`}
      >
        <ThemeProvider>
          <SiteNav />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-zinc-200/50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700/30 dark:text-zinc-400">
            <a
              href="https://github.com/charlieviettq"
              className="font-medium text-amber-600 hover:text-purple-600 dark:text-amber-400 dark:hover:text-purple-400"
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://www.linkedin.com/in/aivietqt/"
              className="font-medium text-amber-600 hover:text-purple-600 dark:text-amber-400 dark:hover:text-purple-400"
            >
              LinkedIn
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
