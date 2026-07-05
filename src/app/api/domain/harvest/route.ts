import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { harvestResources } from "@/lib/resources";

// POST /api/domain/harvest — collect all accumulated passive resources
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await harvestResources(session.user.id);
  return NextResponse.json({
    ok: true,
    gained: result.gained,
    totals: result.totals,
  });
}
