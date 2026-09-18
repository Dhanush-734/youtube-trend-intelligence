import Link from "next/link";
import { TrendingUp, Flame, Info, Eye, Zap, Layers, Rocket, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-yt-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
              <Rocket className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              🚀 Rising Fast in {regionName}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-yt-secondary max-w-2xl leading-relaxed">
            Rule-based breakout detection measuring observed growth between consecutive snapshots.
            A video qualifies once it clears the <strong className="text-white">{compact(RISING_MIN_VIEWS)} view floor</strong> and is climbing at <strong className="text-yt-red">&gt;{compact(RISING_MIN_VELOCITY)} views/hr</strong>.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {/* Explicit Methodology Disclaimer Card */}
      <div className="rounded-2xl border border-yt-red/30 bg-gradient-to-r from-yt-red/10 via-yt-card to-yt-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-yt-red shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Empirical Snapshot Methodology Note
            </h3>
            <p className="text-xs text-yt-secondary leading-relaxed">
              <strong className="text-white">Rising detection is based on observed historical growth and is NOT future prediction.</strong> Rapid observed growth is calculated directly from consecutive snapshot timestamps stored in PostgreSQL.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Explanation Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-yt-border bg-yt-card p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yt-elevated text-yt-secondary border border-yt-border">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-yt-secondary uppercase tracking-wider">View Count Floor</div>
            <div className="tnum text-xl font-bold text-white mt-0.5">
              &ge; {compact(RISING_MIN_VIEWS)}
            </div>
            <div className="text-[11px] text-yt-muted">Excludes small base percentage spikes</div>
          </div>
        </div>

        <div className="rounded-2xl border border-yt-border bg-yt-card p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yt-red/15 text-yt-red border border-yt-red/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-yt-secondary uppercase tracking-wider">Velocity Floor</div>
            <div className="tnum text-xl font-bold text-yt-red mt-0.5">
              &ge; +{compact(RISING_MIN_VELOCITY)}/hr
            </div>
            <div className="text-[11px] text-yt-muted">Derived from actual elapsed window</div>
          </div>
        </div>

        <div className="rounded-2xl border border-yt-border bg-yt-card p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400 border border-green-500/30">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-yt-secondary uppercase tracking-wider">Algorithm</div>
            <div className="text-sm font-bold text-white mt-0.5">Deterministic &amp; Rule-Based</div>
            <div className="text-[11px] text-yt-muted">Zero artificial speculation</div>
          </div>
        </div>
      </div>

      {/* Search and Export Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-yt-border bg-yt-card p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm">
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
        <div className="space-y-3.5">
          {videos.map((v, i) => (
            <Link
              key={v.video_id}
              href={`/video/${v.video_id}?region=${region}`}
              className="group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-yt-red/30 bg-yt-card p-4 transition-all duration-300 hover:border-yt-red hover:bg-yt-elevated hover:shadow-[0_8px_24px_rgba(255,0,0,0.12)]"
            >
              {/* Rank */}
              <div className="flex sm:flex-col items-center justify-between sm:justify-center w-8 shrink-0 text-center">
                <span className="tnum text-lg font-black text-yt-red">
                  #{i + 1}
                </span>
                <Flame className="h-4 w-4 text-yt-red fill-yt-red mt-0.5" />
              </div>

              {/* 16:9 Thumbnail */}
              <div className="relative shrink-0 overflow-hidden rounded-xl border border-yt-border w-full sm:w-40 aspect-video bg-yt-elevated">
                {v.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-yt-muted">
                    <Layers className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-white group-hover:text-yt-red transition-colors">
                  {v.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-yt-secondary">
                  <span className="font-semibold text-white/90">{v.channel_name}</span>
                  <span className="text-yt-muted">•</span>
                  <span>Published {timeAgo(v.published_at)}</span>
                  <span className="text-yt-muted">•</span>
                  <span>Window: {v.window_hours.toFixed(2)}h</span>
                </div>

                <div className="tnum mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-yt-secondary">
                  <span className="font-semibold text-white">{compact(v.view_count)} views now</span>
                  {v.growth_pct !== null && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-yt-red/15 px-2 py-0.5 text-yt-red font-bold border border-yt-red/30">
                      <ArrowUpRight className="h-3 w-3" />
                      +{v.growth_pct}%
                    </span>
                  )}
                  {v.engagement_rate !== null && (
                    <span className="text-green-400 font-semibold">
                      {v.engagement_rate}% engagement
                    </span>
                  )}
                </div>
              </div>

              {/* Velocity Highlight Badge */}
              <div className="flex sm:flex-col items-center justify-between sm:justify-center sm:items-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-yt-border">
                <div className="tnum text-xl sm:text-2xl font-black text-yt-red flex items-center gap-1">
                  <Rocket className="h-4 w-4" />
                  +{compact(v.view_delta)}
                </div>
                <div className="tnum text-xs font-bold text-yt-secondary">
                  +{compact(Math.round(v.views_per_hour))}/hr
                </div>
                <div className="mt-2 flex sm:justify-end">
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
