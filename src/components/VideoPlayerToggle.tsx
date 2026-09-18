"use client";

import { useState } from "react";
import { Play, ExternalLink, Film, X } from "lucide-react";

export function VideoPlayerToggle({
  videoId,
  title,
  thumbnailUrl,
}: {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-yt-border bg-yt-elevated shadow-xl">
        {playing ? (
          <div className="relative h-full w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
            <button
              type="button"
              onClick={() => setPlaying(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black transition-colors"
              title="Close Player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className="group relative h-full w-full cursor-pointer"
            onClick={() => setPlaying(true)}
          >
            {thumbnailUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-yt-muted">
                <Film className="h-10 w-10" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all group-hover:bg-black/15">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yt-red text-white shadow-2xl transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 fill-white translate-x-0.5" />
              </div>
            </div>
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/85 px-2.5 py-1 text-[11px] font-bold text-white border border-white/10 backdrop-blur-sm">
              Click to Play
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-yt-border bg-yt-card px-4 py-2.5 text-xs font-semibold text-white hover:bg-yt-elevated hover:border-yt-red/40 transition-all"
        >
          <Play className="h-3.5 w-3.5 text-yt-red fill-yt-red" />
          <span>{playing ? "Close Preview" : "Play Embedded"}</span>
        </button>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-yt-border bg-yt-card px-4 py-2.5 text-xs font-semibold text-yt-secondary hover:text-white hover:border-yt-secondary/40 transition-all"
        >
          <span>Watch on YouTube</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
