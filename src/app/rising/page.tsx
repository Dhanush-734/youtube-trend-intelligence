import Link from "next/link";
import { TrendingUp, Flame, Info, Eye, Zap, Layers } from "lucide-react";
import {
  getRising,
  RISING_MIN_VELOCITY,
  RISING_MIN_VIEWS,
} from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact, timeAgo } from "@/lib/format";
import { EmptyState, RegionPicker, ScoreBadge } from "@/components/ui";
import { SearchBar } from "@/components/SearchBar";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function RisingPage({
  searchParams,
}: {
  searchParams: { region?: string; q?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;
  const queryText = searchParams.q ?? null;

  const videos = await getRising(region, 40, 48, queryText);

  const exportData = videos.map((v, i) => ({
    Rank: i + 1,
    Title: v.title,
    Channel: v.channel_name,
    ViewsNow: v.view_count,
    ViewsGained: v.view_delta,
    ViewsPerHour: Math.round(v.views_per_hour),
    GrowthPct: v.growth_pct ?? 0,
    WindowHours: v.window_hours,
    EngagementRate: v.engagement_rate ?? 0,
    TrendScore: v.trend_score,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-heat" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Rising Breakouts in {regionName}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted max-w-2xl leading-relaxed">
            Rule-based detection measuring observed growth between consecutive snapshots.
            A video qualifies once it clears the <strong className="text-text">{compact(RISING_MIN_VIEWS)} view floor</strong> and is climbing at <strong className="text-text">&gt;{compact(RISING_MIN_VELOCITY)} views/hr</strong>.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {/* Threshold Explanation Banner */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-edge bg-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cool/10 text-cool border border-cool/20">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted">View Count Floor</div>
            <div className="tnum font-display text-lg font-bold text-text">
              &ge; {compact(RISING_MIN_VIEWS)}
            </div>
            <div className="text-[10px] text-muted">Excludes small base percentage spikes</div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-heat/10 text-heat border border-heat/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted">Velocity Threshold</div>
            <div className="tnum font-display text-lg font-bold text-heat">
              &ge; +{compact(RISING_MIN_VELOCITY)}/hr
            </div>
            <div className="text-[10px] text-muted">Computed from actual window time</div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-good/10 text-good border border-good/20">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted">Algorithm Methodology</div>
            <div className="text-xs font-bold text-text">Deterministic &amp; Rule-Based</div>
            <div className="text-[10px] text-muted">Observed growth, zero ML speculation</div>
          </div>
        </div>
      </div>

      {/* Search and Export Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-edge bg-panel/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchBar
            placeholder="Filter rising videos..."
            initialQuery={queryText ?? ""}
            showSort={false}
          />
        </div>
        {videos.length > 0 && (
          <div className="shrink-0">
            <ExportButton
              filename={`youtube_rising_${region}_${new Date().toISOString().slice(0, 10)}`}
              data={exportData}
              label="Export Rising CSV"
            />
          </div>
        )}
      </div>

      {/* Rising Video Rows */}
      {videos.length === 0 ? (
        <EmptyState
          title="No videos currently clearing the rising thresholds"
          body="Either the collector has only run once, or no tracked video is currently gaining faster than 5,000 views/hr. Growth requires two snapshots to compare."
        />
      ) : (
        <div className="space-y-3">
          {videos.map((v, i) => (
            <Link
              key={v.video_id}
              href={`/video/${v.video_id}?region=${region}`}
              className="group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-heat/30 bg-panel p-4 transition-all duration-300 hover:border-heat/70 hover:bg-raised hover:shadow-[0_0_15px_rgba(255,122,69,0.12)]"
            >
              <div className="flex sm:flex-col items-center justify-between sm:justify-center w-8 shrink-0 text-center">
                <span className="tnum font-display text-base font-bold text-heat">
                  #{i + 1}
                </span>
                <Flame className="h-3.5 w-3.5 text-heat mt-0.5" />
              </div>

              {/* Thumbnail */}
              <div className="relative shrink-0 overflow-hidden rounded-lg border border-edge sm:w-36 aspect-video bg-raised">
                {v.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <Layers className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-text group-hover:text-heat transition-colors">
                  {v.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-text/80">{v.channel_name}</span>
                  <span>•</span>
                  <span>Published {timeAgo(v.published_at)}</span>
                  <span>•</span>
                  <span>Window: {v.window_hours.toFixed(2)}h</span>
                </div>

                <div className="tnum mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>{compact(v.view_count)} views now</span>
                  {v.growth_pct !== null && (
                    <span className="rounded bg-heat/15 px-1.5 py-0.5 text-heat font-semibold">
                      +{v.growth_pct}%
                    </span>
                  )}
                  {v.engagement_rate !== null && (
                    <span className="text-good font-medium">
                      {v.engagement_rate}% engagement
                    </span>
                  )}
                </div>
              </div>

              {/* Velocity Highlight */}
              <div className="flex sm:flex-col items-center justify-between sm:justify-center sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-edge/60">
                <div className="tnum font-display text-lg font-bold text-heat sm:text-xl">
                  +{compact(v.view_delta)}
                </div>
                <div className="tnum text-xs font-semibold text-heat/90">
                  +{compact(Math.round(v.views_per_hour))}/hr
                </div>
                <div className="mt-1.5 flex sm:justify-end">
                  <ScoreBadge score={v.trend_score} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
