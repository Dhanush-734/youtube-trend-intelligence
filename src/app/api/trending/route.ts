import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/queries";
import { isRegion } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const region = p.get("region") ?? "IN";
  if (!isRegion(region)) {
    return NextResponse.json({ error: "Unsupported region" }, { status: 400 });
  }
  const limit = Math.min(Number(p.get("limit") ?? 50), 100);
  const category = p.get("category");
  const queryText = p.get("q");
  const sortParam = p.get("sort");
  const sort =
    sortParam === "views" ||
    sortParam === "velocity" ||
    sortParam === "engagement" ||
    sortParam === "growth"
      ? sortParam
      : "score";

  try {
    const videos = await getTrending(region, category, limit, 48, sort, queryText);
    return NextResponse.json({
      region,
      count: videos.length,
      sort,
      filter: { category, q: queryText },
      videos,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
