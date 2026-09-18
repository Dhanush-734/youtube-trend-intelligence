export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-3xl border border-yt-border bg-yt-card p-6 sm:p-8 space-y-4">
        <div className="h-4 w-48 rounded-full bg-yt-elevated" />
        <div className="h-8 w-72 sm:w-96 rounded-xl bg-yt-elevated" />
        <div className="h-4 w-60 rounded-lg bg-yt-elevated/70" />
      </div>

      {/* KPI stats skeleton: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-yt-border bg-yt-card p-5 space-y-3">
            <div className="h-3 w-20 rounded bg-yt-elevated" />
            <div className="h-8 w-32 rounded bg-yt-elevated" />
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-5 w-52 rounded-lg bg-yt-elevated" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-yt-border bg-yt-card p-4 space-y-3"
            >
              <div className="aspect-video w-full rounded-xl bg-yt-elevated" />
              <div className="h-4 w-3/4 rounded bg-yt-elevated" />
              <div className="h-3 w-1/2 rounded bg-yt-elevated/60" />
              <div className="h-6 w-1/3 rounded-lg bg-yt-elevated/40 pt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
