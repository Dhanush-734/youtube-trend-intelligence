import Link from "next/link";
import { Music2, ArrowRight, Layers, Flame, TrendingUp } from "lucide-react";
import { getCategoryStats } from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact } from "@/lib/format";
import { EmptyState, RegionPicker } from "@/components/ui";
import { CategoryChart } from "@/components/charts";
import { Panel } from "@/app/page";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { region?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;
  const categories = await getCategoryStats(region);

  const exportData = categories.map((c) => ({
    CategoryId: c.category_id,
    Category: c.category_name,
    VideoCount: c.video_count,
    SharePct: c.share_pct,
    TotalViews: c.total_views,
    AverageEngagement: c.avg_engagement ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-yt-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
              <Music2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Category Intelligence — {regionName}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-yt-secondary max-w-xl leading-relaxed">
            Genre breakdown of trending videos in {regionName}, including market share, aggregate reach, and audience interaction rates.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No category metrics recorded yet"
          body="Run the data collection pipeline to populate category statistics."
        />
      ) : (
        <div className="space-y-6">
          {/* Top Category Distribution Chart */}
          <Panel
            title="📊 Category Composition Distribution"
            note="Number of trending videos per genre on the current chart"
          >
            <CategoryChart data={categories} />
          </Panel>

          {/* Detailed Categories Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-yt-secondary">
                Detailed category breakdown ({categories.length} categories)
              </span>
              <ExportButton
                filename={`youtube_categories_${region}_${new Date().toISOString().slice(0, 10)}`}
                data={exportData}
                label="Export Categories CSV"
              />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-yt-border bg-yt-card shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-yt-border bg-yt-elevated/60 text-left text-yt-secondary font-semibold">
                    <th className="px-5 py-4 font-bold text-white">Category Name</th>
                    <th className="px-5 py-4 text-right font-bold">Videos</th>
                    <th className="px-5 py-4 text-right font-bold">Chart Share</th>
                    <th className="px-5 py-4 text-right font-bold">Combined Views</th>
                    <th className="px-5 py-4 text-right font-bold">Avg Engagement</th>
                    <th className="px-5 py-4 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yt-border/60">
                  {categories.map((c) => (
                    <tr
                      key={c.category_id}
                      className="group transition-colors hover:bg-yt-elevated/70"
                    >
                      <td className="px-5 py-3.5 font-bold text-white group-hover:text-yt-red transition-colors text-sm">
                        {c.category_name}
                      </td>
                      <td className="tnum px-5 py-3.5 text-right font-bold text-white">
                        {c.video_count}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="tnum text-yt-secondary font-semibold">
                            {c.share_pct}%
                          </span>
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-yt-bg border border-yt-border/40">
                            <div
                              className="h-full rounded-full bg-yt-red"
                              style={{ width: `${Math.max(4, c.share_pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="tnum px-5 py-3.5 text-right font-bold text-white">
                        {compact(c.total_views)}
                      </td>
                      <td className="tnum px-5 py-3.5 text-right">
                        {c.avg_engagement !== null ? (
                          <span className="font-bold text-green-400">
                            {c.avg_engagement}%
                          </span>
                        ) : (
                          <span className="text-yt-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/trending?region=${region}&category=${c.category_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-yt-red hover:underline"
                        >
                          <span>Filter Chart</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Zero horizontal overflow on mobile!) */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {categories.map((c) => (
                <div
                  key={c.category_id}
                  className="rounded-2xl border border-yt-border bg-yt-card p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      {c.category_name}
                    </span>
                    <span className="tnum rounded-lg bg-yt-red/15 px-2 py-0.5 text-xs font-bold text-yt-red">
                      {c.video_count} videos ({c.share_pct}%)
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-yt-bg border border-yt-border/40">
                    <div
                      className="h-full rounded-full bg-yt-red"
                      style={{ width: `${Math.max(4, c.share_pct)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-yt-border text-center text-xs">
                    <div className="rounded-xl bg-yt-elevated/50 p-2">
                      <div className="text-[10px] text-yt-muted">Total Views</div>
                      <div className="tnum font-bold text-white mt-0.5">{compact(c.total_views)}</div>
                    </div>
                    <div className="rounded-xl bg-yt-elevated/50 p-2">
                      <div className="text-[10px] text-yt-muted">Avg Engagement</div>
                      <div className="tnum font-bold text-green-400 mt-0.5">
                        {c.avg_engagement !== null ? `${c.avg_engagement}%` : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-right">
                    <Link
                      href={`/trending?region=${region}&category=${c.category_id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-yt-red hover:underline"
                    >
                      <span>Filter Trending Videos</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
