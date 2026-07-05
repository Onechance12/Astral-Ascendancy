import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ASSIGNMENT_DEFS, claimAssignment, createAssignment, listAssignments } from "@/lib/beta-progression";
import { seedStarterPlanets } from "@/lib/resources";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const assignments = await listAssignments(session.user.id);
  return NextResponse.json({
    definitions: ASSIGNMENT_DEFS,
    assignments: assignments.map((assignment) => ({
      id: assignment.id,
      type: assignment.type,
      title: assignment.title,
      status: assignment.status,
      assetType: assignment.assetType,
      cardDefId: assignment.cardDefId,
      deckId: assignment.deckId,
      planetId: assignment.planetId,
      description: assignment.description,
      rewards: JSON.parse(assignment.rewardsJson || "{}"),
      startedAt: assignment.startedAt,
      completesAt: assignment.completesAt,
      claimedAt: assignment.claimedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const type = body.type === "resource" || body.type === "study" || body.type === "rescue" ? body.type : null;
  if (!type) {
    return NextResponse.json({ error: "valid assignment type required" }, { status: 400 });
  }

  if (type === "resource" || type === "study") {
    await seedStarterPlanets(session.user.id);
  }

  const result = await createAssignment({
    userId: session.user.id,
    type,
    cardDefId: typeof body.cardDefId === "string" ? body.cardDefId : undefined,
    deckId: typeof body.deckId === "string" ? body.deckId : undefined,
    planetId: typeof body.planetId === "string" ? body.planetId : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, assignment: result.assignment });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const assignmentId = typeof body.assignmentId === "string" ? body.assignmentId : "";
  if (!assignmentId || body.action !== "claim") {
    return NextResponse.json({ error: "assignmentId and claim action required" }, { status: 400 });
  }

  const result = await claimAssignment(session.user.id, assignmentId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, rewards: result.rewards });
}
