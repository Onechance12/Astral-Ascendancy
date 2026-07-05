import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildOrUpgradeStructure } from "@/lib/resources";

// POST /api/domain/upgrade { planetId } — build or upgrade a structure on a planet
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { planetId } = body as { planetId?: string };
  if (!planetId) {
    return NextResponse.json({ error: "missing planetId" }, { status: 400 });
  }
  const result = await buildOrUpgradeStructure(session.user.id, planetId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, newLevel: result.newLevel });
}
