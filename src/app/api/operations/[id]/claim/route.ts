import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { claimOperation, progressOperation } from "@/lib/progression";

// POST /api/operations/[id]/claim — claim a completed operation's rewards
// body: { action: "claim" | "join" }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.action === "join") {
    // joining just creates a progress row (progress is also auto-created on trigger)
    await progressOperation(session.user.id, "rescue", 0);
    return NextResponse.json({ ok: true });
  }
  const ok = await claimOperation(session.user.id, id);
  if (!ok) return NextResponse.json({ error: "cannot claim" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
