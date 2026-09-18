import Link from "next/link";
import { Flame } from "lucide-react";
import { getCategoryList, getTrending } from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { EmptyState, RegionPicker } from "@/components/ui";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { ExportButton } from "@/components/ExportButton";
import { TrendingView } from "@/components/TrendingView";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: {
    region?: string;
    category?: string;
    q?: string;
    sort?: "score" | "views" | "velocity" | "engagement" | "growth";
  };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;
  const category = searchParams.category ?? null;
  const queryText = searchParams.q ?? null;
  const sort = searchParams.sort ?? "score";

  const [videos, categories] = await Promise.all([
    getTrending(region, category, 50, 48, sort, queryText),
    getCategoryList(region),
  ]);

  const exportData = videos.map((v, i) => ({
    Rank: i + 1,
    Title: v.title,
    Channel: v.channel_name,
    Category: v.category_name,
    TrendScore: v.trend_score,
    Views: v.view_count,
    ViewsPerHour: Math.round(v.views_per_hour),
    GrowthPct: v.growth_pct ?? 0,
    EngagementRate: v.engagement_rate ?? 0,
    PublishedAt: v.published_at,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-yt-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30">
              <Flame className="h-5 w-5 fill-yt-red" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Trending in {regionName}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-yt-secondary max-w-xl leading-relaxed">
            Ranked by <strong className="text-white">Custom Trend Score</strong> — a percentile blend of view velocity (50%), engagement rate (20%), publication recency (15%), and reach (15%).
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {/* Toolbar: Search, Sort, Export */}
      <div className="space-y-3 rounded-2xl border border-yt-border bg-yt-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <SearchBar
              placeholder="Search trending titles or channels..."
              initialQuery={queryText ?? ""}
              initialSort={sort}
              showSort={true}
            />
          </div>
          {videos.length > 0 && (
            <div className="shrink-0 flex items-center gap-2">
              <ExportButton
                filename={`youtube_trending_${region}_${new Date().toISOString().slice(0, 10)}`}
                data={exportData}
                label="Export CSV"
              />
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="pt-3 border-t border-yt-border">
          <CategoryFilter
            categories={categories}
            current={category}
            region={region}
          />
        </div>
      </div>

      {/* Video Grid/List */}
      {videos.length === 0 ? (
        <EmptyState
          title="No trending videos match your query"
          body={
            queryText
              ? `No videos found matching "${queryText}". Try clearing the search or category filter.`
              : "No snapshots currently recorded for this category. Try selecting another category or run the collector."
          }
          action={
            queryText ? (
              <Link
                href={`/trending?region=${region}`}
                className="rounded-xl bg-yt-elevated px-4 py-2 text-xs font-semibold text-white hover:bg-yt-card border border-yt-border transition-all"
              >
                Clear Search Filter
              </Link>
            ) : undefined
          }
        />
      ) : (
        <TrendingView videos={videos} region={region} />
      )}
    </div>
  );
}
