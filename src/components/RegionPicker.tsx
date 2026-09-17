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
      className={`flex flex-wrap items-center gap-1.5 ${pending ? "opacity-60" : ""}`}
    >
      {REGIONS.map((r) => {
        const isSelected = r.code === current;
        return (
          <button
            key={r.code}
            type="button"
            onClick={() => choose(r.code)}
            aria-pressed={isSelected}
            title={`View trending videos for ${r.name}`}
            className={`group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              isSelected
                ? "border-cool bg-cool/15 text-text shadow-[0_0_12px_rgba(86,168,255,0.25)]"
                : "border-edge bg-panel text-muted hover:border-edge/90 hover:bg-raised hover:text-text"
            }`}
          >
            <span aria-hidden className="text-sm">
              {r.flag}
            </span>
            <span>{r.code}</span>
            <span className="hidden sm:inline text-[11px] font-normal opacity-70">
              {r.name}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cool opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cool" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
