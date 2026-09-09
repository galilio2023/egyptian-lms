import { NextResponse } from "next/server";
import { getLandingData } from "@/server/services/public-curriculum.service";

export async function GET() {
  const result = await getLandingData();
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
