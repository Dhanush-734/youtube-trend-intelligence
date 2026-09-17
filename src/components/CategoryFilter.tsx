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
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={buildUrl()}
        aria-current={!current ? "page" : undefined}
        className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
          !current
            ? "border-cool bg-cool/15 text-cool shadow-[0_0_10px_rgba(86,168,255,0.2)]"
            : "border-edge bg-panel text-muted hover:border-edge/90 hover:bg-raised hover:text-text"
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
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
              isCurrent
                ? "border-cool bg-cool/15 text-cool shadow-[0_0_10px_rgba(86,168,255,0.2)]"
                : "border-edge bg-panel text-muted hover:border-edge/90 hover:bg-raised hover:text-text"
            }`}
          >
            {c.category_name}
          </Link>
        );
      })}
    </div>
  );
}
