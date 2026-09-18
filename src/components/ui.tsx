"use client";

import Link from "next/link";
import {
  Eye,
  Heart,
  MessageSquare,
  Flame,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";
import { compact, formatRankDelta, timeAgo } from "@/lib/format";
import type { ScoredVideo } from "@/lib/queries";
import { WEIGHTS } from "@/lib/constants";
export { RegionPicker } from "./RegionPicker";

/* ------------------------------------------------------------------ */
/* KPI Stat card with YouTube dark aesthetic & glow                  */
/* ------------------------------------------------------------------ */
export function StatCard({
  label,
  value,
  sub,
  iconName,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  iconName?:
    | "layers"
    | "eye"
    | "heart"
    | "comments"
    | "users"
    | "flame"
    | "sparkles"
    | "activity"
    | "trending";
  icon?: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "red" | "good" | "default";
}) {
  const ResolvedIcon =
    iconName === "layers"
      ? Layers
      : iconName === "eye"
      ? Eye
      : iconName === "heart"
      ? Heart
      : iconName === "comments"
      ? MessageSquare
      : iconName === "users"
      ? Users
      : iconName === "flame"
      ? Flame
      : iconName === "sparkles"
      ? Sparkles
      : iconName === "trending"
      ? TrendingUp
      : iconName === "activity"
      ? Activity
      : Icon;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-yt-border bg-yt-card p-5 transition-all duration-300 hover:border-yt-secondary/40 hover:bg-yt-elevated/60 hover:shadow-xl">
      {/* Glow accent */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-yt-red/5 blur-2xl group-hover:bg-yt-red/10 transition-colors" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-yt-secondary">
          {label}
        </span>
        {ResolvedIcon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-yt-border bg-yt-elevated text-yt-secondary group-hover:border-yt-red/40 group-hover:text-yt-red transition-all">
            <ResolvedIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="tnum mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {value}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        {sub && <span className="text-yt-secondary truncate">{sub}</span>}
        {trendLabel && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              trend === "up"
                ? "text-green-400"
                : trend === "down"
                ? "text-yt-red"
                : "text-yt-secondary"
            }`}
          >
            {trend === "up" && <ChevronUp className="h-3 w-3" />}
            {trend === "down" && <ChevronDown className="h-3 w-3" />}
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Custom Trend Score Badge (0-100)                                   */
/* ------------------------------------------------------------------ */
export function ScoreBadge({
  score,
  size = "md",
  showLabel = false,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const tone =
    score >= 80
      ? "border-yt-red/60 bg-yt-red/15 text-yt-red shadow-[0_0_12px_rgba(255,0,0,0.3)]"
      : score >= 55
      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
      : "border-yt-border bg-yt-elevated text-yt-secondary";

  const sizeClasses = {
    sm: "h-6 px-2 text-xs font-bold",
    md: "h-7.5 min-w-[2.75rem] px-2.5 text-xs font-bold",
    lg: "h-9 min-w-[3.5rem] px-3.5 text-base font-bold",
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {showLabel && (
        <span className="text-[11px] text-yt-muted font-medium">Trend Score:</span>
      )}
      <span
        title={`Custom Trend Score: ${score}/100 (Velocity 50%, Engagement 20%, Recency 15%, Reach 15%)`}
        className={`tnum inline-flex items-center justify-center rounded-xl border tracking-tight font-display transition-all ${sizeClasses[size]} ${tone}`}
      >
        {score}
      </span>
    </div>
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
      barColor: "bg-yt-red",
      desc: "Speed of view accumulation",
    },
    {
      label: "Engagement",
      weight: `${Math.round(WEIGHTS.engagement * 100)}%`,
      percentile: Math.round((video.r_engagement ?? 0) * 100),
      raw: video.engagement_rate !== null ? `${video.engagement_rate}%` : "—",
      barColor: "bg-green-500",
      desc: "(Likes + Comments) ÷ Views",
    },
    {
      label: "Recency",
      weight: `${Math.round(WEIGHTS.recency * 100)}%`,
      percentile: Math.round((video.r_recency ?? 0) * 100),
      raw: timeAgo(video.published_at),
      barColor: "bg-blue-400",
      desc: "Hours elapsed since publish",
    },
    {
      label: "Popularity / Reach",
      weight: `${Math.round(WEIGHTS.popularity * 100)}%`,
      percentile: Math.round((video.r_popularity ?? 0) * 100),
      raw: `${compact(video.view_count)} views`,
      barColor: "bg-purple-400",
      desc: "Cumulative total views",
    },
  ];

  return (
    <div className="rounded-2xl border border-yt-border bg-yt-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yt-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yt-red" />
            <h3 className="text-base font-bold text-white">
              Custom Trend Score Mathematical Breakdown
            </h3>
          </div>
          <p className="mt-1 text-xs text-yt-secondary">
            Percentile formulation: 0.50×Velocity + 0.20×Engagement + 0.15×Recency + 0.15×Popularity
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-yt-secondary">Overall Score:</span>
          <ScoreBadge score={video.trend_score} size="lg" />
        </div>
      </div>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {factors.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-yt-border/80 bg-yt-elevated/40 p-4 transition-all hover:bg-yt-elevated/70"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{f.label}</span>
              <span className="rounded-md bg-yt-card px-2 py-0.5 text-[10px] text-yt-secondary font-mono border border-yt-border/60">
                {f.weight}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-xs font-medium text-yt-secondary truncate max-w-[130px]">
                {f.raw}
              </span>
              <span className="tnum text-sm font-bold text-white">
                P{f.percentile}
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-yt-bg border border-yt-border/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${f.barColor}`}
                style={{ width: `${Math.max(4, f.percentile)}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-yt-muted truncate">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Premium Video Card for 3-4 Column Grids                            */
/* ------------------------------------------------------------------ */
export function VideoCard({
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-yt-border bg-yt-card transition-all duration-300 hover:border-yt-red/50 hover:bg-yt-elevated hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-yt-elevated">
        {video.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-yt-muted">
            <Layers className="h-6 w-6" />
          </div>
        )}

        {/* Top-left Rank Badge */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-black/85 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
          <span className="text-yt-red font-black">#{rank}</span>
          {rankDelta.type !== "same" && (
            <span
              className={`text-[10px] font-medium ${
                rankDelta.type === "up"
                  ? "text-green-400"
                  : rankDelta.type === "down"
                  ? "text-yt-red"
                  : "text-blue-400"
              }`}
            >
              {rankDelta.text}
            </span>
          )}
        </div>

        {/* Top-right Trend Score Pill */}
        <div className="absolute right-2.5 top-2.5">
          <ScoreBadge score={video.trend_score} size="sm" />
        </div>

        {/* Bottom Velocity Ribbon if climbing */}
        {gaining && (
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-yt-red backdrop-blur-sm border border-yt-red/30">
            <Flame className="h-3 w-3 fill-yt-red" />
            <span>+{compact(Math.round(video.views_per_hour))}/hr</span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-yt-red transition-colors">
          {video.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-yt-secondary">
          <span className="truncate font-semibold text-white/90 max-w-[160px]">
            {video.channel_name ?? "Unknown creator"}
          </span>
          <span className="text-[11px] text-yt-muted shrink-0">
            {timeAgo(video.published_at)}
          </span>
        </div>

        {/* Category tag */}
        {video.category_name && (
          <div className="mt-2">
            <span className="inline-block rounded-md border border-yt-border/80 bg-yt-elevated/70 px-2 py-0.5 text-[10px] text-yt-secondary font-medium">
              {video.category_name}
            </span>
          </div>
        )}

        {/* Metrics Footer */}
        <div className="tnum mt-auto pt-3 border-t border-yt-border/50 flex items-center justify-between text-xs text-yt-secondary">
          <span className="flex items-center gap-1 font-semibold text-white">
            <Eye className="h-3.5 w-3.5 text-yt-secondary" />
            {compact(video.view_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-yt-red" />
            {compact(video.like_count)}
          </span>
          {video.comment_count !== null && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-yt-muted" />
              {compact(video.comment_count)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Video Row Component for List View & Dashboard                      */
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
      className="group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-yt-border bg-yt-card p-3.5 transition-all duration-200 hover:border-yt-secondary/40 hover:bg-yt-elevated hover:shadow-lg"
    >
      {/* Rank and delta indicator */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center w-8 shrink-0 text-center">
        <span className="tnum text-base font-bold text-yt-secondary group-hover:text-white">
          #{rank}
        </span>
        <span
          className={`tnum text-[10px] font-bold ${
            rankDelta.type === "up"
              ? "text-green-400"
              : rankDelta.type === "down"
              ? "text-yt-red"
              : rankDelta.type === "new"
              ? "text-blue-400"
              : "text-yt-muted"
          }`}
          title={rankDelta.type === "new" ? "New charting video" : `Rank delta: ${rankDelta.text}`}
        >
          {rankDelta.text}
        </span>
      </div>

      {/* 16:9 Thumbnail with rounded corners */}
      <div className="relative shrink-0 overflow-hidden rounded-xl border border-yt-border/80 w-full sm:w-36 aspect-video bg-yt-elevated">
        {video.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-yt-muted">
            <Layers className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-yt-red transition-colors">
          {video.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-yt-secondary">
          <span className="font-semibold text-white/90 truncate max-w-[200px]">
            {video.channel_name ?? "Unknown creator"}
          </span>
          {video.category_name && (
            <>
              <span className="text-yt-muted">•</span>
              <span className="rounded-md bg-yt-elevated px-2 py-0.5 text-[10px] text-yt-secondary font-medium border border-yt-border/60">
                {video.category_name}
              </span>
            </>
          )}
          <span className="text-yt-muted">•</span>
          <span>{timeAgo(video.published_at)}</span>
        </div>

        <div className="tnum mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-yt-secondary">
          <span className="flex items-center gap-1 text-white font-semibold">
            <Eye className="h-3.5 w-3.5 text-yt-secondary" />
            {compact(video.view_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-yt-red" />
            {compact(video.like_count)}
          </span>
          {video.comment_count !== null && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-yt-muted" />
              {compact(video.comment_count)}
            </span>
          )}
          {video.engagement_rate !== null && (
            <span className="rounded bg-yt-elevated px-2 py-0.5 text-[11px] text-green-400 font-semibold border border-green-500/20">
              {video.engagement_rate}% eng.
            </span>
          )}
          {gaining && (
            <span className="flex items-center gap-1 font-bold text-yt-red">
              <Flame className="h-3.5 w-3.5 fill-yt-red" />
              +{compact(Math.round(video.views_per_hour))}/hr
            </span>
          )}
        </div>
      </div>

      {/* Custom Trend Score badge */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-yt-border/60">
        <span className="sm:hidden text-xs text-yt-secondary font-medium">Custom Trend Score</span>
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-yt-border bg-yt-card/40 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yt-border bg-yt-elevated text-yt-secondary">
        <Activity className="h-7 w-7 text-yt-red" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-yt-secondary">
        {body}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading Skeleton Screen                                            */
/* ------------------------------------------------------------------ */
export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-xl bg-yt-elevated" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-yt-border bg-yt-card p-5 space-y-3">
            <div className="h-3 w-20 rounded bg-yt-elevated" />
            <div className="h-8 w-32 rounded bg-yt-elevated" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl border border-yt-border bg-yt-card p-4 space-y-3">
            <div className="aspect-video w-full rounded-xl bg-yt-elevated" />
            <div className="h-4 w-3/4 rounded bg-yt-elevated" />
            <div className="h-3 w-1/2 rounded bg-yt-elevated/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
