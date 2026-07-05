import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";

// GET /api/operations — all active operations + the user's progress
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const ops = await db.operation.findMany({
    where: { active: true, endsAt: { gt: now } },
    orderBy: { endsAt: "asc" },
  });
  const progress = await db.operationProgress.findMany({
    where: { userId: session.user.id },
  });
  const pmap = new Map(progress.map((p) => [p.operationId, p]));
  return NextResponse.json({
    operations: ops.map((op) => {
      const p = pmap.get(op.id);
      const rewardIds: string[] = JSON.parse(op.rewardCardDefIds);
      return {
        id: op.id,
        type: op.type,
        name: op.name,
        lore: op.lore,
        target: op.target,
        factionId: op.factionId,
        rewardShards: op.rewardShards,
        rewardCommanderTitle: op.rewardCommanderTitle,
        endsAt: op.endsAt,
        progress: p?.progress || 0,
        completed: p?.completed || false,
        claimed: p?.claimed || false,
        rewardCards: rewardIds.map((defId) => {
          const def = CARD_DEFS.find((d) => d.defId === defId);
          return def
            ? { defId, name: def.name, rarity: def.rarity, faction: def.faction, art: def.art }
            : { defId, name: defId, rarity: "Common", faction: "unknown" };
        }),
      };
    }),
  });
}
