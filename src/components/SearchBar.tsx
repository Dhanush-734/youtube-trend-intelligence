"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
  initialSort?: string;
  showSort?: boolean;
}

export function SearchBar({
  placeholder = "Search videos or creators...",
  initialQuery = "",
  initialSort = "score",
  showSort = true,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  function updateParams(newQuery: string, newSort?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
    }

    if (newSort) {
      if (newSort === "score") {
        params.delete("sort");
      } else {
        params.set("sort", newSort);
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams(query);
  }

  function handleClear() {
    setQuery("");
    updateParams("");
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateParams(query, e.target.value);
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
        pending ? "opacity-75" : ""
      }`}
    >
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-yt-secondary">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-yt-border bg-yt-bg py-2.5 pl-10 pr-9 text-xs text-white placeholder:text-yt-muted focus:border-yt-red focus:bg-yt-elevated/40 focus:outline-none focus:ring-1 focus:ring-yt-red transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-yt-secondary hover:text-white"
            aria-label="Clear search query"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {showSort && (
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="sort-select" className="flex items-center gap-1.5 text-yt-secondary font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5 text-yt-red" />
            Sort:
          </label>
          <select
            id="sort-select"
            value={searchParams.get("sort") ?? initialSort}
            onChange={handleSortChange}
            className="rounded-xl border border-yt-border bg-yt-elevated px-3 py-2 text-xs font-semibold text-white focus:border-yt-red focus:outline-none transition-colors cursor-pointer"
          >
            <option value="score">Custom Trend Score</option>
            <option value="views">Total Views</option>
            <option value="velocity">Velocity (Views/hr)</option>
            <option value="growth">Growth (%)</option>
            <option value="engagement">Engagement Rate</option>
          </select>
        </div>
      )}
    </div>
  );
}
