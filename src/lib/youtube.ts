/**
 * YouTube Data API v3 client.
 *
 * Quota cost per call (default daily allowance is 10,000 units):
 *   videos.list          →   1 unit, no matter how many videos come back
 *   videoCategories.list →   1 unit
 *   search.list          → 100 units  ← deliberately NOT used anywhere
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";

export const REGIONS = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
] as const;

export type RegionCode = (typeof REGIONS)[number]["code"];

export function isRegion(value: string | undefined): value is RegionCode {
  return !!value && REGIONS.some((r) => r.code === value);
}

export interface TrendingVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  categoryId: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  chartRank: number;
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    categoryId: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string } | undefined>;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: { duration: string };
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set. Add it to .env.local");
  return key;
}

async function call<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey());

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text();
    // 403 with reason quotaExceeded is the one you will actually hit
    throw new Error(`YouTube API ${res.status} on ${path}: ${body.slice(0, 400)}`);
  }
  return res.json() as Promise<T>;
}

/** ISO-8601 duration (PT4M13S) → seconds. */
export function parseDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  const [, d, h, min, s] = m;
  return (
    Number(d ?? 0) * 86400 +
    Number(h ?? 0) * 3600 +
    Number(min ?? 0) * 60 +
    Number(s ?? 0)
  );
}

function pickThumbnail(thumbs: YouTubeVideoItem["snippet"]["thumbnails"]): string {
  return (
    thumbs.maxres?.url ??
    thumbs.standard?.url ??
    thumbs.high?.url ??
    thumbs.medium?.url ??
    thumbs.default?.url ??
    ""
  );
}

/**
 * The single most popular chart for a region. 1 quota unit.
 * maxResults is capped at 50 by the API.
 */
export async function fetchMostPopular(
  region: string,
  maxResults = 50,
): Promise<TrendingVideo[]> {
  const data = await call<{ items: YouTubeVideoItem[] }>("videos", {
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    regionCode: region,
    maxResults: String(Math.min(maxResults, 50)),
  });

  return (data.items ?? []).map((item, index) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelName: item.snippet.channelTitle,
    categoryId: item.snippet.categoryId,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
    durationSeconds: parseDuration(item.contentDetails?.duration ?? "PT0S"),
    // A missing statistic means "hidden", which is different from zero.
    viewCount: Number(item.statistics?.viewCount ?? 0),
    likeCount:
      item.statistics?.likeCount === undefined
        ? null
        : Number(item.statistics.likeCount),
    commentCount:
      item.statistics?.commentCount === undefined
        ? null
        : Number(item.statistics.commentCount),
    chartRank: index + 1,
  }));
}

/** Category id → name for one region. 1 quota unit. Cached in Postgres. */
export async function fetchCategories(
  region: string,
): Promise<{ id: string; name: string }[]> {
  const data = await call<{ items: { id: string; snippet: { title: string } }[] }>(
    "videoCategories",
    { part: "snippet", regionCode: region },
  );
  return (data.items ?? []).map((i) => ({ id: i.id, name: i.snippet.title }));
}
