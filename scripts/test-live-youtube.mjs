import { fetchMostPopular, fetchCategories } from "../src/lib/youtube.ts";

async function main() {
  console.log("--> Testing live YouTube Data API key with fetchMostPopular('IN', 5)...");
  try {
    const videos = await fetchMostPopular("IN", 5);
    console.log(`✓ SUCCESS! Fetched ${videos.length} live trending videos from YouTube!`);
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      console.log(`  #${i + 1}: ${v.title} | ${v.channelName} | ${v.viewCount.toLocaleString()} views`);
    }

    console.log("\n--> Testing fetchCategories('IN')...");
    const cats = await fetchCategories("IN");
    console.log(`✓ SUCCESS! Fetched ${cats.length} categories.`);
  } catch (err) {
    console.error("API call error:", err);
    process.exit(1);
  }
}

main();
