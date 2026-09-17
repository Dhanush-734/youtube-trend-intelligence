"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  BarChart3,
  Users,
  Grid,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/rising", label: "Rising", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/channels", label: "Channels", icon: Users },
  { href: "/categories", label: "Categories", icon: Grid },
];

function Links() {
  const pathname = usePathname();
  const params = useSearchParams();
  const region = params.get("region");
  const suffix = region ? `?region=${region}` : "";

  return (
    <nav className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={`${link.href}${suffix}`}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
              active
                ? "bg-raised text-cool shadow-sm font-semibold"
                : "text-muted hover:bg-raised/60 hover:text-text"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 transition-colors ${
                active ? "text-cool" : "text-muted group-hover:text-text"
              }`}
            />
            <span>{link.label}</span>
            {active && (
              <span className="absolute inset-x-2 -bottom-1.5 h-0.5 rounded-full bg-cool" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavLinks() {
  return (
    <Suspense fallback={<div className="h-8 w-64 bg-raised/40 rounded-lg animate-pulse" />}>
      <Links />
    </Suspense>
  );
}
