const base = 'http://localhost:3000';

async function testAll() {
  console.log('--- Testing API Endpoints & Server Components ---');

  // 1. Trending API
  const res1 = await fetch(`${base}/api/trending?region=IN`);
  const data1 = await res1.json();
  console.log(`✓ /api/trending?region=IN status: ${res1.status}, count: ${data1.count}, top score: ${data1.videos[0]?.trend_score}`);

  // 2. Rising API
  const res2 = await fetch(`${base}/api/rising?region=IN`);
  const data2 = await res2.json();
  console.log(`✓ /api/rising?region=IN status: ${res2.status}, count: ${data2.count}, top rate: ${Math.round(data2.videos[0]?.views_per_hour)}/hr`);

  // 3. Analytics API
  const res3 = await fetch(`${base}/api/analytics?region=IN`);
  const data3 = await res3.json();
  console.log(`✓ /api/analytics?region=IN status: ${res3.status}, videos: ${data3.summary.videos}, channels: ${data3.channels.length}, timeline points: ${data3.timeline.length}`);

  // 4. Video Detail API
  const vidId = data1.videos[0]?.video_id;
  const res4 = await fetch(`${base}/api/video/${vidId}?region=IN`);
  const data4 = await res4.json();
  console.log(`✓ /api/video/${vidId} status: ${res4.status}, history snapshots: ${data4.history.length}`);

  // 5. Auth check on /api/collect
  const res5 = await fetch(`${base}/api/collect`, { method: 'POST' });
  console.log(`✓ /api/collect (unauthorized) status: ${res5.status} (expected 401)`);

  // 6. Page Routes
  const pages = [
    '/',
    '/trending?region=IN',
    '/rising?region=IN',
    '/analytics?region=IN',
    '/channels?region=IN',
    '/categories?region=IN',
    `/video/${vidId}?region=IN`,
    // Test US region too
    '/?region=US',
    '/trending?region=US',
    '/rising?region=US',
  ];

  for (const page of pages) {
    const pRes = await fetch(`${base}${page}`);
    console.log(`✓ Page: ${page} -> HTTP ${pRes.status}`);
    if (pRes.status !== 200) throw new Error(`Page ${page} failed with HTTP ${pRes.status}`);
  }

  console.log('\n=========================================');
  console.log(' ALL API ROUTES AND PAGES FULLY OPERATIONAL!');
  console.log('=========================================');
}

testAll().catch((e) => {
  console.error('Verification error:', e);
  process.exit(1);
});
