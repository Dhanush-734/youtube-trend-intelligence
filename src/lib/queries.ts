import { query } from "./db";
import {
  WEIGHTS,
  RISING_MIN_VIEWS,
  RISING_MIN_VELOCITY,
} from "./constants";

export { WEIGHTS, RISING_MIN_VIEWS, RISING_MIN_VELOCITY };

export interface ScoredVideo {
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
  channel_id: string | null;
  channel_name: string | null;
  category_id: string | null;
  category_name: string | null;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  captured_at: string;
  chart_rank: number | null;
  prev_chart_rank: number | null;
  view_delta: number;
  window_hours: number;
  views_per_hour: number;
  growth_pct: number | null;
  engagement_rate: number | null;
  age_hours: number;
  r_velocity: number;
  r_engagement: number;
  r_recency: number;
  r_popularity: number;
  trend_score: number;
}

/**
 * Shared CTE chain.
 *
 *   latest   – newest snapshot per video in this region
 *   previous – the snapshot immediately before it
 *   metrics  – raw growth / engagement / recency figures & chart rank progression
 *   scored   – each raw figure converted to a 0–1 PERCENT_RANK
 *
 * Normalising with PERCENT_RANK is the important bit: raw view growth is in the
 * hundreds of thousands while engagement rate is ~5, so weighting the raw values
 * would make the score 100% view growth. Percentile rank puts every component on
 * the same 0–1 footing and is immune to outliers.
 */
const SCORED_CTE = `
WITH latest AS (
  SELECT DISTINCT ON (video_id) *
    FROM video_snapshots
   WHERE region = $1
     AND captured_at > now() - ($4 || ' hours')::interval
   ORDER BY video_id, captured_at DESC
),
previous AS (
  SELECT DISTINCT ON (s.video_id)
         s.video_id, s.view_count, s.captured_at, s.chart_rank AS prev_chart_rank
    FROM video_snapshots s
    JOIN latest l ON l.video_id = s.video_id
   WHERE s.region = $1
     AND s.captured_at < l.captured_at
   ORDER BY s.video_id, s.captured_at DESC
),
metrics AS (
  SELECT
    v.video_id, v.title, v.thumbnail_url, v.published_at, v.category_id,
    c.channel_id, c.channel_name,
    cat.category_name,
    l.view_count, l.like_count, l.comment_count, l.captured_at, l.chart_rank,
    p.prev_chart_rank,
    GREATEST(l.view_count - COALESCE(p.view_count, l.view_count), 0) AS view_delta,
    COALESCE(EXTRACT(EPOCH FROM (l.captured_at - p.captured_at)) / 3600.0, 0) AS window_hours,
    CASE WHEN COALESCE(p.view_count, 0) > 0
         THEN ROUND(((l.view_count - p.view_count)::numeric / p.view_count) * 100, 2)
         ELSE NULL END AS growth_pct,
    CASE WHEN l.view_count > 0
         THEN ROUND(((COALESCE(l.like_count, 0) + COALESCE(l.comment_count, 0))::numeric
                     / l.view_count) * 100, 2)
         ELSE NULL END AS engagement_rate,
    EXTRACT(EPOCH FROM (now() - v.published_at)) / 3600.0 AS age_hours
  FROM latest l
  JOIN videos v   ON v.video_id = l.video_id
  LEFT JOIN previous p   ON p.video_id = l.video_id
  LEFT JOIN channels c   ON c.channel_id = v.channel_id
  LEFT JOIN categories cat ON cat.category_id = v.category_id AND cat.region = $1
  WHERE ($2::text IS NULL OR v.category_id = $2)
),
velocity AS (
  SELECT *,
         CASE WHEN window_hours > 0 THEN view_delta / window_hours ELSE 0 END AS views_per_hour
    FROM metrics
),
scored AS (
  SELECT *,
    PERCENT_RANK() OVER (ORDER BY views_per_hour)                 AS r_velocity,
    PERCENT_RANK() OVER (ORDER BY COALESCE(engagement_rate, 0))   AS r_engagement,
    PERCENT_RANK() OVER (ORDER BY age_hours DESC)                 AS r_recency,
    PERCENT_RANK() OVER (ORDER BY view_count)                     AS r_popularity
  FROM velocity
)
`;

