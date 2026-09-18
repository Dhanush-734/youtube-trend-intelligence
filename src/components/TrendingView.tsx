"use client";

import { useState } from "react";
import { LayoutGrid, List, Sparkles } from "lucide-react";
import { VideoCard, VideoRow } from "@/components/ui";
import type { ScoredVideo } from "@/lib/queries";

export function TrendingView({
  videos,
  region,
}: {
  videos: ScoredVideo[];
  region: string;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-4">
      {/* Subheader with View Switcher */}
      <div className="flex items-center justify-between px-1 text-xs text-yt-secondary">
        <span className="font-semibold text-white">
          Showing {videos.length} videos on trending chart
        </span>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-yt-secondary">
            <Sparkles className="h-3.5 w-3.5 text-yt-red" />
            <span>Ranked by Custom Trend Score (0–100)</span>
          </span>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-yt-border bg-yt-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-yt-red text-white shadow-sm"
                  : "text-yt-secondary hover:text-white"
              }`}
              title="Grid View (3–4 columns)"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List View"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-yt-red text-white shadow-sm"
                  : "text-yt-secondary hover:text-white"
              }`}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Grid or List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v, i) => (
            <VideoCard key={v.video_id} video={v} rank={i + 1} region={region} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v, i) => (
            <VideoRow key={v.video_id} video={v} rank={i + 1} region={region} />
          ))}
        </div>
      )}
    </div>
  );
}
