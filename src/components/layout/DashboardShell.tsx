"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { TopHeader } from "./TopHeader";
import { SettingsModal } from "./SettingsModal";
import { isRegion } from "@/lib/youtube";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const searchParams = useSearchParams();
  const activeRegion = isRegion(searchParams.get("region") ?? undefined)
    ? (searchParams.get("region") as string)
    : "IN";

  return (
    <div className="min-h-screen bg-yt-bg text-yt-text flex">
      {/* Desktop Fixed Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeRegion={activeRegion}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "md:pl-[72px]" : "md:pl-[250px]"
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 md:py-8">
          {children}
        </main>

        {/* Subtle Bottom Footer */}
        <footer className="border-t border-yt-border/60 bg-yt-card/40 py-6 text-xs text-yt-secondary">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <div className="text-center sm:text-left">
              <span className="font-semibold text-white">YouTube Trend Intelligence</span> · Near-Real-Time Analytics Platform
              <div className="mt-1 text-[11px] text-yt-muted">
                PostgreSQL 18 Snapshot Intelligence · YouTube Data API v3 (<code className="text-yt-red">videos.list</code>)
              </div>
            </div>
            <div className="text-center sm:text-right max-w-md text-[11px] leading-relaxed text-yt-muted">
              <strong className="text-white font-medium">Custom Trend Score:</strong> Percentile formulation (50% Velocity, 20% Engagement, 15% Recency, 15% Popularity). Deterministic empirical analysis.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-yt-bg text-white flex">
          <div className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6">{children}</div>
        </div>
      }
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
