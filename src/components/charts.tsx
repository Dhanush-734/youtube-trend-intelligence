"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compact, clockLabel } from "@/lib/format";

const AXIS_COLOR = "#888888";
const GRID_COLOR = "#262626";
const YT_RED = "#FF0000";
const YT_DARK_RED = "#CC0000";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-yt-border bg-yt-card/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-yt-secondary">{label}</div>
        <div className="mt-1.5 space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? YT_RED }}
              />
              <span className="font-medium text-yt-secondary">
                {entry.name ? `${entry.name}: ` : ""}
                <span className="font-bold text-white">{compact(entry.value)}</span>
                {unit ? ` ${unit}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/* --------------------------------------------------------------- */
/* 1. TimelineChart: Total views across collection runs             */
/* --------------------------------------------------------------- */
export function TimelineChart({
  data,
}: {
  data: { captured_at: string; total_views: number }[];
}) {
  const rows = data.map((d) => ({
    time: clockLabel(d.captured_at),
    views: d.total_views,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={rows} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="ytRedViewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={YT_RED} stopOpacity={0.45} />
            <stop offset="90%" stopColor={YT_RED} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => compact(Number(v))}
        />
        <Tooltip content={<CustomTooltip unit="views" />} />
        <Area
          type="monotone"
          dataKey="views"
          name="Total Views"
          stroke={YT_RED}
          strokeWidth={2.5}
          fill="url(#ytRedViewsFill)"
          activeDot={{ r: 5, fill: YT_RED, stroke: "#0F0F0F", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 2. CategoryChart: Category distribution                          */
/* --------------------------------------------------------------- */
export function CategoryChart({
  data,
}: {
  data: { category_name: string; video_count: number; total_views?: number }[];
}) {
  const rows = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 12, right: 12, left: -20, bottom: 20 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="category_name"
          tick={{ fill: AXIS_COLOR, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={48}
        />
        <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <Tooltip content={<CustomTooltip unit="videos" />} />
        <Bar dataKey="video_count" name="Videos" radius={[6, 6, 0, 0]}>
          {rows.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? YT_RED : i === 1 ? "#FF4D4D" : "#383838"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 3. ChannelChart: Top channels by reach                           */
/* --------------------------------------------------------------- */
export function ChannelChart({
  data,
}: {
  data: { channel_name: string; total_views: number; video_count?: number }[];
}) {
  const rows = data.slice(0, 8).map((d) => ({
    name: d.channel_name.length > 18 ? `${d.channel_name.slice(0, 17)}…` : d.channel_name,
    views: d.total_views,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => compact(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip unit="total views" />} />
        <Bar dataKey="views" name="Reach" radius={[0, 6, 6, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={i === 0 ? YT_RED : i === 1 ? "#FF4D4D" : "#383838"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 4. CountryComparisonChart: Cross-region comparison               */
/* --------------------------------------------------------------- */
export function CountryComparisonChart({
  data,
}: {
  data: { region: string; total_views: number; video_count: number }[];
}) {
  const flags: Record<string, string> = {
    IN: "🇮🇳 India",
    US: "🇺🇸 US",
    GB: "🇬🇧 UK",
    CA: "🇨🇦 Canada",
    AU: "🇦🇺 Australia",
  };

  const rows = data.map((d) => ({
    country: flags[d.region] ?? d.region,
    views: d.total_views,
    videos: d.video_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 12, right: 12, left: -10, bottom: 10 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="country" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => compact(Number(v))}
        />
        <Tooltip content={<CustomTooltip unit="views" />} />
        <Bar dataKey="views" name="Aggregate Views" radius={[6, 6, 0, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={i === 0 ? YT_RED : "#444444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 5. ScoreDistributionChart: Custom Trend Score histogram          */
/* --------------------------------------------------------------- */
export function ScoreDistributionChart({
  data,
}: {
  data: { range: string; count: number; fill?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 10 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="range" tick={{ fill: AXIS_COLOR, fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <Tooltip content={<CustomTooltip unit="videos" />} />
        <Bar dataKey="count" name="Videos" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill ?? YT_RED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 6. VideoHistoryChart: Single video observed view curve           */
/* --------------------------------------------------------------- */
export function VideoHistoryChart({
  data,
}: {
  data: { captured_at: string; view_count: number }[];
}) {
  const rows = data.map((d) => ({
    time: clockLabel(d.captured_at),
    views: d.view_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={rows} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="vidCurveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={YT_RED} stopOpacity={0.4} />
            <stop offset="90%" stopColor={YT_RED} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => compact(Number(v))}
        />
        <Tooltip content={<CustomTooltip unit="views" />} />
        <Area
          type="monotone"
          dataKey="views"
          name="Observed Views"
          stroke={YT_RED}
          strokeWidth={2.5}
          fill="url(#vidCurveFill)"
          dot={{ r: 3.5, fill: YT_RED, stroke: "#0F0F0F", strokeWidth: 1.5 }}
          activeDot={{ r: 6, fill: YT_RED, stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* 7. VelocityChart: Views gained per hour with Rising Floor line   */
/* --------------------------------------------------------------- */
export function VelocityChart({
  data,
  threshold,
}: {
  data: { captured_at: string; views_per_hour: number | null }[];
  threshold: number;
}) {
  const rows = data
    .filter((d) => d.views_per_hour !== null)
    .map((d) => ({
      time: clockLabel(d.captured_at),
      rate: d.views_per_hour as number,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => compact(Number(v))}
        />
        <Tooltip content={<CustomTooltip unit="/hr" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: AXIS_COLOR, paddingTop: 8 }} />
        <ReferenceLine
          y={threshold}
          stroke={YT_RED}
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: `Rising Floor ${compact(threshold)}/hr`,
            fill: YT_RED,
            fontSize: 10,
            position: "insideTopRight",
            offset: 8,
          }}
        />
        <Bar dataKey="rate" name="Views per hour" radius={[4, 4, 0, 0]}>
          {rows.map((r, i) => (
            <Cell
              key={i}
              fill={r.rate >= threshold ? YT_RED : "#444444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
