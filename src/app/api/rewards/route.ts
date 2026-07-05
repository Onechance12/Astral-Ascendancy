import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDailyLoginReward, getRewardCenter } from "@/lib/rewards";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rewardCenter = await getRewardCenter(session.user.id);
  return NextResponse.json({ rewardCenter });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.action !== "claim_daily") {
    return NextResponse.json({ error: "valid reward action required" }, { status: 400 });
  }

  const reward = await createDailyLoginReward(session.user.id);
  if (!reward) {
    return NextResponse.json({ error: "daily signal already claimed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reward });
}
