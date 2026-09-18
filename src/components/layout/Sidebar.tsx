"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  Flame,
  Rocket,
  BarChart2,
  Users,
  Music2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home, highlight: false },
  { href: "/trending", label: "Trending", icon: Flame, highlight: true },
  { href: "/rising", label: "Rising", icon: Rocket, highlight: true },
  { href: "/analytics", label: "Analytics", icon: BarChart2, highlight: false },
  { href: "/channels", label: "Channels", icon: Users, highlight: false },
  { href: "/categories", label: "Categories", icon: Music2, highlight: false },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, onOpenSettings }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const suffix = region ? `?region=${region}` : "";

  return (
    <aside
      aria-label="Desktop Sidebar"
      className={`fixed top-0 bottom-0 left-0 z-40 hidden md:flex flex-col border-r border-yt-border bg-yt-card transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[250px]"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-yt-border">
        <Link
          href={`/${suffix}`}
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
          title="YouTube Trend Intelligence"
        >
          {/* YouTube-inspired Play Badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yt-red text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] group-hover:scale-105 transition-transform">
            <Play className="h-4 w-4 fill-white translate-x-0.5" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
                Trend <span className="text-yt-red">Intelligence</span>
              </span>
              <span className="text-[10px] text-yt-secondary truncate font-medium">
                SaaS Video Analytics
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-yt-border bg-yt-elevated text-yt-secondary hover:text-white hover:border-yt-secondary/40 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1.5">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-yt-muted">
            Intelligence Suite
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={`${item.href}${suffix}`}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-yt-elevated text-white shadow-sm"
                  : "text-yt-secondary hover:bg-yt-elevated/70 hover:text-white"
              }`}
            >
              {/* Active Red Indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-yt-red shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
              )}

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
                  isActive
                    ? "text-yt-red"
                    : "text-yt-secondary group-hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!collapsed && item.highlight && (
                <span className="h-1.5 w-1.5 rounded-full bg-yt-red/80 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Settings & Developer Credit */}
      <div className="shrink-0 border-t border-yt-border p-3 space-y-3">
        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={collapsed ? "Settings & Controls" : undefined}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-yt-secondary hover:bg-yt-elevated hover:text-white transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Settings className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-45" />
          {!collapsed && <span className="truncate">Settings & Pipeline</span>}
        </button>

        {/* Developer Credit: Developed by Shivani */}
        <div
          className={`pt-2 border-t border-yt-border/50 text-center ${
            collapsed ? "px-1" : "px-2"
          }`}
        >
          {!collapsed ? (
            <p className="text-[11px] text-yt-muted tracking-tight select-none">
              Developed by <span className="text-yt-secondary">Shivani</span>
            </p>
          ) : (
            <p className="text-[9px] text-yt-muted tracking-tighter" title="Developed by Shivani">
              Shivani
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
