import { NextRequest, NextResponse } from "next/server";
import { getVideoDetail, getVideoHistory } from "@/lib/queries";
import { isRegion } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const region = req.nextUrl.searchParams.get("region") ?? "IN";
  if (!isRegion(region)) {
    return NextResponse.json({ error: "Unsupported region" }, { status: 400 });
  }

  try {
    const [video, history] = await Promise.all([
      getVideoDetail(params.id, region),
      getVideoHistory(params.id, region),
    ]);
    if (!video) {
      return NextResponse.json({ error: "Video not tracked yet" }, { status: 404 });
    }
    return NextResponse.json({ video, history });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
