"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { REGIONS } from "@/lib/youtube";

export function RegionPicker({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function choose(code: string) {
    const next = new URLSearchParams(params.toString());
    next.set("region", code);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div
      role="group"
      aria-label="Country Region Selector"
      className={`flex flex-wrap items-center gap-2 ${pending ? "opacity-60" : ""}`}
    >
      {REGIONS.map((r) => {
        const isSelected = r.code === current;
        return (
          <button
            key={r.code}
            type="button"
            onClick={() => choose(r.code)}
            aria-pressed={isSelected}
            title={`View trending intelligence for ${r.name}`}
            className={`group relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? "border-yt-red bg-yt-red/15 text-white shadow-[0_0_14px_rgba(255,0,0,0.25)]"
                : "border-yt-border bg-yt-card text-yt-secondary hover:border-yt-secondary/40 hover:bg-yt-elevated hover:text-white"
            }`}
          >
            <span aria-hidden className="text-sm">
              {r.flag}
            </span>
            <span>{r.code}</span>
            <span className="hidden sm:inline text-[11px] font-normal opacity-80">
              {r.name}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yt-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yt-red" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
