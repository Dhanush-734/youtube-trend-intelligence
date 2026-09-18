"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function CategoryFilter({
  categories,
  current,
  region,
}: {
  categories: { category_id: string; category_name: string }[];
  current: string | null;
  region: string;
}) {
  const searchParams = useSearchParams();

  if (categories.length === 0) return null;

  const buildUrl = (id?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("region", region);
    if (id) {
      p.set("category", id);
    } else {
      p.delete("category");
    }
    return `/trending?${p.toString()}`;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <Link
        href={buildUrl()}
        aria-current={!current ? "page" : undefined}
        className={`shrink-0 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
          !current
            ? "border-yt-red bg-yt-red/15 text-white shadow-[0_0_12px_rgba(255,0,0,0.25)]"
            : "border-yt-border bg-yt-elevated text-yt-secondary hover:border-yt-secondary/40 hover:text-white"
        }`}
      >
        All Categories
      </Link>
      {categories.map((c) => {
        const isCurrent = current === c.category_id;
        return (
          <Link
            key={c.category_id}
            href={buildUrl(c.category_id)}
            aria-current={isCurrent ? "page" : undefined}
            className={`shrink-0 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isCurrent
                ? "border-yt-red bg-yt-red/15 text-white shadow-[0_0_12px_rgba(255,0,0,0.25)]"
                : "border-yt-border bg-yt-elevated text-yt-secondary hover:border-yt-secondary/40 hover:text-white"
            }`}
          >
            {c.category_name}
          </Link>
        );
      })}
    </div>
  );
}
