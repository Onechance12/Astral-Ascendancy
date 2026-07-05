import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assignCrewToPlanet, unassignCrew } from "@/lib/world-cards";

// POST /api/domain/assign-crew { planetId, crewCardDefId? } — assign or unassign crew
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { planetId, crewCardDefId } = body as { planetId?: string; crewCardDefId?: string };
  if (!planetId) {
    return NextResponse.json({ error: "missing planetId" }, { status: 400 });
  }
  // if no crewCardDefId, unassign
  if (!crewCardDefId) {
    await unassignCrew(session.user.id, planetId);
    return NextResponse.json({ ok: true, unassigned: true });
  }
  const result = await assignCrewToPlanet(session.user.id, planetId, crewCardDefId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
