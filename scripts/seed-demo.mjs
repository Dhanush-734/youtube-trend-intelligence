/**
 * Multi-region realistic demo data seeder.
 *
 * Populates realistic temporal snapshot history across all 5 supported regions:
 *   IN (India), US (United States), GB (United Kingdom), CA (Canada), AU (Australia)
 *
 * Each region receives:
 *   - Category mappings
 *   - Channels & Videos with realistic metadata
 *   - 4 consecutive snapshot batches spaced 15 minutes apart
 *   - Videos designed to trigger rule-based Rising detection (views >= 10k, rate >= 5k/hr)
 *   - Steady videos, viral breakouts, and high-engagement videos
 *   - Audit logs in collection_runs
 *
 * Run with:
 *   node --env-file=.env.local scripts/seed-demo.mjs
 */

import pg from "pg";
const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const isLocal =
  url.includes("localhost") ||
  url.includes("127.0.0.1") ||
  url.includes("sslmode=disable");

const client = new Client({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected to PostgreSQL for demo data seeding...");

const REGIONS = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

const CATEGORIES = [
  { id: "10", name: "Music" },
  { id: "20", name: "Gaming" },
  { id: "24", name: "Entertainment" },
  { id: "28", name: "Science & Technology" },
  { id: "17", name: "Sports" },
  { id: "25", name: "News & Politics" },
  { id: "22", name: "People & Blogs" },
  { id: "27", name: "Education" },
];

// Seed Categories for all regions
for (const reg of REGIONS) {
  for (const cat of CATEGORIES) {
    await client.query(
      `INSERT INTO categories (category_id, region, category_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (category_id, region) DO UPDATE SET category_name = EXCLUDED.category_name`,
      [cat.id, reg.code, cat.name],
    );
  }
}
console.log("✓ Categories seeded for all 5 regions.");

// Dataset of realistic videos per region
const REGION_VIDEOS = {
  IN: [
    {
      id: "in_vid_01",
      title: "ISRO Next-Gen Heavy Lift Launch Vehicle (NGLV) Official Mission Briefing",
      channelId: "ch_isro_official",
      channelName: "ISRO Official",
      categoryId: "28",
      duration: 742,
      publishedHoursAgo: 6,
      baseViews: 1_250_000,
      gainPerStep: 85_000, // Very fast rising (~340k/hr)
      likesRatio: 0.082,
      commentsRatio: 0.007,
      thumb: "https://images.unsplash.com/photo-1517976487502-861f654f15d7?w=640&q=80",
    },
    {
      id: "in_vid_02",
      title: "New Pan-India Action Blockbuster — Official Theatrical Trailer 4K",
      channelId: "ch_tseries_film",
      channelName: "T-Series Cinema",
      categoryId: "10",
      duration: 215,
      publishedHoursAgo: 14,
      baseViews: 4_800_000,
      gainPerStep: 120_000, // Massive reach and velocity
      likesRatio: 0.095,
      commentsRatio: 0.008,
      thumb: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=640&q=80",
    },
    {
      id: "in_vid_03",
      title: "India vs Australia T20 World Cup Thriller — Super Over Highlights",
      channelId: "ch_bcci_sports",
      channelName: "BCCI Highlights",
      categoryId: "17",
      duration: 890,
      publishedHoursAgo: 4,
      baseViews: 2_100_000,
      gainPerStep: 95_000, // Super fast rising
      likesRatio: 0.071,
      commentsRatio: 0.005,
      thumb: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=640&q=80",
    },
    {
      id: "in_vid_04",
      title: "Top 10 High-Growth Tech Skills to Master in 2026",
      channelId: "ch_code_with_harry",
      channelName: "Tech Forward India",
      categoryId: "27",
      duration: 1120,
      publishedHoursAgo: 22,
      baseViews: 380_000,
      gainPerStep: 18_000, // Steady rising (~72k/hr)
      likesRatio: 0.088,
      commentsRatio: 0.009,
      thumb: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=80",
    },
    {
      id: "in_vid_05",
      title: "Building an Autonomous Drone in 48 Hours — DIY Hardware Hack",
      channelId: "ch_hardware_hacks",
      channelName: "Makers Club India",
      categoryId: "28",
      duration: 980,
      publishedHoursAgo: 3,
      baseViews: 45_000,
      gainPerStep: 8_500, // Indie breakout clearing Rising threshold!
      likesRatio: 0.115,
      commentsRatio: 0.012,
      thumb: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=640&q=80",
    },
    {
      id: "in_vid_06",
      title: "Street Food Journey in Old Delhi — 24 Hours Non-Stop Eating",
      channelId: "ch_delhi_eats",
      channelName: "Flavours of Bharat",
      categoryId: "22",
      duration: 1450,
      publishedHoursAgo: 36,
      baseViews: 850_000,
      gainPerStep: 12_000,
      likesRatio: 0.062,
      commentsRatio: 0.004,
      thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80",
    },
    {
      id: "in_vid_07",
      title: "GTA VI Next-Gen Physics & Map Leaks Breakdown",
      channelId: "ch_beast_gaming",
      channelName: "Indian Gaming Hub",
      categoryId: "20",
      duration: 820,
      publishedHoursAgo: 10,
      baseViews: 920_000,
      gainPerStep: 34_000,
      likesRatio: 0.078,
      commentsRatio: 0.006,
      thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&q=80",
    },
    {
      id: "in_vid_08",
      title: "Classical Fusion Live Concert at Varanasi Ghats — Soulful Medley",
      channelId: "ch_ragas_fusion",
      channelName: "Sangeet Heritage",
      categoryId: "10",
      duration: 630,
      publishedHoursAgo: 48,
      baseViews: 1_650_000,
      gainPerStep: 9_000,
      likesRatio: 0.092,
      commentsRatio: 0.008,
      thumb: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&q=80",
    },
  ],
  US: [
    {
      id: "us_vid_01",
      title: "Starship Flight 7 Orbital Insertion & Booster Catch in 4K HDR",
      channelId: "ch_space_everyday",
      channelName: "Everyday Astronaut",
      categoryId: "28",
      duration: 1840,
      publishedHoursAgo: 5,
      baseViews: 3_400_000,
      gainPerStep: 140_000, // Velocity beast (~560k/hr)
      likesRatio: 0.091,
      commentsRatio: 0.009,
      thumb: "https://images.unsplash.com/photo-1517976487502-861f654f15d7?w=640&q=80",
    },
    {
      id: "us_vid_02",
      title: "I Survived 100 Days In A Virtual Reality Apocalypse Simulation",
      channelId: "ch_mr_challenge",
      channelName: "MegaBeast Studio",
      categoryId: "24",
      duration: 2120,
      publishedHoursAgo: 12,
      baseViews: 9_200_000,
      gainPerStep: 210_000,
      likesRatio: 0.084,
      commentsRatio: 0.007,
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&q=80",
    },
    {
      id: "us_vid_03",
      title: "New M4 Max Mac Studio In-Depth Teardown & Benchmarks",
      channelId: "ch_mkbhd",
      channelName: "Marques Brownlee",
      categoryId: "28",
      duration: 980,
      publishedHoursAgo: 8,
      baseViews: 1_850_000,
      gainPerStep: 65_000,
      likesRatio: 0.088,
      commentsRatio: 0.008,
      thumb: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&q=80",
    },
    {
      id: "us_vid_04",
      title: "NBA Finals Game 7 Wildest Moments & Game Winning Buzzer Beater",
      channelId: "ch_nba",
      channelName: "NBA Official",
      categoryId: "17",
      duration: 720,
      publishedHoursAgo: 3,
      baseViews: 2_400_000,
      gainPerStep: 110_000,
      likesRatio: 0.076,
      commentsRatio: 0.006,
      thumb: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=640&q=80",
    },
    {
      id: "us_vid_05",
      title: "Why Nuclear Microreactors Will Power Tomorrow's Cities",
      channelId: "ch_veritas",
      channelName: "Veritasium",
      categoryId: "27",
      duration: 1640,
      publishedHoursAgo: 20,
      baseViews: 1_450_000,
      gainPerStep: 42_000,
      likesRatio: 0.096,
      commentsRatio: 0.011,
      thumb: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=640&q=80",
    },
    {
      id: "us_vid_06",
      title: "Indie Studio Built An Unreal Engine 5 Masterpiece In Secret",
      channelId: "ch_indie_dev_spotlight",
      channelName: "Game Dev Underground",
      categoryId: "20",
      duration: 860,
      publishedHoursAgo: 2,
      baseViews: 32_000,
      gainPerStep: 6_200, // Indie Rising video
      likesRatio: 0.125,
      commentsRatio: 0.015,
      thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&q=80",
    },
  ],
  GB: [
    {
      id: "gb_vid_01",
      title: "Premier League Derby: 95th Minute Equalizer Drama",
      channelId: "ch_sky_sports",
      channelName: "Sky Sports Football",
      categoryId: "17",
      duration: 680,
      publishedHoursAgo: 4,
      baseViews: 1_750_000,
      gainPerStep: 75_000,
      likesRatio: 0.079,
      commentsRatio: 0.006,
      thumb: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&q=80",
    },
    {
      id: "gb_vid_02",
      title: "The Great British Bake Off — Spectacular Final Showstopper Review",
      channelId: "ch_channel4",
      channelName: "Channel 4 Entertainment",
      categoryId: "24",
      duration: 940,
      publishedHoursAgo: 16,
      baseViews: 980_000,
      gainPerStep: 28_000,
      likesRatio: 0.068,
      commentsRatio: 0.005,
      thumb: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=80",
    },
    {
      id: "gb_vid_03",
      title: "Fixing a 200-Year-Old Historic Clock Mechanism by Hand",
      channelId: "ch_craft_heritage",
      channelName: "British Restorations",
      categoryId: "28",
      duration: 1540,
      publishedHoursAgo: 2,
      baseViews: 28_000,
      gainPerStep: 5_800, // Rising
      likesRatio: 0.134,
      commentsRatio: 0.014,
      thumb: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=640&q=80",
    },
  ],
  CA: [
    {
      id: "ca_vid_01",
      title: "NHL Stanley Cup Playoffs: Triple Overtime Game 7 Winner",
      channelId: "ch_sportsnet_ca",
      channelName: "Sportsnet Canada",
      categoryId: "17",
      duration: 710,
      publishedHoursAgo: 5,
      baseViews: 890_000,
      gainPerStep: 45_000,
      likesRatio: 0.082,
      commentsRatio: 0.007,
      thumb: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=640&q=80",
    },
    {
      id: "ca_vid_02",
      title: "Exploring the Remote Rocky Mountains Off-Grid Cabin in Deep Winter",
      channelId: "ch_wild_canada",
      channelName: "Northern Wilderness",
      categoryId: "22",
      duration: 1820,
      publishedHoursAgo: 18,
      baseViews: 620_000,
      gainPerStep: 19_000,
      likesRatio: 0.091,
      commentsRatio: 0.008,
      thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&q=80",
    },
  ],
  AU: [
    {
      id: "au_vid_01",
      title: "Australia vs England The Ashes: 5 Wickets in 15 Balls Masterclass",
      channelId: "ch_cricket_aus",
      channelName: "Cricket Australia Official",
      categoryId: "17",
      duration: 840,
      publishedHoursAgo: 6,
      baseViews: 1_420_000,
      gainPerStep: 68_000,
      likesRatio: 0.085,
      commentsRatio: 0.008,
      thumb: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=640&q=80",
    },
    {
      id: "au_vid_02",
      title: "Surfing 50ft Monster Waves at Shipstern Bluff Tasmania",
      channelId: "ch_surf_downunder",
      channelName: "Aussie Surf Legends",
      categoryId: "17",
      duration: 1110,
      publishedHoursAgo: 2,
      baseViews: 55_000,
      gainPerStep: 7_500, // Rising
      likesRatio: 0.112,
      commentsRatio: 0.011,
      thumb: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=640&q=80",
    },
  ],
};

// We will insert 4 batches spaced 15 minutes apart:
// Batch 0: 45 mins ago
// Batch 1: 30 mins ago
// Batch 2: 15 mins ago
// Batch 3: Now
const NOW = Date.now();
const BATCH_TIMES = [
  new Date(NOW - 45 * 60 * 1000),
  new Date(NOW - 30 * 60 * 1000),
  new Date(NOW - 15 * 60 * 1000),
  new Date(NOW),
];

console.log("Seeding channels, videos, and 4 sequential snapshot batches...");

for (const reg of REGIONS) {
  const videos = REGION_VIDEOS[reg.code] || REGION_VIDEOS.IN;

  for (let bIndex = 0; bIndex < BATCH_TIMES.length; bIndex++) {
    const batchTime = BATCH_TIMES[bIndex];

    // Log collection run
    const runRes = await client.query(
      `INSERT INTO collection_runs (region, started_at, finished_at, videos_seen, quota_units, status)
       VALUES ($1, $2, $3, $4, 2, 'ok') RETURNING id`,
      [reg.code, batchTime, new Date(batchTime.getTime() + 1200), videos.length],
    );

    // Rank videos by current views
    const batchVideos = videos.map((v, vIndex) => {
      const views = v.baseViews + v.gainPerStep * bIndex;
      const likes = Math.round(views * v.likesRatio);
      const comments = Math.round(views * v.commentsRatio);
      return { ...v, views, likes, comments, originalIndex: vIndex };
    });

    batchVideos.sort((a, b) => b.views - a.views);

    for (let rank = 0; rank < batchVideos.length; rank++) {
      const item = batchVideos[rank];
      const publishedAt = new Date(batchTime.getTime() - item.publishedHoursAgo * 3600 * 1000);

      // Upsert Channel
      await client.query(
        `INSERT INTO channels (channel_id, channel_name, thumbnail_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (channel_id) DO UPDATE SET channel_name = EXCLUDED.channel_name`,
        [item.channelId, item.channelName, item.thumb],
      );

      // Upsert Video
      await client.query(
        `INSERT INTO videos (video_id, title, channel_id, category_id, published_at, duration_seconds, thumbnail_url, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (video_id) DO UPDATE
           SET title = EXCLUDED.title,
               thumbnail_url = EXCLUDED.thumbnail_url,
               last_seen_at = EXCLUDED.last_seen_at`,
        [
          item.id,
          item.title,
          item.channelId,
          item.categoryId,
          publishedAt,
          item.duration,
          item.thumb,
          batchTime,
        ],
      );

      // Insert Snapshot
      await client.query(
        `INSERT INTO video_snapshots (video_id, region, chart_rank, view_count, like_count, comment_count, captured_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (video_id, region, captured_at) DO NOTHING`,
        [item.id, reg.code, rank + 1, item.views, item.likes, item.comments, batchTime],
      );
    }
  }
  console.log(`✓ Seeded ${videos.length} videos across 4 batches for [${reg.code}] ${reg.name}`);
}

await client.end();
console.log("\n Seeding completed successfully! Multi-region historical data is ready.");