const SCORE_EXPR = `
  ROUND((${WEIGHTS.velocity} * r_velocity
       + ${WEIGHTS.engagement} * r_engagement
       + ${WEIGHTS.recency} * r_recency
       + ${WEIGHTS.popularity} * r_popularity) * 100)::int AS trend_score
`;

export async function getTrending(
  region: string,
  categoryId: string | null = null,
  limit = 50,
  windowHours = 48,
  sort: "score" | "views" | "velocity" | "engagement" | "growth" = "score",
  queryText: string | null = null,
): Promise<ScoredVideo[]> {
  let orderBy = "trend_score DESC, view_count DESC";
  if (sort === "views") orderBy = "view_count DESC";
  else if (sort === "velocity") orderBy = "views_per_hour DESC";
  else if (sort === "engagement") orderBy = "engagement_rate DESC NULLS LAST";
  else if (sort === "growth") orderBy = "growth_pct DESC NULLS LAST";

  const searchFilter = queryText && queryText.trim()
    ? `AND (LOWER(title) LIKE '%' || LOWER($5) || '%' OR LOWER(COALESCE(channel_name, '')) LIKE '%' || LOWER($5) || '%')`
    : "";

  const params: unknown[] = [region, categoryId, limit, String(windowHours)];
  if (queryText && queryText.trim()) {
    params.push(queryText.trim());
  }

  return query<ScoredVideo>(
    `${SCORED_CTE}
     SELECT *, ${SCORE_EXPR} FROM scored
      WHERE 1=1 ${searchFilter}
      ORDER BY ${orderBy}
      LIMIT $3`,
    params,
  );
}

/**
 * Rising = clearing the view floor AND gaining faster than the velocity
 * threshold. The floor stops a video going 12 → 400 views from topping the
 * chart at +3,233%.
 */
export async function getRising(
  region: string,
  limit = 30,
  windowHours = 48,
  queryText: string | null = null,
): Promise<ScoredVideo[]> {
  const searchFilter = queryText && queryText.trim()
    ? `AND (LOWER(title) LIKE '%' || LOWER($5) || '%' OR LOWER(COALESCE(channel_name, '')) LIKE '%' || LOWER($5) || '%')`
    : "";

  const params: unknown[] = [region, null, limit, String(windowHours)];
  if (queryText && queryText.trim()) {
    params.push(queryText.trim());
  }

  return query<ScoredVideo>(
    `${SCORED_CTE}
     SELECT *, ${SCORE_EXPR} FROM scored
      WHERE view_count >= ${RISING_MIN_VIEWS}
        AND views_per_hour >= ${RISING_MIN_VELOCITY}
        AND window_hours > 0
        ${searchFilter}
      ORDER BY views_per_hour DESC
      LIMIT $3`,
    params,
  );
}

export interface Summary {
  videos: number;
  channels: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  last_captured_at: string | null;
}

export async function getSummary(region: string): Promise<Summary> {
  const rows = await query<Summary>(
    `WITH latest AS (
       SELECT DISTINCT ON (video_id) *
         FROM video_snapshots
        WHERE region = $1 AND captured_at > now() - interval '48 hours'
        ORDER BY video_id, captured_at DESC
     )
     SELECT COUNT(*)::int                         AS videos,
            COUNT(DISTINCT v.channel_id)::int     AS channels,
            COALESCE(SUM(l.view_count), 0)::bigint AS total_views,
            COALESCE(SUM(l.like_count), 0)::bigint AS total_likes,
            COALESCE(SUM(l.comment_count), 0)::bigint AS total_comments,
            MAX(l.captured_at)                    AS last_captured_at
       FROM latest l JOIN videos v ON v.video_id = l.video_id`,
    [region],
  );
  return (
    rows[0] ?? {
      videos: 0,
      channels: 0,
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      last_captured_at: null,
    }
  );
}

export interface CategoryStat {
  category_id: string;
  category_name: string;
  video_count: number;
  total_views: number;
  avg_engagement: number | null;
  share_pct: number;
}

