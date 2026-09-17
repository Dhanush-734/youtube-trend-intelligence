import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavLinks } from "@/components/NavLinks";
import { ManualSyncModal } from "@/components/ManualSyncModal";
import { AutoRefresh } from "@/components/AutoRefresh";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "TrendX — YouTube Trend Intelligence & Analytics Platform",
  description:
    "Production-grade near-real-time YouTube analytics platform: observed growth rates, view velocities, channel leaderboards, and custom trend scores computed from immutable PostgreSQL snapshots.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-ink text-text font-sans antialiased selection:bg-cool/30 selection:text-cool">
        <header className="sticky top-0 z-40 border-b border-edge/80 bg-ink/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="group flex shrink-0 items-center gap-2.5 font-display text-base font-bold tracking-tight text-text"
              >
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-heat to-cool p-0.5 shadow-[0_0_14px_rgba(255,122,69,0.3)]">
                  <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-ink font-display font-black text-cool text-xs">
                    TX
                  </div>
                </div>
                <span>
                  Trend<span className="text-heat">X</span>
                </span>
                <span className="hidden md:inline rounded-full border border-edge bg-raised px-2 py-0.5 text-[10px] font-medium text-muted">
                  v1.0 · Intelligence
                </span>
              </Link>
              <NavLinks />
            </div>

            <div className="flex items-center gap-2.5">
              <AutoRefresh intervalSeconds={60} />
              <ManualSyncModal region="IN" />
              <a
                href="https://github.com/Dhanush-734/youtube-trend-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository @Dhanush-734"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-raised/80 text-muted transition hover:border-cool/40 hover:bg-panel hover:text-text"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="border-t border-edge/60 bg-panel/30 py-8 text-xs text-muted">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <div>
              <span className="font-semibold text-text">YouTube Trend Intelligence Platform</span> · MCA Final Year Project
              <div className="mt-1 text-[11px] text-muted">
                Developed by{" "}
                <a
                  href="https://github.com/Dhanush-734"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-cool underline hover:text-cool/80"
                >
                  Dhanush S (@Dhanush-734)
                </a>{" "}
                · PostgreSQL 18 + YouTube Data API v3 (<code className="text-cool">videos.list</code>).
              </div>
            </div>
            <div className="text-center sm:text-right max-w-md text-[11px] leading-relaxed text-muted/80">
              <strong className="text-text">Custom Trend Score:</strong> Multi-factor percentile rank (Velocity 50%, Engagement 20%, Recency 15%, Reach 15%).
              Derived strictly from observed historical snapshots — not an official YouTube metric and does not forecast future trends.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
