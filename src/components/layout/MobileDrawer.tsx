"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, Settings, Play } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function MobileDrawer({ open, onClose, onOpenSettings }: MobileDrawerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const suffix = region ? `?region=${region}` : "";

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 flex w-4/5 max-w-xs flex-col border-r border-yt-border bg-yt-card shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-yt-border">
          <Link
            href={`/${suffix}`}
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yt-red text-white shadow-[0_0_12px_rgba(255,0,0,0.4)]">
              <Play className="h-3.5 w-3.5 fill-white translate-x-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white">
                Trend <span className="text-yt-red">Intelligence</span>
              </span>
              <span className="text-[10px] text-yt-secondary">YouTube Analytics</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
            aria-label="Close navigation drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-yt-muted">
            Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={`${item.href}${suffix}`}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-yt-elevated text-white border-l-2 border-yt-red"
                    : "text-yt-secondary hover:bg-yt-elevated/60 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-yt-red" : "text-yt-secondary"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions & credit */}
        <div className="border-t border-yt-border p-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings & Controls</span>
          </button>

          {/* Developer credit */}
          <div className="pt-2 border-t border-yt-border/50 text-center">
            <p className="text-[11px] text-yt-muted select-none">
              Developed by <span className="text-yt-secondary">Shivani</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
