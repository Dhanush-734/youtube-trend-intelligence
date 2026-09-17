-- YouTube Trend Intelligence — schema
-- Run once:  psql "$DATABASE_URL" -f db/schema.sql

-- ---------------------------------------------------------------
-- channels: one row per channel we have ever seen trending
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS channels (
  channel_id    TEXT PRIMARY KEY,
  channel_name  TEXT NOT NULL,
  thumbnail_url TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- categories: category names differ per region, so region is part
-- of the key. Refreshed rarely (they almost never change).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  category_id   TEXT NOT NULL,
  region        TEXT NOT NULL,
  category_name TEXT NOT NULL,
  PRIMARY KEY (category_id, region)
);

-- ---------------------------------------------------------------
-- videos: only facts that DO NOT change over time.
-- No view_count here on purpose — that lives in snapshots.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  video_id         TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  channel_id       TEXT REFERENCES channels(channel_id),
  category_id      TEXT,
  published_at     TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  thumbnail_url    TEXT,
  first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS videos_channel_idx  ON videos (channel_id);
CREATE INDEX IF NOT EXISTS videos_category_idx ON videos (category_id);

-- ---------------------------------------------------------------
-- video_snapshots: APPEND ONLY. This table is the whole project.
-- Never UPDATE a row here. region is part of the unique key because
-- the same video trends in several countries at once.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  video_id      TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
  region        TEXT NOT NULL,
  chart_rank    INTEGER,                 -- position in YouTube's mostPopular list
  view_count    BIGINT NOT NULL,
  like_count    BIGINT,                  -- NULL when the creator hides likes
  comment_count BIGINT,                  -- NULL when comments are disabled
  captured_at   TIMESTAMPTZ NOT NULL,
  CONSTRAINT video_snapshots_unique UNIQUE (video_id, region, captured_at)
);

CREATE INDEX IF NOT EXISTS snapshots_region_time_idx ON video_snapshots (region, captured_at DESC);
CREATE INDEX IF NOT EXISTS snapshots_video_time_idx  ON video_snapshots (video_id, captured_at DESC);

-- ---------------------------------------------------------------
-- collection_runs: audit log. Lets you prove in the viva that the
-- collector ran every 15 minutes, and debug quota problems.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_runs (
  id          BIGSERIAL PRIMARY KEY,
  region      TEXT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  videos_seen INTEGER DEFAULT 0,
  quota_units INTEGER DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'running',  -- running | ok | error
  error       TEXT
);
