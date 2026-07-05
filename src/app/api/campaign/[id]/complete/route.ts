import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { grantCard, grantShards, grantSeasonXp, progressQuests } from "@/lib/progression";

// POST /api/campaign/[id]/complete — mark chapter complete + grant rewards
// Called by the client after a campaign match victory.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "not found" }, { status: 404 });

  // check existing progress (idempotent — don't double-grant)
  const existing = await db.campaignProgress.findUnique({
    where: { userId_campaignId: { userId: session.user.id, campaignId: id } },
  });
  if (existing?.completed) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  // mark complete
  if (existing) {
    await db.campaignProgress.update({
      where: { id: existing.id },
      data: { completed: true, completedAt: new Date() },
    });
  } else {
    await db.campaignProgress.create({
      data: { userId: session.user.id, campaignId: id, completed: true, completedAt: new Date() },
    });
  }

  // grant rewards
  const rewardIds: string[] = JSON.parse(campaign.rewardCardDefIds);
  const grantedCards: { defId: string; isNew: boolean }[] = [];
  for (const defId of rewardIds) {
    const r = await grantCard(session.user.id, defId, "campaign");
    grantedCards.push({ defId, isNew: r.isNew });
  }
  if (campaign.rewardShards > 0) await grantShards(session.user.id, campaign.rewardShards);
  await grantSeasonXp(session.user.id, 60);

  // progress any "campaign" type quests
  await progressQuests(session.user.id, { type: "campaign" });

  return NextResponse.json({
    ok: true,
    rewards: {
      cards: grantedCards,
      shards: campaign.rewardShards,
      seasonXp: 60,
      outro: campaign.outro,
    },
  });
}
