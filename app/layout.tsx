import type { Metadata } from "next";
import { Exo_2, Lora, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";

const exo2 = Exo_2({
  variable: "--font-exo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
        className={`${exo2.variable} ${lora.variable} ${robotoMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <SiteNav />
          <main>{children}</main>
          <ScrollToTop />
          <footer
            className="mx-auto max-w-6xl px-4 py-8 text-center text-sm"
            style={{ borderTop: "1px solid var(--border-warm)", color: "var(--foreground-secondary)" }}
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