export async function getCategoryStats(region: string): Promise<CategoryStat[]> {
  return query<CategoryStat>(
    `WITH latest AS (
       SELECT DISTINCT ON (video_id) *
         FROM video_snapshots
        WHERE region = $1 AND captured_at > now() - interval '48 hours'
        ORDER BY video_id, captured_at DESC
     ),
     joined AS (
       SELECT v.category_id,
              COALESCE(cat.category_name, 'Uncategorised') AS category_name,
              l.view_count, l.like_count, l.comment_count
         FROM latest l
         JOIN videos v ON v.video_id = l.video_id
         LEFT JOIN categories cat
                ON cat.category_id = v.category_id AND cat.region = $1
     )
     SELECT category_id,
            category_name,
            COUNT(*)::int                          AS video_count,
            SUM(view_count)::bigint                AS total_views,
            ROUND(AVG(((COALESCE(like_count,0) + COALESCE(comment_count,0))::numeric
                       / NULLIF(view_count,0)) * 100), 2) AS avg_engagement,
            ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS share_pct
       FROM joined
      GROUP BY category_id, category_name
      ORDER BY video_count DESC, total_views DESC`,
    [region],
  );
}

export interface ChannelStat {
  channel_id: string;
  channel_name: string;
  video_count: number;
  total_views: number;
  avg_views: number;
  avg_engagement: number | null;
}

export async function getChannelStats(
  region: string,
  limit = 20,
): Promise<ChannelStat[]> {
  return query<ChannelStat>(
    `WITH latest AS (
       SELECT DISTINCT ON (video_id) *
         FROM video_snapshots
        WHERE region = $1 AND captured_at > now() - interval '48 hours'
        ORDER BY video_id, captured_at DESC
     )
     SELECT c.channel_id,
            c.channel_name,
            COUNT(*)::int            AS video_count,
            SUM(l.view_count)::bigint AS total_views,
            ROUND(AVG(l.view_count))::bigint AS avg_views,
            ROUND(AVG(((COALESCE(l.like_count,0) + COALESCE(l.comment_count,0))::numeric
                       / NULLIF(l.view_count,0)) * 100), 2) AS avg_engagement
       FROM latest l
       JOIN videos v   ON v.video_id = l.video_id
       JOIN channels c ON c.channel_id = v.channel_id
      GROUP BY c.channel_id, c.channel_name
      ORDER BY video_count DESC, total_views DESC
      LIMIT $2`,
    [region, limit],
  );
}

export interface TimelinePoint {
  captured_at: string;
  total_views: number;
  video_count: number;
}

/** Total views across the whole chart, per collection batch. */
export async function getRegionTimeline(
  region: string,
  hours = 24,
): Promise<TimelinePoint[]> {
  return query<TimelinePoint>(
    `SELECT captured_at,
            SUM(view_count)::bigint AS total_views,
            COUNT(*)::int           AS video_count
       FROM video_snapshots
      WHERE region = $1
        AND captured_at > now() - ($2 || ' hours')::interval
      GROUP BY captured_at
      ORDER BY captured_at`,
    [region, String(hours)],
  );
}

export interface VideoDetail extends ScoredVideo {
  duration_seconds: number | null;
}

export async function getVideoDetail(
  videoId: string,
  region: string,
): Promise<VideoDetail | null> {
  const rows = await query<VideoDetail>(
    `${SCORED_CTE}
     SELECT s.*, v.duration_seconds, ${SCORE_EXPR}
       FROM scored s JOIN videos v ON v.video_id = s.video_id
      WHERE s.video_id = $3
      LIMIT 1`,
    [region, null, videoId, "48"],
  );
  return rows[0] ?? null;
}

export interface HistoryPoint {
  captured_at: string;
  chart_rank: number | null;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  views_gained: number | null;
  views_per_hour: number | null;
}

/**
 * Per-video history with growth computed by a window function.
 * LAG() is why this project needs a real database and not a JSON file.
 */
export async function getVideoHistory(
  videoId: string,
  region: string,
): Promise<HistoryPoint[]> {
  return query<HistoryPoint>(
    `SELECT captured_at,
            chart_rank,
            view_count,
            like_count,
            comment_count,
            view_count - LAG(view_count) OVER w AS views_gained,
            CASE WHEN EXTRACT(EPOCH FROM (captured_at - LAG(captured_at) OVER w)) > 0
                 THEN ROUND((view_count - LAG(view_count) OVER w)
                       / (EXTRACT(EPOCH FROM (captured_at - LAG(captured_at) OVER w)) / 3600.0))
                 ELSE NULL END AS views_per_hour
       FROM video_snapshots
      WHERE video_id = $1 AND region = $2
     WINDOW w AS (ORDER BY captured_at)
      ORDER BY captured_at`,
    [videoId, region],
  );
}

