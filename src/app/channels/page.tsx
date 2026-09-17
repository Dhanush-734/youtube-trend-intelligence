import { Users, ExternalLink, Flame } from "lucide-react";
import { getChannelStats } from "@/lib/queries";
import { REGIONS, isRegion } from "@/lib/youtube";
import { compact, full } from "@/lib/format";
import { EmptyState, RegionPicker } from "@/components/ui";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: { region?: string };
}) {
  const region = isRegion(searchParams.region) ? searchParams.region : "IN";
  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;
  const channels = await getChannelStats(region, 50);

  const exportData = channels.map((c, i) => ({
    Rank: i + 1,
    Channel: c.channel_name,
    ChannelId: c.channel_id,
    VideosOnChart: c.video_count,
    TotalViews: c.total_views,
    AverageViews: c.avg_views,
    AverageEngagement: c.avg_engagement ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-cool" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Channels Charting in {regionName}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted max-w-xl">
            Creators with videos currently on the trending chart, ranked by total charting videos and aggregate views.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {channels.length === 0 ? (
        <EmptyState
          title="No channel snapshot data recorded yet"
          body="Run the data collection pipeline to identify trending channels."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">
              Showing top {channels.length} creators
            </span>
            <ExportButton
              filename={`youtube_channels_${region}_${new Date().toISOString().slice(0, 10)}`}
              data={exportData}
              label="Export Channels CSV"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-xs">
                <thead>
                  <tr className="border-b border-edge bg-raised/50 text-left text-muted font-medium">
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th className="px-4 py-3.5 font-semibold text-text">Channel Name</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Videos on Chart</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Aggregated Views</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Average per Video</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Avg Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge/60">
                  {channels.map((c, i) => (
                    <tr
                      key={c.channel_id}
                      className="group transition-colors hover:bg-raised/60"
                    >
                      <td className="tnum px-4 py-3 text-center text-muted font-bold">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text group-hover:text-cool transition-colors">
                            {c.channel_name}
                          </span>
                          <a
                            href={`https://www.youtube.com/channel/${c.channel_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted hover:text-cool"
                            title="Open channel on YouTube"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td className="tnum px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cool/10 px-2 py-0.5 text-cool font-bold">
                          <Flame className="h-3 w-3" />
                          {c.video_count}
                        </span>
                      </td>
                      <td className="tnum px-4 py-3 text-right font-medium text-text" title={full(c.total_views)}>
                        {compact(c.total_views)}
                      </td>
                      <td className="tnum px-4 py-3 text-right text-muted font-mono">
                        {compact(c.avg_views)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
