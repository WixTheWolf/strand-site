import { NextRequest, NextResponse } from "next/server";
import { fetchGrintHandicap } from "@/lib/grint";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const handicap = await fetchGrintHandicap(userId);
    return NextResponse.json({ handicap });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Handicap fetch failed" },
      { status: 502 },
    );
  }
}