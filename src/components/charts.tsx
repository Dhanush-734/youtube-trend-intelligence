"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compact, clockLabel } from "@/lib/format";

const AXIS = { stroke: "#8892AA", fontSize: 11 };
const GRID = "#262F45";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-edge bg-panel/95 p-3 shadow-xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-muted">{label}</div>
        <div className="mt-1 space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? "#56A8FF" }}
              />
              <span className="font-medium text-text">
                {entry.name ? `${entry.name}: ` : ""}
                <span className="font-bold">{compact(entry.value)}</span>
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
/* Total views across the whole chart, per collection batch          */
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
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#56A8FF" stopOpacity={0.4} />
            <stop offset="90%" stopColor="#56A8FF" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
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
          stroke="#56A8FF"
          strokeWidth={2.5}
          fill="url(#viewsFill)"
          activeDot={{ r: 5, fill: "#56A8FF", stroke: "#0F1420", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* Category distribution                                             */
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
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="category_name"
          tick={{ ...AXIS, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-22}
          textAnchor="end"
          height={48}
        />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <Tooltip content={<CustomTooltip unit="videos" />} />
        <Bar dataKey="video_count" name="Videos" radius={[6, 6, 0, 0]}>
          {rows.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#FF7A45" : i === 1 ? "#56A8FF" : "#384568"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* Top channels                                                      */
/* --------------------------------------------------------------- */
export function ChannelChart({
  data,
}: {
  data: { channel_name: string; total_views: number; video_count?: number }[];
}) {
  const rows = data.slice(0, 8).map((d) => ({
    name: d.channel_name.length > 20 ? `${d.channel_name.slice(0, 19)}…` : d.channel_name,
    views: d.total_views,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => compact(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ ...AXIS, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip unit="total views" />} />
        <Bar dataKey="views" name="Reach" fill="#56A8FF" radius={[0, 4, 4, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#FF7A45" : "#56A8FF"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* Single video: observed view curve                                 */
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
            <stop offset="0%" stopColor="#56A8FF" stopOpacity={0.35} />
            <stop offset="90%" stopColor="#56A8FF" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
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
          stroke="#56A8FF"
          strokeWidth={2.5}
          fill="url(#vidCurveFill)"
          dot={{ r: 3.5, fill: "#56A8FF", stroke: "#0F1420", strokeWidth: 1.5 }}
          activeDot={{ r: 6, fill: "#56A8FF", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------- */
/* Single video: views gained per hour, with the alert threshold     */
/* drawn on it. This proves the pipeline computes historical rates.  */
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
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => compact(Number(v))}
        />
        <Tooltip content={<CustomTooltip unit="/hr" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8892AA", paddingTop: 8 }} />
        <ReferenceLine
          y={threshold}
          stroke="#FF7A45"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: `Rising Floor ${compact(threshold)}/hr`,
            fill: "#FF7A45",
            fontSize: 10,
            position: "insideTopRight",
            offset: 8,
          }}
        />
        <Bar dataKey="rate" name="Views per hour" radius={[4, 4, 0, 0]}>
          {rows.map((r, i) => (
            <Cell
              key={i}
              fill={r.rate >= threshold ? "#FF7A45" : "#384568"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
