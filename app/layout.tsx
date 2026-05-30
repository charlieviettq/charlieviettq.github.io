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
          <footer className="border-t border-[var(--border-warm)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Tran Quoc Viet / Charlie
                </p>
                <p className="mt-1" style={{ color: "var(--foreground-secondary)" }}>
                  Credit risk ML, data platforms, and production GenAI.
                </p>
              </div>
              <div className="flex items-center gap-4 font-semibold">
                <a
                  href="https://github.com/charlieviettq"
                  className="transition-colors hover:text-[var(--brand-from)]"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/aivietqt/"
                  className="transition-colors hover:text-[var(--brand-from)]"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
