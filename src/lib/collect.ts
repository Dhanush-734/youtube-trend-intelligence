import type { PoolClient } from "pg";
import { getPool, query } from "./db";
import { fetchCategories, fetchMostPopular, type TrendingVideo } from "./youtube";

export interface CollectionResult {
  region: string;
  videosSeen: number;
  quotaUnits: number;
  capturedAt: string;
}

/**
 * Every video in one run shares a single captured_at timestamp. That makes a
 * "batch" a first-class thing you can GROUP BY, and keeps growth windows clean.
 */
export async function collectRegion(region: string): Promise<CollectionResult> {
  const capturedAt = new Date();
  let quotaUnits = 0;

  const runRows = await query<{ id: number }>(
    `INSERT INTO collection_runs (region, started_at) VALUES ($1, $2) RETURNING id`,
    [region, capturedAt],
  );
  const runId = runRows[0].id;

  try {
    await ensureCategories(region);
    quotaUnits += 1; // videoCategories.list (only on a cache miss, counted once)

    const videos = await fetchMostPopular(region, 50);
    quotaUnits += 1; // videos.list

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      for (const v of videos) {
        await upsertChannel(client, v);
        await upsertVideo(client, v, capturedAt);
        await insertSnapshot(client, v, region, capturedAt);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    await query(
      `UPDATE collection_runs
          SET finished_at = now(), videos_seen = $2, quota_units = $3, status = 'ok'
        WHERE id = $1`,
      [runId, videos.length, quotaUnits],
    );

    return {
      region,
      videosSeen: videos.length,
      quotaUnits,
      capturedAt: capturedAt.toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await query(
      `UPDATE collection_runs
          SET finished_at = now(), status = 'error', error = $2
        WHERE id = $1`,
      [runId, message.slice(0, 1000)],
    );
    throw err;
  }
}

async function upsertChannel(client: PoolClient, v: TrendingVideo) {
  await client.query(
    `INSERT INTO channels (channel_id, channel_name)
     VALUES ($1, $2)
     ON CONFLICT (channel_id) DO UPDATE SET channel_name = EXCLUDED.channel_name`,
    [v.channelId, v.channelName],
  );
}

async function upsertVideo(client: PoolClient, v: TrendingVideo, capturedAt: Date) {
  // Titles do get edited. We keep only the current one — no title history needed.
  await client.query(
    `INSERT INTO videos
       (video_id, title, channel_id, category_id, published_at,
        duration_seconds, thumbnail_url, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (video_id) DO UPDATE
       SET title         = EXCLUDED.title,
           thumbnail_url = EXCLUDED.thumbnail_url,
           last_seen_at  = EXCLUDED.last_seen_at`,
    [
      v.videoId,
      v.title,
      v.channelId,
      v.categoryId,
      v.publishedAt,
      v.durationSeconds,
      v.thumbnailUrl,
      capturedAt,
    ],
  );
}

async function insertSnapshot(
  client: PoolClient,
  v: TrendingVideo,
  region: string,
  capturedAt: Date,
) {
  // DO NOTHING guards against a double-fired cron writing a duplicate batch.
  await client.query(
    `INSERT INTO video_snapshots
       (video_id, region, chart_rank, view_count, like_count, comment_count, captured_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (video_id, region, captured_at) DO NOTHING`,
    [
      v.videoId,
      region,
      v.chartRank,
      v.viewCount,
      v.likeCount,
      v.commentCount,
      capturedAt,
    ],
  );
}

/** Categories change about once a decade, so only fetch them if we have none. */
async function ensureCategories(region: string) {
  const existing = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM categories WHERE region = $1`,
    [region],
  );
  if (existing[0].count > 0) return;

  const cats = await fetchCategories(region);
  for (const c of cats) {
    await query(
      `INSERT INTO categories (category_id, region, category_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (category_id, region) DO UPDATE
         SET category_name = EXCLUDED.category_name`,
      [c.id, region, c.name],
    );
  }
}
