import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";

// GET /api/campaign — all campaign chapters + the user's progress
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const chapters = await db.campaign.findMany({
    orderBy: [{ factionId: "asc" }, { chapter: "asc" }],
  });
  const progress = await db.campaignProgress.findMany({
    where: { userId: session.user.id },
  });
  const progressMap = new Map(progress.map((p) => [p.campaignId, p.completed]));
  return NextResponse.json({
    chapters: chapters.map((c) => ({
      id: c.id,
      factionId: c.factionId,
      chapter: c.chapter,
      title: c.title,
      intro: c.intro,
      outro: c.outro,
      enemyName: c.enemyName,
      enemyFactionId: c.enemyFactionId,
      enemyDeckIds: JSON.parse(c.enemyDeckIds),
      enemyHp: c.enemyHp,
      rewardCardDefIds: JSON.parse(c.rewardCardDefIds),
      rewardShards: c.rewardShards,
      completed: progressMap.get(c.id) || false,
      // reward card meta for display
      rewardCards: (JSON.parse(c.rewardCardDefIds) as string[]).map((defId) => {
        const def = CARD_DEFS.find((d) => d.defId === defId);
        return def
          ? { defId, name: def.name, rarity: def.rarity, faction: def.faction, art: def.art }
          : { defId, name: defId, rarity: "Common", faction: "unknown" };
      }),
    })),
  });
}
