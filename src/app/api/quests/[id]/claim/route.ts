import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { claimQuest } from "@/lib/progression";

// POST /api/quests/[id]/claim — claim rewards for a completed quest
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await claimQuest(session.user.id, id);
  if (!ok) return NextResponse.json({ error: "cannot claim" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
