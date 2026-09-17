import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Clock,
  Layers,
  Flame,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import {
  getVideoDetail,
  getVideoHistory,
  RISING_MIN_VELOCITY,
} from "@/lib/queries";
import { isRegion } from "@/lib/youtube";
import { compact, duration, full, timeAgo } from "@/lib/format";
import { ScoreBadge, StatCard, TrendScoreBreakdown } from "@/components/ui";
import { VelocityChart, VideoHistoryChart } from "@/components/charts";
import { Panel } from "@/app/page";
import { VideoPlayerToggle } from "@/components/VideoPlayerToggle";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VideoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { region?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";

  const [video, history] = await Promise.all([
    getVideoDetail(params.id, region),
    getVideoHistory(params.id, region),
  ]);

  if (!video) notFound();

  // A video that drops off the chart stops generating new snapshots.
  const lastSeen = history.length
    ? new Date(history[history.length - 1].captured_at).getTime()
    : 0;
  const stale = Date.now() - lastSeen > 90 * 60 * 1000;

  const exportHistory = history.map((h, idx) => ({
    SnapshotIndex: idx + 1,
    CapturedAt: h.captured_at,
    ChartRank: h.chart_rank,
    ViewCount: h.view_count,
    ViewsGained: h.views_gained ?? 0,
    ViewsPerHour: h.views_per_hour ?? 0,
    LikeCount: h.like_count ?? 0,
    CommentCount: h.comment_count ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Navigation breadcrumb */}
      <div>
        <Link
          href={`/?region=${region}`}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-cool transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to {region} Dashboard</span>
        </Link>
      </div>

      {/* Main Video Dossier Header */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div>
          <VideoPlayerToggle
            videoId={video.video_id}
            title={video.title}
            thumbnailUrl={video.thumbnail_url}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold leading-snug tracking-tight text-text">
                {video.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-semibold text-text/90">
                  {video.channel_name}
                </span>
                {video.category_name && (
                  <>
                    <span>•</span>
                    <span className="rounded bg-raised px-2 py-0.5 text-muted font-medium">
                      {video.category_name}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>Published {timeAgo(video.published_at)}</span>
                <span>•</span>
                <span>Duration: {duration(video.duration_seconds)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider mb-1">
                Custom Trend Score
              </span>
              <ScoreBadge score={video.trend_score} size="lg" />
            </div>
          </div>

          {stale && (
            <div className="flex items-start gap-2.5 rounded-xl border border-edge bg-raised/70 p-3 text-xs text-muted">
              <AlertCircle className="h-4 w-4 text-heat shrink-0 mt-0.5" />
              <span>
                This video is no longer on the trending chart for <strong>{region}</strong>.
                Snapshot collection stopped at {timeAgo(video.captured_at)}. The figures below show the latest observed state.
              </span>
            </div>
          )}

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Current Views"
              value={compact(video.view_count)}
              sub={full(video.view_count)}
              icon={Eye}
            />
            <StatCard
              label="Likes"
              value={compact(video.like_count)}
              sub={video.like_count ? full(video.like_count) : "Hidden"}
              icon={Heart}
              variant="heat"
            />
            <StatCard
              label="Comments"
              value={compact(video.comment_count)}
              sub={video.comment_count ? full(video.comment_count) : "Disabled"}
              icon={MessageSquare}
            />
            <StatCard
              label="Engagement Rate"
              value={
                video.engagement_rate !== null
                  ? `${video.engagement_rate}%`
                  : "—"
              }
              sub="(Likes + Comments) ÷ Views"
              variant="good"
            />
          </div>

          {/* Temporal Growth Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Views Gained"
              value={`+${compact(video.view_delta)}`}
              sub={`Over ${video.window_hours.toFixed(2)} hours`}
              variant="heat"
            />
            <StatCard
              label="Current Velocity"
              value={`${compact(Math.round(video.views_per_hour))}/hr`}
              sub="Rate of view acquisition"
              variant="heat"
            />
            <StatCard
              label="Window Growth"
              value={video.growth_pct !== null ? `+${video.growth_pct}%` : "—"}
              sub="Percentage increase"
            />
            <StatCard
              label="Snapshots Stored"
              value={String(history.length)}
              sub="Append-only PostgreSQL rows"
              icon={Layers}
            />
          </div>
        </div>
      </div>

      {/* Custom Trend Score Percentile Breakdown Inspector */}
      <TrendScoreBreakdown video={video} />

      {/* Interactive Charts: View Curve & Velocity Threshold */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Observed View Progression Curve"
          note="Every immutable timestamped snapshot captured for this video"
        >
          {history.length > 1 ? (
            <VideoHistoryChart data={history} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center text-xs text-muted p-6 border border-dashed border-edge rounded-xl">
              Only one snapshot recorded so far. The curve renders automatically after the second collection run.
            </div>
          )}
        </Panel>

        <Panel
          title="Views Gained Per Hour (Velocity Analysis)"
          note="Bars above the dashed line qualify as rising (>5,000 views/hr)"
        >
          {history.filter((h) => h.views_per_hour !== null).length > 0 ? (
            <VelocityChart data={history} threshold={RISING_MIN_VELOCITY} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center text-xs text-muted p-6 border border-dashed border-edge rounded-xl">
              Velocity requires two consecutive snapshots to compute elapsed time.
            </div>
          )}
        </Panel>
      </div>

      {/* Raw Snapshot History Table */}
      {history.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-edge bg-panel p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-cool" />
                <h3 className="font-display text-sm font-bold text-text">
                  Immutable Snapshot Audit Log
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Each row represents an unmutated snapshot reading in PostgreSQL ({history.length} snapshots total)
              </p>
            </div>
            <ExportButton
              filename={`video_${video.video_id}_snapshots_${new Date().toISOString().slice(0, 10)}`}
              data={exportHistory}
              label="Export History CSV"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="border-b border-edge bg-raised/50 text-left text-muted font-medium">
                  <th className="px-4 py-3 font-semibold text-text">Captured Timestamp</th>
                  <th className="px-4 py-3 text-center font-semibold">Chart Rank</th>
                  <th className="px-4 py-3 text-right font-semibold">Observed Views</th>
                  <th className="px-4 py-3 text-right font-semibold">Gained Since Prev</th>
                  <th className="px-4 py-3 text-right font-semibold">Views/Hr Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Likes</th>
                  <th className="px-4 py-3 text-right font-semibold">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {[...history].reverse().map((h, i) => (
                  <tr key={h.captured_at} className="hover:bg-raised/60 transition-colors">
                    <td className="px-4 py-3 text-muted font-mono">
                      {new Date(h.captured_at).toLocaleString()}
                    </td>
                    <td className="tnum px-4 py-3 text-center font-bold text-text">
                      {h.chart_rank ? `#${h.chart_rank}` : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right font-medium text-text">
                      {full(h.view_count)}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-heat font-semibold">
                      {h.views_gained !== null ? `+${full(h.views_gained)}` : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-muted font-mono">
                      {h.views_per_hour !== null
                        ? `+${compact(h.views_per_hour)}/hr`
                        : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-muted">
                      {compact(h.like_count)}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-muted">
                      {compact(h.comment_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
