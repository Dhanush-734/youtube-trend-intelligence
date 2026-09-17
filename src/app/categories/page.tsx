import Link from "next/link";
import { Grid, ArrowRight } from "lucide-react";
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="h-6 w-6 text-cool" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Category Intelligence — {regionName}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted max-w-xl">
            Breakdown of trending categories, their market share, aggregate reach, and audience interaction rates.
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
          <Panel
            title="Category Composition Distribution"
            note="Number of trending videos per genre on the current chart"
          >
            <CategoryChart data={categories} />
          </Panel>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">
                Detailed category breakdown ({categories.length} categories)
              </span>
              <ExportButton
                filename={`youtube_categories_${region}_${new Date().toISOString().slice(0, 10)}`}
                data={exportData}
                label="Export Categories CSV"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-xs">
                  <thead>
                    <tr className="border-b border-edge bg-raised/50 text-left text-muted font-medium">
                      <th className="px-4 py-3.5 font-semibold text-text">Category</th>
                      <th className="px-4 py-3.5 text-right font-semibold">Videos</th>
                      <th className="px-4 py-3.5 text-right font-semibold">Chart Share</th>
                      <th className="px-4 py-3.5 text-right font-semibold">Combined Views</th>
                      <th className="px-4 py-3.5 text-right font-semibold">Avg Engagement</th>
                      <th className="px-4 py-3.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge/60">
                    {categories.map((c) => (
                      <tr
                        key={c.category_id}
                        className="group transition-colors hover:bg-raised/60"
                      >
                        <td className="px-4 py-3 font-semibold text-text group-hover:text-cool transition-colors">
                          {c.category_name}
                        </td>
                        <td className="tnum px-4 py-3 text-right font-bold text-text">
                          {c.video_count}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="tnum text-muted font-medium">
                              {c.share_pct}%
                            </span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-raised">
                              <div
                                className="h-full rounded-full bg-cool"
                                style={{ width: `${Math.max(4, c.share_pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="tnum px-4 py-3 text-right font-medium text-text">
                          {compact(c.total_views)}
                        </td>
                        <td className="tnum px-4 py-3 text-right">
                          {c.avg_engagement !== null ? (
                            <span className="font-semibold text-good">
                              {c.avg_engagement}%
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/trending?region=${region}&category=${c.category_id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cool hover:underline"
                          >
                            <span>Filter</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