export async function getCategoryList(
  region: string,
): Promise<{ category_id: string; category_name: string }[]> {
  return query(
    `SELECT DISTINCT cat.category_id, cat.category_name
       FROM categories cat
       JOIN videos v ON v.category_id = cat.category_id
      WHERE cat.region = $1
      ORDER BY cat.category_name`,
    [region],
  );
}

/** System health metrics for the dashboard header beacon. */
export interface SystemHealth {
  totalSnapshots: number;
  totalVideos: number;
  totalRuns: number;
  lastRunTime: string | null;
  lastRunStatus: string | null;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const [snapshotCount, videoCount, lastRun] = await Promise.all([
    query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM video_snapshots`),
    query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM videos`),
    query<{ started_at: string; status: string }>(
      `SELECT started_at, status FROM collection_runs ORDER BY id DESC LIMIT 1`,
    ),
  ]);

  return {
    totalSnapshots: snapshotCount[0]?.count ?? 0,
    totalVideos: videoCount[0]?.count ?? 0,
    totalRuns: 0,
    lastRunTime: lastRun[0]?.started_at ?? null,
    lastRunStatus: lastRun[0]?.status ?? null,
  };
}

/** Has the collector ever run? Drives the empty state. */
export async function hasData(region: string): Promise<boolean> {
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM video_snapshots WHERE region = $1 LIMIT 1`,
    [region],
  );
  return (rows[0]?.count ?? 0) > 0;
}

export interface CountryComparisonItem {
  region: string;
  video_count: number;
  total_views: number;
  total_likes: number;
  avg_views: number;
  last_captured_at: string | null;
}

/** Summarized comparisons across all 5 monitored regions for the Analytics suite */
export async function getCountryComparison(): Promise<CountryComparisonItem[]> {
  return query<CountryComparisonItem>(
    `WITH latest AS (
       SELECT DISTINCT ON (region, video_id) *
         FROM video_snapshots
        WHERE captured_at > now() - interval '48 hours'
        ORDER BY region, video_id, captured_at DESC
     )
     SELECT region,
            COUNT(*)::int AS video_count,
            COALESCE(SUM(view_count), 0)::bigint AS total_views,
            COALESCE(SUM(like_count), 0)::bigint AS total_likes,
            COALESCE(ROUND(AVG(view_count)), 0)::bigint AS avg_views,
            MAX(captured_at) AS last_captured_at
       FROM latest
      GROUP BY region
      ORDER BY total_views DESC`,
  );
}

export interface ScoreBucket {
  range: string;
  count: number;
  fill?: string;
}

/** Distribution buckets of Custom Trend Scores (0-100) */
export async function getScoreDistribution(region: string): Promise<ScoreBucket[]> {
  const rows = await query<{ bucket: string; count: number }>(
    `${SCORED_CTE}
     , scored_with_val AS (
       SELECT *, ${SCORE_EXPR} FROM scored
     )
     SELECT CASE 
              WHEN trend_score >= 80 THEN '80-100 (Viral)'
              WHEN trend_score >= 60 THEN '60-79 (High)'
              WHEN trend_score >= 40 THEN '40-59 (Moderate)'
              WHEN trend_score >= 20 THEN '20-39 (Low)'
              ELSE '0-19 (Minimal)'
            END AS bucket,
            COUNT(*)::int AS count
       FROM scored_with_val
      WHERE ($3::int IS NULL OR 1=1)
      GROUP BY bucket`,
    [region, null, 100, "48"],
  );

  const desiredBuckets: ScoreBucket[] = [
    { range: "80-100 (Viral)", count: 0, fill: "#FF0000" },
    { range: "60-79 (High)", count: 0, fill: "#FF4D4D" },
    { range: "40-59 (Moderate)", count: 0, fill: "#888888" },
    { range: "20-39 (Low)", count: 0, fill: "#555555" },
    { range: "0-19 (Minimal)", count: 0, fill: "#333333" },
  ];

  rows.forEach((r) => {
    const found = desiredBuckets.find((b) => b.range.startsWith(r.bucket.slice(0, 5)));
    if (found) found.count = r.count;
  });

  return desiredBuckets;
}

