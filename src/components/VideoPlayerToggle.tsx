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
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-edge bg-raised shadow-lg">
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
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black"
              title="Close Player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="group relative h-full w-full cursor-pointer" onClick={() => setPlaying(true)}>
            {thumbnailUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <Film className="h-10 w-10" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all group-hover:bg-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-heat/90 text-white shadow-xl transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </div>
            </div>
            <span className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 text-[11px] font-semibold text-white">
              Preview Video
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-edge bg-panel px-3 py-2 text-xs font-semibold text-text hover:bg-raised transition-all"
        >
          <Play className="h-3.5 w-3.5 text-heat" />
          {playing ? "Close Preview" : "Play Embedded"}
        </button>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-panel px-3 py-2 text-xs font-semibold text-muted hover:border-cool/40 hover:text-text transition-all"
        >
          <span>YouTube</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
