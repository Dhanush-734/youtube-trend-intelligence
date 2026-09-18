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
  Sparkles,
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
    <div className="space-y-8">
      {/* Navigation breadcrumb */}
      <div>
        <Link
          href={`/?region=${region}`}
          className="group inline-flex items-center gap-2 text-xs font-bold text-yt-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-yt-red" />
          <span>Back to {region} Intelligence Dashboard</span>
        </Link>
      </div>

      {/* Main Video Dossier Header */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
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
              <h1 className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight text-white">
                {video.title}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-yt-secondary">
                <span className="font-bold text-white/90">
                  {video.channel_name}
                </span>
                {video.category_name && (
                  <>
                    <span className="text-yt-muted">•</span>
                    <span className="rounded-md bg-yt-elevated px-2 py-0.5 text-yt-secondary font-semibold border border-yt-border/60">
                      {video.category_name}
                    </span>
                  </>
                )}
                <span className="text-yt-muted">•</span>
                <span>Published {timeAgo(video.published_at)}</span>
                <span className="text-yt-muted">•</span>
                <span>Duration: {duration(video.duration_seconds)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-yt-muted tracking-wider mb-1">
                Custom Trend Score
              </span>
              <ScoreBadge score={video.trend_score} size="lg" />
            </div>
          </div>

          {stale && (
            <div className="flex items-start gap-3 rounded-2xl border border-yt-border bg-yt-elevated/70 p-4 text-xs text-yt-secondary">
              <AlertCircle className="h-4 w-4 text-yt-red shrink-0 mt-0.5" />
              <span>
                This video is no longer on the trending chart for <strong className="text-white">{region}</strong>.
                Snapshot collection completed at {timeAgo(video.captured_at)}. Figures below reflect latest observed state.
              </span>
            </div>
          )}

          {/* KPI Cards: Views, Likes, Comments, Engagement Rate, Trend Score, Views Per Hour */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Views"
              value={compact(video.view_count)}
              sub={full(video.view_count)}
              iconName="eye"
            />
            <StatCard
              label="Likes"
              value={compact(video.like_count)}
              sub={video.like_count ? full(video.like_count) : "Hidden"}
              iconName="heart"
              variant="red"
            />
            <StatCard
              label="Comments"
              value={compact(video.comment_count)}
              sub={video.comment_count ? full(video.comment_count) : "Disabled"}
              iconName="comments"
            />
            <StatCard
              label="Engagement Rate"
              value={
                video.engagement_rate !== null
                  ? `${video.engagement_rate}%`
                  : "—"
              }
              sub="(Likes + Comments) ÷ Views"
            />
            <StatCard
              label="Trend Score"
              value={`${video.trend_score}/100`}
              sub="Multi-factor percentile"
              iconName="sparkles"
              variant="red"
            />
            <StatCard
              label="Views Per Hour"
              value={`+${compact(Math.round(video.views_per_hour))}/hr`}
              sub={`+${compact(video.view_delta)} gained`}
              iconName="flame"
              variant="red"
            />
          </div>
        </div>
      </div>

      {/* Custom Trend Score Percentile Breakdown Inspector */}
      <TrendScoreBreakdown video={video} />

      {/* Interactive Charts: View Curve & Velocity Threshold */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="📈 Observed View Progression Curve"
          note="Every immutable timestamped snapshot captured for this video"
        >
          {history.length > 1 ? (
            <VideoHistoryChart data={history} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center text-xs text-yt-secondary p-6 border border-dashed border-yt-border rounded-2xl">
              Only one snapshot recorded so far. The curve renders automatically after consecutive collection runs.
            </div>
          )}
        </Panel>

        <Panel
          title="⚡ Views Gained Per Hour (Velocity Analysis)"
          note="Bars above the dashed line qualify as rising (>5,000 views/hr)"
        >
          {history.filter((h) => h.views_per_hour !== null).length > 0 ? (
            <VelocityChart data={history} threshold={RISING_MIN_VELOCITY} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center text-xs text-yt-secondary p-6 border border-dashed border-yt-border rounded-2xl">
              Velocity computation requires two consecutive snapshots to evaluate elapsed time.
            </div>
          )}
        </Panel>
      </div>

      {/* Raw Snapshot History Table */}
      {history.length > 0 && (
        <div className="space-y-4 rounded-3xl border border-yt-border bg-yt-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yt-border/70 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-yt-red" />
                <h3 className="text-base font-bold text-white">
                  Immutable Snapshot Audit Log
                </h3>
              </div>
              <p className="mt-1 text-xs text-yt-secondary">
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
                <tr className="border-b border-yt-border bg-yt-elevated/60 text-left text-yt-secondary font-semibold">
                  <th className="px-4 py-3.5 font-bold text-white">Captured Timestamp</th>
                  <th className="px-4 py-3.5 text-center font-bold">Chart Rank</th>
                  <th className="px-4 py-3.5 text-right font-bold">Observed Views</th>
                  <th className="px-4 py-3.5 text-right font-bold">Gained Since Prev</th>
                  <th className="px-4 py-3.5 text-right font-bold">Views/Hr Rate</th>
                  <th className="px-4 py-3.5 text-right font-bold">Likes</th>
                  <th className="px-4 py-3.5 text-right font-bold">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yt-border/60">
                {[...history].reverse().map((h) => (
                  <tr key={h.captured_at} className="hover:bg-yt-elevated/70 transition-colors">
                    <td className="px-4 py-3 text-yt-secondary font-mono">
                      {new Date(h.captured_at).toLocaleString()}
                    </td>
                    <td className="tnum px-4 py-3 text-center font-black text-white">
                      {h.chart_rank ? `#${h.chart_rank}` : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right font-bold text-white">
                      {full(h.view_count)}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-yt-red font-bold">
                      {h.views_gained !== null ? `+${full(h.views_gained)}` : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-yt-secondary font-mono">
                      {h.views_per_hour !== null
                        ? `+${compact(h.views_per_hour)}/hr`
                        : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-yt-secondary">
                      {compact(h.like_count)}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-yt-secondary">
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
