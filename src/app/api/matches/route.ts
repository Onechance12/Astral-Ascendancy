import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/matches — recent match history for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const matches = await db.matchRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { playedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ matches });
}

// POST /api/matches — record a finished match
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    commanderName,
    factionId,
    enemyName,
    enemyFactionId,
    result,
    turns,
    playerHpLeft,
    enemyHpLeft,
    mode = "conquest",
    difficulty = "normal",
  } = body;

  if (!result || !["win", "loss"].includes(result)) {
    return NextResponse.json({ error: "invalid result" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { commander: true },
  });
  if (!user?.commander) {
    return NextResponse.json({ error: "no commander profile" }, { status: 400 });
  }

  const record = await db.matchRecord.create({
    data: {
      userId: user.id,
      commanderName: commanderName || user.commander.name,
      factionId: factionId || user.commander.factionId,
      enemyName: enemyName || "Brood Tyrant Vzaal",
      enemyFactionId: enemyFactionId || "voidborn",
      result,
      turns: Number(turns) || 0,
      playerHpLeft: Number(playerHpLeft) ?? 0,
      enemyHpLeft: Number(enemyHpLeft) ?? 0,
      mode,
      difficulty,
    },
  });

  await db.commander.update({
    where: { userId: user.id },
    data: {
      wins: { increment: result === "win" ? 1 : 0 },
      losses: { increment: result === "loss" ? 1 : 0 },
      matches: { increment: 1 },
    },
  });

  // Process progression rewards: drops, shards, season XP, quest + operation progress
  const { processMatchRewards } = await import("@/lib/progression");
  const rewards = await processMatchRewards({
    userId: user.id,
    won: result === "win",
    factionId: factionId || user.commander.factionId,
    mode,
    deployedCount: Number(body.deployedCount) || 0,
    castCount: Number(body.castCount) || 0,
  });

  // stamp the match record with the drop for display
  const updated = await db.matchRecord.update({
    where: { id: record.id },
    data: {
      dropCardDefId: rewards.drop?.defId ?? null,
      shardsEarned: rewards.shards,
      seasonXpEarned: rewards.seasonXp,
    },
  });

  return NextResponse.json({ ok: true, match: updated, rewards });
}
