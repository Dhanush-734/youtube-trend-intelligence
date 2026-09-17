# 📈 YouTube Trend Intelligence & Analytics Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![YouTube Data API](https://img.shields.io/badge/YouTube%20API-v3-red?style=flat-square&logo=youtube)](https://developers.google.com/youtube/v3)
[![Author](https://img.shields.io/badge/Author-Dhanush%20S-orange?style=flat-square&logo=github)](https://github.com/Dhanush-734)

A production-grade, near-real-time YouTube video analytics and trend intelligence platform developed as an MCA Final Year Capstone Project. It systematically ingests YouTube trending charts across multiple international markets (India, United States, United Kingdom, Canada, Australia), stores every observation into append-only PostgreSQL snapshots, and computes true observed growth rates, view velocity (views/hour), engagement ratios, and a mathematically sound percentile-weighted **Custom Trend Score**.

> 📄 **Academic Project Synopsis:** [Download MCA Project Synopsis PDF](./YouTube_Trend_Intelligence_MCA_Synopsis.pdf)

---

## 👨‍💻 Developer & Project Attribution
- **Developer:** Dhanush S
- **GitHub:** [@Dhanush-734](https://github.com/Dhanush-734)
- **Repository:** [https://github.com/Dhanush-734/youtube-trend-intelligence](https://github.com/Dhanush-734/youtube-trend-intelligence)
- **Course:** Master of Computer Applications (MCA) Final Year Project

---

## Setup

### 1. Get a YouTube API key

Google Cloud Console → create a project → **APIs & Services → Library** → enable
**YouTube Data API v3** → **Credentials → Create credentials → API key**.

### 2. Create a database

Any Postgres works. Supabase and Neon both have free tiers. Copy the connection
string.

### 3. Configure

```bash
cp .env.example .env.local
```

Fill in `YOUTUBE_API_KEY`, `DATABASE_URL`, and set `COLLECT_SECRET` to any random
string.

### 4. Create the tables

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

### 5. Run

```bash
npm install
npm run dev
```

### 6. Collect the first snapshot

The dashboard is empty until the collector runs. In a second terminal:

```bash
curl -X POST -H "Authorization: Bearer YOUR_COLLECT_SECRET" \
  http://localhost:3000/api/collect
```

Run it **twice, a few minutes apart**. Growth is the difference between two
snapshots, so a single run produces a dashboard with no growth figures — that is
expected, not a bug.

---

## Start collecting early

Every chart in this project is powered by accumulated history. On day one the
Rising page is empty and every graph is a single dot. Get the collector running
as soon as the schema exists, even while the UI is half-built. A month of
history makes the demo; a day of history makes it look broken.

### Scheduling every 15 minutes

Vercel's free plan only permits **one cron run per day**, which is useless here.
`.github/workflows/collect.yml` solves it: a GitHub Actions schedule pings
`/api/collect` every 15 minutes for free.

After deploying, add two repository secrets under
**Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `APP_URL` | `https://your-app.vercel.app` |
| `COLLECT_SECRET` | the same string as in Vercel's env vars |

GitHub's scheduler is best-effort and can run late under load. That is fine —
every growth calculation divides by the *actual* elapsed time between snapshots,
so an irregular gap does not distort the numbers.

---

## Quota

The default allowance is 10,000 units per day.

| Call | Cost | Used here |
| --- | --- | --- |
| `videos.list` (chart=mostPopular) | **1** | once per region per run |
| `videoCategories.list` | **1** | once per region, ever (cached in Postgres) |
| `search.list` | **100** | deliberately never called |

Five regions every 15 minutes is 5 × 96 = **480 units/day**, about 5% of the
allowance. There is plenty of headroom, but avoid `search.list` — one careless
search feature refreshing on a timer will drain the whole quota before lunch.

`/api/collect` requires the `COLLECT_SECRET` bearer token precisely so nobody
can burn your quota by hitting a public URL in a loop.

---

## How the Trend Score works

Four inputs, each converted to a **percentile rank** (0–1) across the videos
currently on the chart, then weighted:

| Component | Weight | Measured as |
| --- | --- | --- |
| View velocity | 50% | views gained ÷ hours elapsed |
| Engagement | 20% | (likes + comments) ÷ views × 100 |
| Recency | 15% | hours since publication, inverted |
| Popularity | 15% | absolute view count |

**Why percentile rank and not the raw numbers?** Raw view growth is in the
hundreds of thousands; engagement rate is a number near 5; recency is in hours.
Multiplying those raw values by weights would make view growth roughly 100% of
the score no matter what the weights said. `PERCENT_RANK()` puts every component
on the same 0–1 footing and is immune to a single viral outlier.

The weights are a judgement call, not a law. They live in one place —
`WEIGHTS` in `src/lib/queries.ts` — so you can defend them, and change them.

---

## Rising detection

Rule-based, no machine learning:

```
view_count      >= 10,000   (RISING_MIN_VIEWS)
views_per_hour  >=  5,000   (RISING_MIN_VELOCITY)
```

The view floor matters. Without it, a video going from 12 views to 400 tops the
list at +3,233% growth and the feature looks broken. Both thresholds are
constants in `src/lib/queries.ts` — tune them to your data. If nearly everything
qualifies, raise `RISING_MIN_VELOCITY`.

---

## Architecture

```
YouTube Data API v3
        │  videos.list (1 unit)
        ▼
POST /api/collect ──────► collectRegion()
        │                 upsert channel → upsert video → INSERT snapshot
        ▼
   PostgreSQL
   videos (unchanging facts) + video_snapshots (append-only)
        │
        ▼
   src/lib/queries.ts
   PERCENT_RANK + LAG window functions → growth, engagement, score
        │
        ├──► Next.js API routes (REST/JSON)
        └──► Server components ──► Recharts dashboard
```

Pages call the query layer directly rather than fetching their own API routes
over HTTP. Self-fetching from a server component adds a network hop and needs an
absolute URL, which breaks between local and deployed environments. The REST
routes exist and work — they are the documented JSON interface, and useful to
demonstrate — but the UI shares the same functions underneath.

### Database design notes

- **`video_snapshots` is append-only.** Never `UPDATE` a row. The temptation is
  to keep a `current_views` column on `videos` and overwrite it; that throws away
  the entire value of the project.
- **`region` is part of the snapshot key.** The same video trends in India and
  the UK simultaneously. Keying on `video_id` alone silently destroys any
  country comparison.
- **`UNIQUE (video_id, region, captured_at)` with `ON CONFLICT DO NOTHING`.**
  Schedulers double-fire eventually. Without this you get two snapshots seconds
  apart and a phantom +0 growth row polluting the charts.
- **Every video in one run shares one `captured_at`.** That makes a collection
  batch something you can `GROUP BY`.
- **Likes and comments are nullable.** A missing statistic means the creator
  hid it, which is different from zero. Dislikes are gone from the API entirely —
  don't design a UI slot for them.

---

## API reference

| Route | Purpose |
| --- | --- |
| `POST /api/collect` | Collect all regions. Requires bearer token. `?region=IN` for one. |
| `GET /api/trending?region=IN&category=10&limit=50` | Scored trending list |
| `GET /api/rising?region=IN` | Videos clearing the growth thresholds |
| `GET /api/analytics?region=IN` | Summary, categories, channels, timeline |
| `GET /api/video/{id}?region=IN` | One video plus its full snapshot history |

## Pages

`/` dashboard · `/trending` full scored list with category filter ·
`/rising` fastest growth · `/analytics` charts and score explanation ·
`/channels` · `/categories` · `/video/[id]` detail with history

---

## Verifying the SQL

`scripts/verify.mjs` loads the schema into a scratch database, seeds two
collection batches, and runs every analytics query so you can see the numbers
come out right.

```bash
DATABASE_URL="postgres://..." node scripts/verify.mjs
```

It also proves the duplicate-snapshot guard holds. **Point it at a throwaway
database — it drops and recreates the tables.**

---

## Troubleshooting

**Dashboard shows an empty state.** The collector has not run. See step 6.

**Growth is empty but videos appear.** Only one snapshot exists. Growth needs
two. Run the collector again.

**`403 quotaExceeded`.** You have used the day's 10,000 units. It resets at
midnight Pacific Time. Check `SELECT * FROM collection_runs ORDER BY id DESC` to
see what has been consuming it.

**A video's chart stops partway.** It dropped off the trending list, so no
further snapshots exist. The detail page detects this and says so rather than
drawing a flat line to nowhere.

**Build fails on Vercel with a database error.** The pool is created lazily for
exactly this reason, so make sure you have not moved the connection to module
scope.

---

## A demo safety net

Before a presentation, take a dump of your database:

```bash
pg_dump "$DATABASE_URL" > demo-backup.sql
```

If the API rate-limits you or the venue wifi dies mid-demo, a local Postgres
loaded from that dump keeps everything on screen working. The dashboard reads
only from the database — it never calls YouTube at page-render time.
