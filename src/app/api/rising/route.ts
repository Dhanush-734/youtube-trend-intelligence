import { NextRequest, NextResponse } from "next/server";
import { getRising, RISING_MIN_VELOCITY, RISING_MIN_VIEWS } from "@/lib/queries";
import { isRegion } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const region = p.get("region") ?? "IN";
  if (!isRegion(region)) {
    return NextResponse.json({ error: "Unsupported region" }, { status: 400 });
  }
  const queryText = p.get("q");

  try {
    const videos = await getRising(region, 30, 48, queryText);
    return NextResponse.json({
      region,
      thresholds: { minViews: RISING_MIN_VIEWS, minViewsPerHour: RISING_MIN_VELOCITY },
      count: videos.length,
      filter: { q: queryText },
      videos,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
