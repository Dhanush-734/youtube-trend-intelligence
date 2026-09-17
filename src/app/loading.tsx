export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-lg bg-raised" />
          <div className="h-4 w-40 rounded bg-raised/60" />
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-14 rounded-lg bg-raised" />
          ))}
        </div>
      </div>

      {/* KPI stats skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-edge bg-panel p-4 space-y-3">
            <div className="h-3 w-20 rounded bg-raised" />
            <div className="h-7 w-28 rounded bg-raised" />
          </div>
        ))}
      </div>

      {/* Content list skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-5 w-48 rounded bg-raised" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-edge bg-panel p-4"
          >
            <div className="h-5 w-6 rounded bg-raised" />
            <div className="h-16 w-28 rounded-lg bg-raised shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-raised" />
              <div className="h-3 w-1/3 rounded bg-raised/60" />
            </div>
            <div className="h-8 w-12 rounded-lg bg-raised shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
