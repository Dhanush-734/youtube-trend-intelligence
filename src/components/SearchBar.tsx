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
  placeholder = "Search videos or channels...",
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
    <div className={`flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between ${pending ? "opacity-75" : ""}`}>
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-edge bg-panel py-2 pl-9 pr-8 text-xs text-text placeholder:text-muted focus:border-cool focus:bg-raised focus:outline-none focus:ring-1 focus:ring-cool transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {showSort && (
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="sort-select" className="flex items-center gap-1.5 text-muted font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5 text-cool" />
            Sort by:
          </label>
          <select
            id="sort-select"
            value={searchParams.get("sort") ?? initialSort}
            onChange={handleSortChange}
            className="rounded-md border border-edge bg-panel px-2.5 py-1.5 text-xs text-text focus:border-cool focus:outline-none transition-colors"
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
