import Link from "next/link";
import {
  Eye,
  Heart,
  MessageSquare,
  Flame,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { compact, formatRankDelta, timeAgo } from "@/lib/format";
import type { ScoredVideo } from "@/lib/queries";
import { WEIGHTS } from "@/lib/constants";
export { RegionPicker } from "./RegionPicker";

/* ------------------------------------------------------------------ */
/* KPI Stat card with icon and subtle gradient glows                 */
/* ------------------------------------------------------------------ */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = "cool",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
  variant?: "cool" | "heat" | "good" | "default";
}) {
  const glowMap = {
    cool: "hover:border-cool/40 from-cool/5 to-transparent",
    heat: "hover:border-heat/40 from-heat/5 to-transparent",
    good: "hover:border-good/40 from-good/5 to-transparent",
    default: "hover:border-edge from-raised/30 to-transparent",
  };

  const iconBg = {
    cool: "text-cool bg-cool/10 border-cool/20",
    heat: "text-heat bg-heat/10 border-heat/20",
    good: "text-good bg-good/10 border-good/20",
    default: "text-muted bg-raised border-edge",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-edge bg-panel p-4 transition-all duration-300 hover:shadow-lg bg-gradient-to-b ${glowMap[variant]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted tracking-wide">{label}</span>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm ${iconBg[variant]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="tnum mt-2 font-display text-2xl font-bold tracking-tight text-text">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted truncate">{sub}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trend Score Badge — Custom Trend Score (0-100)                     */
/* ------------------------------------------------------------------ */
export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    score >= 80
      ? "border-heat/50 bg-heat/15 text-heat shadow-[0_0_12px_rgba(255,122,69,0.2)]"
      : score >= 55
        ? "border-cool/50 bg-cool/15 text-cool shadow-[0_0_12px_rgba(86,168,255,0.2)]"
        : "border-edge bg-raised/80 text-muted";

  const sizeClasses = {
    sm: "h-6 px-1.5 text-xs",
    md: "h-7 min-w-[2.75rem] px-2 text-xs font-bold",
    lg: "h-9 min-w-[3.5rem] px-3 text-base font-bold",
  };

  return (
    <span
      title={`Custom Trend Score: ${score}/100 (Velocity 50%, Engagement 20%, Recency 15%, Popularity 15%)`}
      className={`tnum inline-flex items-center justify-center rounded-lg border font-display tracking-tight transition-all ${sizeClasses[size]} ${tone}`}
    >
      {score}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Trend Score Breakdown Inspector (percentile gauges)                */
/* ------------------------------------------------------------------ */
export function TrendScoreBreakdown({ video }: { video: ScoredVideo }) {
  const factors = [
    {
      label: "View Velocity",
      weight: `${Math.round(WEIGHTS.velocity * 100)}%`,
      percentile: Math.round((video.r_velocity ?? 0) * 100),
      raw: `+${compact(Math.round(video.views_per_hour))}/hr`,
      barColor: "bg-heat",
    },
    {
      label: "Engagement",
      weight: `${Math.round(WEIGHTS.engagement * 100)}%`,
      percentile: Math.round((video.r_engagement ?? 0) * 100),
      raw: video.engagement_rate !== null ? `${video.engagement_rate}%` : "—",
      barColor: "bg-good",
    },
    {
      label: "Recency",
      weight: `${Math.round(WEIGHTS.recency * 100)}%`,
      percentile: Math.round((video.r_recency ?? 0) * 100),
      raw: timeAgo(video.published_at),
      barColor: "bg-cool",
    },
    {
      label: "Popularity",
      weight: `${Math.round(WEIGHTS.popularity * 100)}%`,
      percentile: Math.round((video.r_popularity ?? 0) * 100),
      raw: `${compact(video.view_count)} views`,
      barColor: "bg-purple-400",
    },
  ];

  return (
    <div className="rounded-xl border border-edge bg-panel p-5">
      <div className="flex items-center justify-between border-b border-edge/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-heat" />
            <h3 className="font-display text-sm font-semibold text-text">
              Custom Trend Score Breakdown
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Formula: 0.50×Velocity + 0.20×Engagement + 0.15×Recency + 0.15×Reach
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Aggregate Score:</span>
          <ScoreBadge score={video.trend_score} size="lg" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {factors.map((f) => (
          <div
            key={f.label}
            className="rounded-lg border border-edge/80 bg-raised/40 p-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-text">{f.label}</span>
              <span className="rounded bg-raised px-1.5 py-0.5 text-[10px] text-muted font-mono">
                {f.weight}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-muted">{f.raw}</span>
              <span className="tnum font-display text-sm font-bold text-text">
                P{f.percentile}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised">
              <div
                className={`h-full rounded-full transition-all duration-500 ${f.barColor}`}
                style={{ width: `${Math.max(4, f.percentile)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Video Row Component                                                */
/* ------------------------------------------------------------------ */
export function VideoRow({
  video,
  rank,
  region,
}: {
  video: ScoredVideo;
  rank: number;
  region: string;
}) {
  const gaining = video.views_per_hour > 0;
  const rankDelta = formatRankDelta(video.chart_rank ?? rank, video.prev_chart_rank);

  return (
    <Link
      href={`/video/${video.video_id}?region=${region}`}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-3.5 rounded-xl border border-edge bg-panel p-3.5 transition-all duration-200 hover:border-cool/40 hover:bg-raised hover:shadow-md"
    >
      {/* Rank and delta indicator */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center w-8 shrink-0 text-center">
        <span className="tnum font-display text-sm font-bold text-muted group-hover:text-text">
          #{rank}
        </span>
        <span
          className={`tnum text-[10px] font-semibold ${
            rankDelta.type === "up"
              ? "text-good"
              : rankDelta.type === "down"
                ? "text-heat"
                : rankDelta.type === "new"
                  ? "text-cool"
                  : "text-muted"
          }`}
          title={rankDelta.type === "new" ? "New on chart" : `Rank change: ${rankDelta.text}`}
        >
          {rankDelta.text}
        </span>
      </div>

      {/* Thumbnail with duration badge */}
      <div className="relative shrink-0 overflow-hidden rounded-lg border border-edge/80 sm:w-32 aspect-video bg-raised">
        {video.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Layers className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text group-hover:text-cool transition-colors">
          {video.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          <span className="font-medium text-text/80 truncate max-w-[200px]">
            {video.channel_name ?? "Unknown channel"}
          </span>
          {video.category_name && (
            <>
              <span>•</span>
              <span className="rounded bg-raised px-1.5 py-0.5 text-[10px] text-muted">
                {video.category_name}
              </span>
            </>
          )}
          <span>•</span>
          <span>{timeAgo(video.published_at)}</span>
        </div>

        <div className="tnum mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1 text-text font-medium">
            <Eye className="h-3 w-3 text-cool" />
            {compact(video.view_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-heat" />
            {compact(video.like_count)}
          </span>
          {video.comment_count !== null && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted" />
              {compact(video.comment_count)}
            </span>
          )}
          {video.engagement_rate !== null && (
            <span className="rounded bg-raised/80 px-1.5 py-0.5 text-[11px] text-good font-medium">
              {video.engagement_rate}% eng.
            </span>
          )}
          {gaining && (
            <span className="flex items-center gap-1 font-semibold text-heat">
              <Flame className="h-3 w-3" />
              +{compact(Math.round(video.views_per_hour))}/hr
            </span>
          )}
        </div>
      </div>

      {/* Custom Trend Score badge */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-edge/60">
        <span className="sm:hidden text-xs text-muted font-medium">Custom Trend Score</span>
        <ScoreBadge score={video.trend_score} size="md" />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Empty State Component                                              */
/* ------------------------------------------------------------------ */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-edge bg-panel/40 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-edge bg-raised text-muted">
        <Activity className="h-6 w-6 text-cool" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
