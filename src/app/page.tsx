import Link from "next/link";
import {
  Eye,
  Heart,
  MessageSquare,
  Layers,
  Flame,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getCategoryStats,
  getChannelStats,
  getRegionTimeline,
  getRising,
  getSummary,
  getTrending,
  hasData,
} from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact, timeAgo } from "@/lib/format";
import { EmptyState, RegionPicker, StatCard, VideoRow } from "@/components/ui";
import { CategoryChart, ChannelChart, TimelineChart } from "@/components/charts";
import { ManualSyncModal } from "@/components/ManualSyncModal";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { region?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const currentRegionMeta = REGIONS.find((r) => r.code === region);
  const regionName = currentRegionMeta?.name ?? region;

  if (!(await hasData(region))) {
    return (
      <div className="space-y-6">
        <HeroHeader
          region={region}
          regionName={regionName}
          lastRun={null}
        />
        <EmptyState
          title={`No snapshot data found for ${regionName}`}
          body="Run the data collection pipeline to capture YouTube's trending chart, or click below to trigger a live snapshot."
          action={<ManualSyncModal region={region} />}
        />
      </div>
    );
  }

  const [summary, trending, rising, categories, channels, timeline] =
    await Promise.all([
      getSummary(region),
      getTrending(region, null, 8),
      getRising(region, 4),
      getCategoryStats(region),
      getChannelStats(region, 8),
      getRegionTimeline(region, 48),
    ]);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <HeroHeader
        region={region}
        regionName={regionName}
        lastRun={summary.last_captured_at}
      />

      {/* KPI Cards: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Videos"
            value={String(summary.videos)}
            sub="Active on trending chart"
            iconName="layers"
            variant="default"
          />
          <StatCard
            label="Total Views"
            value={compact(summary.total_views)}
            sub="Aggregated audience reach"
            iconName="eye"
            variant="default"
          />
          <StatCard
            label="Total Likes"
            value={compact(summary.total_likes)}
            sub="Audience approvals"
            iconName="heart"
            variant="red"
          />
          <StatCard
            label="Total Comments"
            value={compact(summary.total_comments)}
            sub="Viewer conversations"
            iconName="comments"
            variant="default"
          />
        </div>
      </section>

      {/* Gaining Fastest (Rising Breakouts) */}
      {rising.length > 0 && (
        <section className="rounded-3xl border border-yt-red/30 bg-gradient-to-b from-yt-red/10 via-yt-card to-yt-card p-5 sm:p-6 shadow-xl">
          <SectionHeading
            title="🚀 Rising Fast"
            subtitle="Observed view velocity clearing the 5,000 views/hr floor"
            icon={Flame}
            iconColor="text-yt-red"
            href={`/rising?region=${region}`}
            linkLabel="View all rising videos"
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rising.map((v) => (
              <Link
                key={v.video_id}
                href={`/video/${v.video_id}?region=${region}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-yt-border bg-yt-card/90 p-4 transition-all duration-300 hover:border-yt-red/60 hover:bg-yt-elevated hover:shadow-[0_4px_20px_rgba(255,0,0,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-yt-red/15 px-2 py-0.5 text-xs font-bold text-yt-red border border-yt-red/20">
                    <Flame className="h-3 w-3 fill-yt-red" />
                    +{compact(Math.round(v.views_per_hour))}/hr
                  </span>
                  <span className="tnum text-xs font-medium text-yt-secondary">
                    {compact(v.view_count)} views
                  </span>
                </div>

                <div className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-yt-red transition-colors">
                  {v.title}
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-yt-secondary border-t border-yt-border/50">
                  <span className="truncate max-w-[130px] font-semibold text-white/90">
                    {v.channel_name}
                  </span>
                  <span className="text-[11px] text-yt-muted">{timeAgo(v.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Chart Ranked by Custom Trend Score */}
      <section className="space-y-4">
        <SectionHeading
          title="Top Trending Ranked by Custom Trend Score"
          subtitle="Multi-factor score derived from velocity (50%), engagement (20%), recency (15%), reach (15%)"
          icon={Sparkles}
          iconColor="text-yt-red"
          href={`/trending?region=${region}`}
          linkLabel="Explore full chart & filters"
        />

        <div className="space-y-3">
          {trending.map((v, i) => (
            <VideoRow key={v.video_id} video={v} rank={i + 1} region={region} />
          ))}
        </div>
      </section>

      {/* Visual Analytics Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Observed Total Views Timeline"
          note="Cumulative views measured across each 15-minute collection run"
        >
          {timeline.length > 1 ? (
            <TimelineChart data={timeline} />
          ) : (
            <NeedsMoreSnapshots />
          )}
        </Panel>

        <Panel
          title="Category Distribution"
          note="Volume of trending videos categorized by topic"
        >
          <CategoryChart data={categories} />
        </Panel>
      </div>

      {/* Channel Reach Leaderboard */}
      <Panel
        title="Top Channel Impact"
        note="Total aggregated views across all charting videos per channel"
      >
        <ChannelChart data={channels} />
      </Panel>
    </div>
  );
}

function HeroHeader({
  region,
  regionName,
  lastRun,
}: {
  region: string;
  regionName: string;
  lastRun: string | null;
}) {
  return (
    <div className="rounded-3xl border border-yt-border bg-gradient-to-br from-yt-card via-yt-card to-yt-elevated/50 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-yt-red/30 bg-yt-red/10 px-3 py-1 text-xs font-semibold text-yt-red">
            <span className="h-2 w-2 rounded-full bg-yt-red animate-pulse" />
            <span>Near-Real-Time YouTube Video Analytics</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Understand What&apos;s Trending on YouTube
          </h1>

          <p className="text-sm sm:text-base text-yt-secondary max-w-2xl leading-relaxed">
            Near-real-time video intelligence powered by YouTube data.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-yt-secondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              Active Region: <strong className="text-yt-red">{regionName} ({region})</strong>
            </span>
            <span className="text-yt-muted">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-yt-muted" />
              {lastRun
                ? `Last snapshot: ${timeAgo(lastRun)}`
                : "Awaiting snapshot collection"}
            </span>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
          <span className="text-xs font-semibold text-yt-secondary">Quick Region Select:</span>
          <RegionPicker current={region} />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-yt-red",
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
        {subtitle && <p className="mt-1 text-xs text-yt-secondary">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-xs font-bold text-yt-red hover:text-yt-red-dark transition-colors"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-yt-border bg-yt-card p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {note ? <p className="mt-1 text-xs text-yt-secondary">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

function NeedsMoreSnapshots() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-yt-border bg-yt-elevated/30 p-6 text-center text-xs text-yt-secondary">
      <Clock className="h-6 w-6 text-yt-red mb-2" />
      <span className="font-semibold text-white">One snapshot recorded so far</span>
      <span className="mt-1 max-w-xs">
        The temporal view curve appears once consecutive snapshots have accumulated.
      </span>
    </div>
  );
}
