import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { seedStarterPlanets } from "@/lib/resources";
import {
  claimWorldOperation,
  listWorldOperations,
  startWorldOperation,
  type WorldOperationType,
} from "@/lib/world-operations";

const WORLD_OPERATION_TYPES = new Set<WorldOperationType>(["gather", "survey", "scout", "secure"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await seedStarterPlanets(session.user.id);
  const data = await listWorldOperations(session.user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const type = typeof body.type === "string" && WORLD_OPERATION_TYPES.has(body.type as WorldOperationType)
    ? (body.type as WorldOperationType)
    : null;
  const planetId = typeof body.planetId === "string" ? body.planetId : "";
  if (!type || !planetId) {
    return NextResponse.json({ error: "type and planetId required" }, { status: 400 });
  }

  await seedStarterPlanets(session.user.id);
  const result = await startWorldOperation({
    userId: session.user.id,
    type,
    planetId,
    cardInstanceId: typeof body.cardInstanceId === "string" ? body.cardInstanceId : undefined,
    cardDefId: typeof body.cardDefId === "string" ? body.cardDefId : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, assignment: result.assignment, rewards: result.rewards });
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

  const result = await claimWorldOperation(session.user.id, assignmentId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, rewards: result.rewards });
}
