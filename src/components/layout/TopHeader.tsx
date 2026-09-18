"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  Search,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  Play,
  Zap,
} from "lucide-react";
import { REGIONS, isRegion } from "@/lib/youtube";
import { AutoRefresh } from "@/components/AutoRefresh";

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
}

export function TopHeader({ onOpenMobileMenu, onOpenSettings }: TopHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRegion = isRegion(searchParams.get("region") ?? undefined)
    ? (searchParams.get("region") as string)
    : "IN";

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  function handleRegionChange(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("region", code);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchQuery.trim());
    params.set("region", currentRegion);
    router.push(`/trending?${params.toString()}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-yt-border bg-yt-card/90 px-4 md:px-6 backdrop-blur-md">
      {/* Mobile left: Hamburger ☰ + Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href={`/?region=${currentRegion}`} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yt-red text-white shadow-[0_0_10px_rgba(255,0,0,0.4)]">
            <Play className="h-3 w-3 fill-white translate-x-0.5" />
          </div>
          <span className="font-bold text-sm text-white">
            Trend <span className="text-yt-red">Intelligence</span>
          </span>
        </Link>
      </div>

      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-md items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-yt-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube videos, creators, or topics..."
            className="w-full rounded-xl border border-yt-border bg-yt-bg py-2 pl-10 pr-4 text-xs text-white placeholder:text-yt-muted focus:border-yt-red focus:bg-yt-elevated/50 focus:outline-none focus:ring-1 focus:ring-yt-red transition-all"
          />
        </form>
      </div>

      {/* Action items on right (Desktop & Mobile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Toggle */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl p-2 text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Region Selector Dropdown / Pills */}
        <div className="relative flex items-center">
          <label htmlFor="country-selector" className="sr-only">
            Select Country
          </label>
          <div className="flex items-center gap-1.5 rounded-xl border border-yt-border bg-yt-elevated px-2.5 py-1.5 text-xs text-white hover:border-yt-secondary/40 transition-colors">
            <Globe className="h-3.5 w-3.5 text-yt-red shrink-0" />
            <select
              id="country-selector"
              value={currentRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code} className="bg-yt-card text-white">
                  {r.flag} {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Auto-Refresh sync timer */}
        <div className="hidden sm:flex items-center">
          <AutoRefresh intervalSeconds={60} />
        </div>

        {/* Sync Engine / Controls */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 rounded-xl border border-yt-red/40 bg-yt-red/10 px-3 py-1.5 text-xs font-semibold text-yt-red hover:bg-yt-red hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,0,0.15)]"
          title="Manual Sync Engine"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync Engine</span>
        </button>
      </div>

      {/* Mobile Search Bar Expandable Drawer */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-yt-border bg-yt-card p-3 md:hidden shadow-xl animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators..."
              className="w-full rounded-xl border border-yt-border bg-yt-bg py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-yt-muted focus:border-yt-red focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-yt-secondary" />
          </form>
        </div>
      )}
    </header>
  );
}
