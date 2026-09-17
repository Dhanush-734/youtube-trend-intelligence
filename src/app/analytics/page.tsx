import {
  getCategoryStats,
  getChannelStats,
  getRegionTimeline,
  getSummary,
  WEIGHTS,
} from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact } from "@/lib/format";
import { RegionPicker, StatCard } from "@/components/ui";
import { CategoryChart, ChannelChart, TimelineChart } from "@/components/charts";
import { Panel } from "@/app/page";
import {
  BarChart3,
  Flame,
  Zap,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  Calculator,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { region?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;

  const [summary, categories, channels, timeline] = await Promise.all([
    getSummary(region),
    getCategoryStats(region),
    getChannelStats(region, 12),
    getRegionTimeline(region, 72),
  ]);

  const avgEngagement =
    categories.length > 0
      ? (
          categories.reduce((s, c) => s + (c.avg_engagement ?? 0), 0) /
          categories.length
        ).toFixed(2)
      : "—";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cool" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Analytics Overview — {regionName}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted max-w-xl">
            Empirical measurements computed from immutable PostgreSQL snapshots over time.
            Zero forecasting or machine learning hallucination.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Videos Tracked" value={String(summary.videos)} sub="Current chart sample" />
        <StatCard label="Combined Views" value={compact(summary.total_views)} sub="Total observed reach" />
        <StatCard label="Distinct Channels" value={String(summary.channels)} sub="Represented creators" />
        <StatCard
          label="Mean Engagement"
          value={`${avgEngagement}%`}
          sub="(Likes + Comments) ÷ Views"
          variant="good"
        />
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Aggregated Views Timeline"
          note="Cumulative chart view growth across snapshot runs"
        >
          {timeline.length > 1 ? (
            <TimelineChart data={timeline} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-xs text-muted">
              Accumulating snapshot runs. Two runs needed to render curve.
            </div>
          )}
        </Panel>

        <Panel
          title="Category Composition"
          note="Distribution of trending videos across content genres"
        >
          <CategoryChart data={categories} />
        </Panel>
      </div>

      {/* Channel Reach */}
      <Panel
        title="Channel Cumulative Reach"
        note="Total views accumulated by channels currently appearing on the chart"
      >
        <ChannelChart data={channels} />
      </Panel>

      {/* Deep-dive into Trend Score Formula */}
      <div className="rounded-2xl border border-edge bg-panel p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cool/10 text-cool border border-cool/30">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-text">
              Custom Trend Score Mathematical Formulation
            </h2>
            <p className="text-xs text-muted">
              Why percentile ranking (<code className="text-cool">PERCENT_RANK()</code>) was engineered instead of raw weighting
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted leading-relaxed space-y-3">
          <p>
            In raw statistics, view growth is in the hundreds of thousands, engagement rate is a number around 5%, and recency is in hours. Multiplying raw values by weights would make view count 99% of the score regardless of user intent.
          </p>
          <p>
            The SQL engine executes <code className="text-cool">PERCENT_RANK() OVER (...)</code> across the current snapshot population, transforming each metric onto an invariant 0.0 to 1.0 interval. This protects the algorithm from viral outliers while enforcing exact multi-factor weighting.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "View Velocity",
              weight: WEIGHTS.velocity,
              color: "text-heat",
              border: "border-heat/30",
              desc: "Views gained ÷ elapsed hours",
              icon: Flame,
            },
            {
              name: "Engagement Rate",
              weight: WEIGHTS.engagement,
              color: "text-good",
              border: "border-good/30",
              desc: "(Likes + Comments) ÷ Views × 100",
              icon: Heart,
            },
            {
              name: "Recency Factor",
              weight: WEIGHTS.recency,
              color: "text-cool",
              border: "border-cool/30",
              desc: "Hours since publication, inverted",
              icon: Clock,
            },
            {
              name: "Popularity / Reach",
              weight: WEIGHTS.popularity,
              color: "text-purple-400",
              border: "border-purple-500/30",
              desc: "Absolute cumulative view count",
              icon: Eye,
            },
          ].map((item) => (
            <div
              key={item.name}
              className={`rounded-xl border ${item.border} bg-raised/40 p-4 transition-all hover:bg-raised/70`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">{item.name}</span>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="tnum mt-2 font-display text-2xl font-bold text-text">
                {Math.round(item.weight * 100)}%
              </div>
              <div className="mt-1 text-[11px] text-muted">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
