import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  claimCareAssignment,
  listRecoveryTrainingState,
  startRecovery,
  startTraining,
} from "@/lib/recovery-training";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const state = await listRecoveryTrainingState(session.user.id);
  if (!state) return NextResponse.json({ error: "care systems unavailable" }, { status: 404 });
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const cardInstanceId = typeof body.cardInstanceId === "string" ? body.cardInstanceId : "";
  if (!cardInstanceId || !["recover", "train"].includes(action)) {
    return NextResponse.json({ error: "valid action and cardInstanceId required" }, { status: 400 });
  }

  const result = action === "recover"
    ? await startRecovery({ userId: session.user.id, cardInstanceId })
    : await startTraining({ userId: session.user.id, cardInstanceId });

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

  const result = await claimCareAssignment(session.user.id, assignmentId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, rewards: result.rewards });
}
