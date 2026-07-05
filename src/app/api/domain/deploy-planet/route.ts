import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deployPlanetCard } from "@/lib/world-cards";

// POST /api/domain/deploy-planet { defId, name? } — deploy a planet card to claim a new planet
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { defId, name } = body as { defId?: string; name?: string };
  if (!defId) {
    return NextResponse.json({ error: "missing defId" }, { status: 400 });
  }
  const result = await deployPlanetCard(session.user.id, defId, name);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, planetId: result.planetId });
}
