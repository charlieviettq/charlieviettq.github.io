import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopProgressBar } from "@/components/TopProgressBar";

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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <TopProgressBar />
          <SiteNav />
          <main>{children}</main>
          <ScrollToTop />
          <footer
            className="mx-auto max-w-6xl px-4 py-8 text-center text-sm"
            style={{
              borderTop: "1px solid var(--border-warm)",
              color: "var(--foreground-secondary)",
            }}
          >
            <a
              href="https://github.com/charlieviettq"
              className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400"
              style={{ color: "var(--foreground-secondary)" }}
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://www.linkedin.com/in/aivietqt/"
              className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400"
              style={{ color: "var(--foreground-secondary)" }}
            >
              LinkedIn
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
