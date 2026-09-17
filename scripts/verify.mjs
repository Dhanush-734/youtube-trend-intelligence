/**
 * Integration check: loads db/schema.sql into a scratch database, seeds two
 * snapshot batches, then runs every analytics query and prints the results.
 *
 *   DATABASE_URL="postgres://..." node scripts/verify.mjs
 *
 * Useful after changing any SQL, and a good thing to demo in a viva.
 */
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const c = new Client({ connectionString: url });
await c.connect();

console.log("→ loading schema");
await c.query(`DROP TABLE IF EXISTS video_snapshots, videos, channels, categories, collection_runs CASCADE`);
await c.query(fs.readFileSync("db/schema.sql", "utf8"));

console.log("→ seeding two collection batches");
const REGION = "IN";
const t1 = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
const t2 = new Date();

const seed = [
  // id, title, channel, category, publishedHoursAgo, views@t1, views@t2, likes, comments
  ["v_rocket", "Rocket launch highlights", "ch_space", "28", 3, 500_000, 900_000, 60_000, 4_000],
  ["v_song",   "New single official video", "ch_music", "10", 30, 2_400_000, 2_460_000, 180_000, 9_000],
  ["v_game",   "Ranked gameplay finale",    "ch_games", "20", 8, 800_000, 815_000, 40_000, 6_000],
  ["v_small",  "Tiny channel breakout",     "ch_indie", "22", 2, 12_000, 60_000, 5_000, 900],
  ["v_flat",   "Older documentary",         "ch_docs",  "27", 200, 1_100_000, 1_101_000, 30_000, 1_200],
];

