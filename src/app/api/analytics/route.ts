import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryStats,
  getChannelStats,
  getRegionTimeline,
  getSummary,
} from "@/lib/queries";
import { isRegion } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region") ?? "IN";
  if (!isRegion(region)) {
    return NextResponse.json({ error: "Unsupported region" }, { status: 400 });
  }

  try {
    const [summary, categories, channels, timeline] = await Promise.all([
      getSummary(region),
      getCategoryStats(region),
      getChannelStats(region),
      getRegionTimeline(region),
    ]);
    return NextResponse.json({ region, summary, categories, channels, timeline });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
