import Link from "next/link";
import {
  Eye,
  Heart,
  Layers,
  Users,
  Flame,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
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
      <>
        <PageHeader region={region} regionName={regionName} lastRun={null} />
        <div className="mt-8">
          <EmptyState
            title={`No snapshot data found for ${regionName}`}
            body="Run the data collection pipeline to capture YouTube's trending chart, or click below to trigger a live snapshot."
            action={<ManualSyncModal region={region} />}
          />
        </div>
      </>
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
      <PageHeader
        region={region}
        regionName={regionName}
        lastRun={summary.last_captured_at}
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          label="Videos Tracked"
          value={String(summary.videos)}
          sub="On current chart snapshot"
          icon={Layers}
          variant="cool"
        />
        <StatCard
          label="Combined Views"
          value={compact(summary.total_views)}
          sub="Across all tracked videos"
          icon={Eye}
          variant="cool"
        />
        <StatCard
          label="Observed Likes"
          value={compact(summary.total_likes)}
          sub="Total interaction count"
          icon={Heart}
          variant="heat"
        />
        <StatCard
          label="Distinct Channels"
          value={String(summary.channels)}
          sub="Currently charted creators"
          icon={Users}
          variant="good"
        />
      </div>

      {/* Gaining Fastest (Rising Breakouts) */}
      {rising.length > 0 && (
        <section className="rounded-2xl border border-heat/20 bg-gradient-to-b from-heat/5 via-panel to-panel p-5">
          <SectionHeading
            title="Fastest Growing Right Now (Rising)"
            subtitle="Observed view velocity clearing the 5,000 views/hr floor"
            icon={Flame}
            iconColor="text-heat"
            href={`/rising?region=${region}`}
            linkLabel="View all rising videos"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rising.map((v) => (
              <Link
                key={v.video_id}
                href={`/video/${v.video_id}?region=${region}`}
                className="group relative overflow-hidden rounded-xl border border-heat/30 bg-panel/80 p-4 transition-all duration-300 hover:border-heat/70 hover:bg-raised hover:shadow-[0_0_15px_rgba(255,122,69,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-heat/15 px-2 py-0.5 text-[10px] font-bold text-heat">
                    +{compact(Math.round(v.views_per_hour))}/hr
                  </span>
                  <span className="tnum font-display text-xs text-muted">
                    {compact(v.view_count)} views
                  </span>
                </div>

                <div className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-text group-hover:text-heat transition-colors">
                  {v.title}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span className="truncate max-w-[140px] font-medium">
                    {v.channel_name}
                  </span>
                  <span className="text-[11px]">{timeAgo(v.published_at)}</span>
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
          iconColor="text-cool"
          href={`/trending?region=${region}`}
          linkLabel="Explore full chart & filters"
        />

        <div className="space-y-2.5">
          {trending.map((v, i) => (
            <VideoRow key={v.video_id} video={v} rank={i + 1} region={region} />
          ))}
        </div>
      </section>

      {/* Visual Analytics Panels */}
      <div className="grid gap-4 lg:grid-cols-2">
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

function PageHeader({
  region,
  regionName,
  lastRun,
}: {
  region: string;
  regionName: string;
  lastRun: string | null;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge/60 pb-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {regionName} Video Intelligence
          </h1>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1.5 font-medium text-text/80">
            <span className="h-2 w-2 rounded-full bg-good animate-pulse" />
            Active Region: <strong className="text-cool">{region}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted" />
            {lastRun
              ? `Last snapshot captured ${timeAgo(lastRun)}`
              : "Awaiting snapshot collection"}
          </span>
        </div>
      </div>
      <RegionPicker current={region} />
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-cool",
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
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
          <h2 className="font-display text-lg font-bold tracking-tight text-text">
            {title}
          </h2>
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-xs font-semibold text-cool hover:underline"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
    <div className="rounded-2xl border border-edge bg-panel p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold text-text">{title}</h3>
        {note ? <p className="mt-0.5 text-xs text-muted">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

function NeedsMoreSnapshots() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-edge/60 bg-raised/20 p-6 text-center text-xs text-muted">
      <Clock className="h-6 w-6 text-cool mb-2" />
      <span className="font-semibold text-text">One snapshot recorded so far</span>
      <span className="mt-1 max-w-xs">
        The temporal view curve appears once consecutive 15-minute snapshots have accumulated.
      </span>
    </div>
  );
}