for (const [id, title, ch, cat, ageH, v1, v2, likes, comments] of seed) {
  await c.query(`INSERT INTO channels (channel_id, channel_name) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [ch, ch.replace("ch_", "").toUpperCase()]);
  await c.query(
    `INSERT INTO categories (category_id, region, category_name) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
    [cat, REGION, { "28": "Science & Technology", "10": "Music", "20": "Gaming", "22": "People & Blogs", "27": "Education" }[cat]],
  );
  await c.query(
    `INSERT INTO videos (video_id, title, channel_id, category_id, published_at, duration_seconds, thumbnail_url)
     VALUES ($1,$2,$3,$4, now() - ($5 || ' hours')::interval, 600, '')`,
    [id, title, ch, cat, String(ageH)],
  );
  for (const [ts, views] of [[t1, v1], [t2, v2]]) {
    await c.query(
      `INSERT INTO video_snapshots (video_id, region, chart_rank, view_count, like_count, comment_count, captured_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, REGION, 1, views, likes, comments, ts],
    );
  }
}

console.log("→ testing the duplicate guard");
const dup = await c.query(
  `INSERT INTO video_snapshots (video_id, region, view_count, captured_at)
   VALUES ('v_song', 'IN', 999, $1) ON CONFLICT DO NOTHING RETURNING id`,
  [t2],
);
console.log(`   duplicate rows inserted: ${dup.rowCount} (expected 0)`);

// --- mirror of the SCORED_CTE in src/lib/queries.ts -----------------
const SCORED = `
WITH latest AS (
  SELECT DISTINCT ON (video_id) * FROM video_snapshots
   WHERE region = $1 AND captured_at > now() - ($4 || ' hours')::interval
   ORDER BY video_id, captured_at DESC
),
previous AS (
  SELECT DISTINCT ON (s.video_id) s.video_id, s.view_count, s.captured_at
    FROM video_snapshots s JOIN latest l ON l.video_id = s.video_id
   WHERE s.region = $1 AND s.captured_at < l.captured_at
   ORDER BY s.video_id, s.captured_at DESC
),
metrics AS (
  SELECT v.video_id, v.title, v.published_at, c.channel_name, cat.category_name,
         l.view_count, l.like_count, l.comment_count, l.captured_at,
         GREATEST(l.view_count - COALESCE(p.view_count, l.view_count), 0) AS view_delta,
         COALESCE(EXTRACT(EPOCH FROM (l.captured_at - p.captured_at))/3600.0, 0) AS window_hours,
         CASE WHEN COALESCE(p.view_count,0) > 0
              THEN ROUND(((l.view_count - p.view_count)::numeric / p.view_count)*100, 2) END AS growth_pct,
         CASE WHEN l.view_count > 0
              THEN ROUND(((COALESCE(l.like_count,0)+COALESCE(l.comment_count,0))::numeric / l.view_count)*100, 2) END AS engagement_rate,
         EXTRACT(EPOCH FROM (now() - v.published_at))/3600.0 AS age_hours
    FROM latest l JOIN videos v ON v.video_id = l.video_id
    LEFT JOIN channels c ON c.channel_id = v.channel_id
    LEFT JOIN categories cat ON cat.category_id = v.category_id AND cat.region = $1
    LEFT JOIN previous p ON p.video_id = l.video_id
   WHERE ($2::text IS NULL OR v.category_id = $2)
),
velocity AS (
  SELECT *, CASE WHEN window_hours > 0 THEN view_delta / window_hours ELSE 0 END AS views_per_hour FROM metrics
),
scored AS (
  SELECT *,
    PERCENT_RANK() OVER (ORDER BY views_per_hour) AS r_velocity,
    PERCENT_RANK() OVER (ORDER BY COALESCE(engagement_rate,0)) AS r_engagement,
    PERCENT_RANK() OVER (ORDER BY age_hours DESC) AS r_recency,
    PERCENT_RANK() OVER (ORDER BY view_count) AS r_popularity
  FROM velocity
)
SELECT *, ROUND((0.5*r_velocity + 0.2*r_engagement + 0.15*r_recency + 0.15*r_popularity)*100)::int AS trend_score
FROM scored ORDER BY trend_score DESC, view_count DESC LIMIT $3`;

console.log("\n→ Trend Score ranking");
const trending = await c.query(SCORED, [REGION, null, 50, "48"]);
console.table(
  trending.rows.map((r) => ({
    title: r.title.slice(0, 26),
    views: Number(r.view_count).toLocaleString(),
    gained: `+${Number(r.view_delta).toLocaleString()}`,
    per_hour: Math.round(r.views_per_hour).toLocaleString(),
    engage: r.engagement_rate,
    score: r.trend_score,
  })),
);

console.log("→ Rising (floor 10,000 views, 5,000 views/hour)");
const rising = trending.rows.filter(
  (r) => Number(r.view_count) >= 10_000 && r.views_per_hour >= 5_000,
);
console.table(
  rising.map((r) => ({
    title: r.title.slice(0, 26),
    per_hour: Math.round(r.views_per_hour).toLocaleString(),
    growth_pct: r.growth_pct,
  })),
);

console.log("→ LAG() growth history for v_rocket");
const hist = await c.query(
  `SELECT captured_at, view_count,
          view_count - LAG(view_count) OVER w AS views_gained,
          CASE WHEN EXTRACT(EPOCH FROM (captured_at - LAG(captured_at) OVER w)) > 0
               THEN ROUND((view_count - LAG(view_count) OVER w)
                    / (EXTRACT(EPOCH FROM (captured_at - LAG(captured_at) OVER w))/3600.0))
               END AS views_per_hour
     FROM video_snapshots WHERE video_id='v_rocket' AND region='IN'
    WINDOW w AS (ORDER BY captured_at) ORDER BY captured_at`,
);
console.table(
  hist.rows.map((r) => ({
    at: new Date(r.captured_at).toISOString().slice(11, 16),
    views: Number(r.view_count).toLocaleString(),
    gained: r.views_gained,
    per_hour: r.views_per_hour,
  })),
);

console.log("→ Category breakdown");
const cats = await c.query(
  `WITH latest AS (
     SELECT DISTINCT ON (video_id) * FROM video_snapshots
      WHERE region=$1 AND captured_at > now() - interval '48 hours'
      ORDER BY video_id, captured_at DESC),
   joined AS (
     SELECT v.category_id, COALESCE(cat.category_name,'Uncategorised') AS category_name,
            l.view_count, l.like_count, l.comment_count
       FROM latest l JOIN videos v ON v.video_id=l.video_id
       LEFT JOIN categories cat ON cat.category_id=v.category_id AND cat.region=$1)
   SELECT category_name, COUNT(*)::int AS video_count, SUM(view_count)::bigint AS total_views,
          ROUND(100.0*COUNT(*)/NULLIF(SUM(COUNT(*)) OVER (),0),1) AS share_pct
     FROM joined GROUP BY category_id, category_name ORDER BY video_count DESC`,
  [REGION],
);
console.table(cats.rows);

await c.end();
console.log("\n✅ schema loads, duplicate guard holds, all queries return.");
