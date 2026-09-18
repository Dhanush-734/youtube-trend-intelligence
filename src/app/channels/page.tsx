import { Users, ExternalLink, Flame, Search } from "lucide-react";
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-yt-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Channels Charting in {regionName}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-yt-secondary max-w-xl leading-relaxed">
            Creators with videos currently charting in {regionName}, ranked by charting video volume and aggregate observed reach.
          </p>
        </div>
        <RegionPicker current={region} />
      </div>

      {channels.length === 0 ? (
        <EmptyState
          title="No channel snapshot data recorded yet"
          body="Run the data collection pipeline to identify trending creators."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yt-secondary">
              Showing top {channels.length} creators
            </span>
            <ExportButton
              filename={`youtube_channels_${region}_${new Date().toISOString().slice(0, 10)}`}
              data={exportData}
              label="Export Channels CSV"
            />
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-yt-border bg-yt-card shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-yt-border bg-yt-elevated/60 text-left text-yt-secondary font-semibold">
                  <th className="px-5 py-4 w-14 text-center">#</th>
                  <th className="px-5 py-4 font-bold text-white">Creator Channel</th>
                  <th className="px-5 py-4 text-right font-bold">Videos on Chart</th>
                  <th className="px-5 py-4 text-right font-bold">Aggregated Views</th>
                  <th className="px-5 py-4 text-right font-bold">Average per Video</th>
                  <th className="px-5 py-4 text-right font-bold">Avg Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yt-border/60">
                {channels.map((c, i) => (
                  <tr
                    key={c.channel_id}
                    className="group transition-colors hover:bg-yt-elevated/70"
                  >
                    <td className="tnum px-5 py-3.5 text-center text-yt-secondary font-bold">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-yt-red transition-colors text-sm">
                          {c.channel_name}
                        </span>
                        <a
                          href={`https://www.youtube.com/channel/${c.channel_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-yt-muted hover:text-yt-red transition-colors p-1"
                          title="Open channel on YouTube"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="tnum px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-yt-red/15 px-2.5 py-1 text-yt-red font-bold border border-yt-red/30">
                        <Flame className="h-3 w-3 fill-yt-red" />
                        {c.video_count}
                      </span>
                    </td>
                    <td className="tnum px-5 py-3.5 text-right font-bold text-white" title={full(c.total_views)}>
                      {compact(c.total_views)}
                    </td>
                    <td className="tnum px-5 py-3.5 text-right text-yt-secondary">
                      {compact(c.avg_views)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Shown on mobile only — NO horizontal scrolling required!) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {channels.map((c, i) => (
              <div
                key={c.channel_id}
                className="rounded-2xl border border-yt-border bg-yt-card p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yt-elevated text-xs font-black text-yt-red">
                      #{i + 1}
                    </span>
                    <span className="font-bold text-sm text-white truncate">
                      {c.channel_name}
                    </span>
                    <a
                      href={`https://www.youtube.com/channel/${c.channel_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yt-muted hover:text-yt-red p-1 shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-yt-red/15 px-2 py-0.5 text-xs font-bold text-yt-red">
                    <Flame className="h-3 w-3 fill-yt-red" />
                    {c.video_count} vids
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-yt-border text-center text-xs">
                  <div className="rounded-xl bg-yt-elevated/50 p-2">
                    <div className="text-[10px] text-yt-muted">Total Views</div>
                    <div className="tnum font-bold text-white mt-0.5">{compact(c.total_views)}</div>
                  </div>
                  <div className="rounded-xl bg-yt-elevated/50 p-2">
                    <div className="text-[10px] text-yt-muted">Avg / Video</div>
                    <div className="tnum font-bold text-yt-secondary mt-0.5">{compact(c.avg_views)}</div>
                  </div>
                  <div className="rounded-xl bg-yt-elevated/50 p-2">
                    <div className="text-[10px] text-yt-muted">Engagement</div>
                    <div className="tnum font-bold text-green-400 mt-0.5">
                      {c.avg_engagement !== null ? `${c.avg_engagement}%` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
