import {
  getCategoryStats,
  getChannelStats,
  getCountryComparison,
  getRegionTimeline,
  getScoreDistribution,
  getSummary,
  WEIGHTS,
} from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact } from "@/lib/format";
import { RegionPicker, StatCard } from "@/components/ui";
import {
  CategoryChart,
  ChannelChart,
  CountryComparisonChart,
  ScoreDistributionChart,
  TimelineChart,
} from "@/components/charts";
import { Panel } from "@/app/page";
import {
  BarChart3,
  Flame,
  Zap,
  Clock,
  Eye,
  Heart,
  Calculator,
  Globe,
  TrendingUp,
  Award,
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

  const [summary, categories, channels, timeline, countryComparison, scoreDist] =
    await Promise.all([
      getSummary(region),
      getCategoryStats(region),
      getChannelStats(region, 12),
      getRegionTimeline(region, 72),
      getCountryComparison(),
      getScoreDistribution(region),
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-yt-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Analytics Overview — {regionName}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-yt-secondary max-w-2xl leading-relaxed">
            Empirical measurements computed from immutable PostgreSQL snapshots over time.
            Zero speculative forecasting or synthetic machine learning hallucination.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {/* KPI Stats: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Videos Tracked"
          value={String(summary.videos)}
          sub="Current snapshot batch"
          variant="default"
        />
        <StatCard
          label="Combined Views"
          value={compact(summary.total_views)}
          sub="Total observed reach"
          variant="default"
        />
        <StatCard
          label="Distinct Channels"
          value={String(summary.channels)}
          sub="Represented creators"
          variant="default"
        />
        <StatCard
          label="Mean Engagement"
          value={`${avgEngagement}%`}
          sub="(Likes + Comments) ÷ Views"
          variant="red"
        />
      </div>

      {/* Interactive Charts: View Growth Over Time & Category Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="📈 View Growth Over Time"
          note="Cumulative views measured across snapshot intervals"
        >
          {timeline.length > 1 ? (
            <TimelineChart data={timeline} />
          ) : (
            <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-yt-border bg-yt-elevated/30 p-6 text-center text-xs text-yt-secondary">
              Accumulating snapshot runs. Two consecutive runs needed to render time curve.
            </div>
          )}
        </Panel>

        <Panel
          title="📊 Category Distribution"
          note="Volume of trending videos categorized by genre"
        >
          <CategoryChart data={categories} />
        </Panel>
      </div>

      {/* Channel Performance & Country Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="🏆 Channel Performance"
          note="Top creators by total accumulated views across charting videos"
        >
          <ChannelChart data={channels} />
        </Panel>

        <Panel
          title="🌎 Country Comparison"
          note="Aggregate view reach across monitored YouTube territories"
        >
          {countryComparison.length > 0 ? (
            <CountryComparisonChart data={countryComparison} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-xs text-yt-secondary">
              Awaiting multi-region snapshot collection.
            </div>
          )}
        </Panel>
      </div>

      {/* Engagement Analysis & Trend Score Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="👍 Engagement Analysis by Category"
          note="Average audience interaction rate ((Likes + Comments) ÷ Views)"
        >
          <div className="space-y-3 pt-1">
            {categories.slice(0, 6).map((cat) => (
              <div
                key={cat.category_id}
                className="flex items-center justify-between rounded-xl border border-yt-border/80 bg-yt-elevated/40 px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between pr-4">
                    <span className="text-xs font-semibold text-white truncate">
                      {cat.category_name}
                    </span>
                    <span className="tnum text-xs font-bold text-yt-red">
                      {cat.avg_engagement !== null ? `${cat.avg_engagement}%` : "—"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-yt-bg border border-yt-border/40">
                    <div
                      className="h-full rounded-full bg-yt-red"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(6, ((cat.avg_engagement ?? 0) / 10) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="🔥 Custom Trend Score Distribution"
          note="Count of videos segmented by score percentile range"
        >
          <ScoreDistributionChart data={scoreDist} />
        </Panel>
      </div>

      {/* Deep-dive into Trend Score Formula */}
      <div className="rounded-3xl border border-yt-border bg-yt-card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Custom Trend Score Mathematical Formulation
            </h2>
            <p className="text-xs text-yt-secondary">
              Why percentile ranking (<code className="text-yt-red font-mono">PERCENT_RANK()</code>) was engineered instead of raw weighting
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-yt-secondary leading-relaxed space-y-3">
          <p>
            In raw YouTube metrics, total view counts scale into millions, engagement rate hovers around 3–8%, and publication recency is measured in elapsed hours. Applying linear weights directly to raw values would make absolute view count dominate 99% of the score regardless of user intent.
          </p>
          <p>
            The PostgreSQL query engine computes <code className="text-yt-red font-mono">PERCENT_RANK() OVER (...)</code> across the current snapshot population, transforming every metric onto a uniform 0.0 to 1.0 interval. This shields the ranking from viral mega-channel outliers while enforcing precise multi-factor weighting:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {[
            {
              name: "View Velocity",
              weight: WEIGHTS.velocity,
              color: "text-yt-red",
              border: "border-yt-red/40",
              desc: "Views gained ÷ elapsed window hours",
              icon: Flame,
            },
            {
              name: "Engagement Rate",
              weight: WEIGHTS.engagement,
              color: "text-green-400",
              border: "border-green-500/40",
              desc: "(Likes + Comments) ÷ Views × 100",
              icon: Heart,
            },
            {
              name: "Recency Factor",
              weight: WEIGHTS.recency,
              color: "text-blue-400",
              border: "border-blue-500/40",
              desc: "Hours since publication, inverted rank",
              icon: Clock,
            },
            {
              name: "Popularity / Reach",
              weight: WEIGHTS.popularity,
              color: "text-purple-400",
              border: "border-purple-500/40",
              desc: "Cumulative total observed view count",
              icon: Eye,
            },
          ].map((item) => (
            <div
              key={item.name}
              className={`rounded-2xl border ${item.border} bg-yt-elevated/40 p-5 transition-all hover:bg-yt-elevated/70 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{item.name}</span>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="tnum mt-2.5 text-3xl font-extrabold text-white">
                {Math.round(item.weight * 100)}%
              </div>
              <div className="mt-1.5 text-[11px] text-yt-secondary leading-normal">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
