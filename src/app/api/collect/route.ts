import { NextRequest, NextResponse } from "next/server";
import { collectRegion } from "@/lib/collect";
import { REGIONS, isRegion } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/collect?region=IN        → collect one region
 * POST /api/collect                  → collect every region
 *
 * Protected by COLLECT_SECRET so nobody can burn your quota by
 * hammering the URL. Send it as: Authorization: Bearer <secret>
 */
export async function POST(req: NextRequest) {
  const secret = process.env.COLLECT_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const requested = req.nextUrl.searchParams.get("region");
  const regions = requested
    ? isRegion(requested)
      ? [requested]
      : null
    : REGIONS.map((r) => r.code);

  if (!regions) {
    return NextResponse.json({ error: `Unknown region: ${requested}` }, { status: 400 });
  }

  const results = [];
  const failures = [];

  for (const region of regions) {
    try {
      results.push(await collectRegion(region));
    } catch (err) {
      failures.push({
        region,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json(
    {
      collected: results,
      failed: failures,
      quotaUsed: results.reduce((sum, r) => sum + r.quotaUnits, 0),
    },
    { status: failures.length && !results.length ? 502 : 200 },
  );
}

// GET is allowed too, so you can trigger a run from the browser while developing.
export const GET = POST;
