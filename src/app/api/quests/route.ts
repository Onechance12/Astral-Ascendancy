import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDailyQuests } from "@/lib/progression";

// GET /api/quests — active quests for the user (dailies + weeklies + story)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // ensure 3 dailies are assigned
  await ensureDailyQuests(session.user.id);

  const userQuests = await db.userQuest.findMany({
    where: { userId: session.user.id, claimed: false },
    include: { quest: true },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json({
    quests: userQuests.map((uq) => ({
      id: uq.id,
      kind: uq.quest.kind,
      type: uq.quest.type,
      title: uq.quest.title,
      description: uq.quest.description,
      target: uq.quest.target,
      progress: uq.progress,
      completed: uq.completed,
      claimed: uq.claimed,
      rewardShards: uq.quest.rewardShards,
      rewardCardDefId: uq.quest.rewardCardDefId,
      expiresAt: uq.expiresAt,
    })),
  });
}
