import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const matches = await db.pvpMatch.findMany({
    where: {
      OR: [{ playerAId: session.user.id }, { playerBId: session.user.id }],
    },
    include: {
      playerA: { include: { commander: true } },
      playerB: { include: { commander: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    matches: matches.map((match) => ({
      id: match.id,
      queueType: match.queueType,
      tier: match.tier,
      status: match.status,
      winnerUserId: match.winnerUserId,
      resultReason: match.resultReason,
      createdAt: match.createdAt,
      endedAt: match.endedAt,
      playerA: summarizePlayer(match.playerA, match.playerAPower, match.playerARatingBefore, match.playerARatingAfter),
      playerB: summarizePlayer(match.playerB, match.playerBPower, match.playerBRatingBefore, match.playerBRatingAfter),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const matchId = typeof body.matchId === "string" ? body.matchId : "";
  const winnerUserId = typeof body.winnerUserId === "string" ? body.winnerUserId : "";
  const resultReason = typeof body.resultReason === "string" ? body.resultReason.slice(0, 40) : "reported";

  if (!matchId || !winnerUserId) {
    return NextResponse.json({ error: "matchId and winnerUserId are required" }, { status: 400 });
  }

  const match = await db.pvpMatch.findUnique({ where: { id: matchId } });
  if (!match || (match.playerAId !== session.user.id && match.playerBId !== session.user.id)) {
    return NextResponse.json({ error: "match not found" }, { status: 404 });
  }
  if (winnerUserId !== match.playerAId && winnerUserId !== match.playerBId) {
    return NextResponse.json({ error: "winner is not in this match" }, { status: 400 });
  }
  if (match.status === "finalized") {
    return NextResponse.json({ error: "match already finalized" }, { status: 409 });
  }

  const playerAWon = winnerUserId === match.playerAId;
  const ratingDelta = match.queueType === "ranked" ? 24 : 0;
  const playerARatingAfter = Math.max(0, match.playerARatingBefore + (playerAWon ? ratingDelta : -ratingDelta));
  const playerBRatingAfter = Math.max(0, match.playerBRatingBefore + (playerAWon ? -ratingDelta : ratingDelta));

  const updated = await db.pvpMatch.update({
    where: { id: match.id },
    data: {
      status: "reported",
      winnerUserId,
      resultReason,
      playerARatingAfter,
      playerBRatingAfter,
      endedAt: new Date(),
    },
  });

  if (match.queueType === "ranked") {
    await Promise.all([
      applyRankResult(match.playerAId, match.tier, playerAWon, playerARatingAfter),
      applyRankResult(match.playerBId, match.tier, !playerAWon, playerBRatingAfter),
    ]);
  }

  return NextResponse.json({
    ok: true,
    match: updated,
    note: "Result accepted as a scaffold. Server-authoritative replay validation is still required before real ranked launch.",
  });
}

async function applyRankResult(userId: string, tier: string, won: boolean, rating: number) {
  const existing = await db.pvpRank.findUnique({
    where: {
      userId_season_queueType_tier: {
        userId,
        season: "alpha",
        queueType: "ranked",
        tier,
      },
    },
  });

  const streak = existing ? (won ? Math.max(1, existing.streak + 1) : Math.min(-1, existing.streak - 1)) : won ? 1 : -1;
  await db.pvpRank.upsert({
    where: {
      userId_season_queueType_tier: {
        userId,
        season: "alpha",
        queueType: "ranked",
        tier,
      },
    },
    update: {
      rating,
      peakRating: existing ? Math.max(existing.peakRating, rating) : rating,
      wins: { increment: won ? 1 : 0 },
      losses: { increment: won ? 0 : 1 },
      streak,
      rankName: rankNameForRating(rating),
      division: divisionForRating(rating),
    },
    create: {
      userId,
      season: "alpha",
      queueType: "ranked",
      tier,
      rating,
      peakRating: rating,
      wins: won ? 1 : 0,
      losses: won ? 0 : 1,
      streak,
      rankName: rankNameForRating(rating),
      division: divisionForRating(rating),
    },
  });
}

function summarizePlayer(
  user: { id: string; name: string; commander: { name: string; title: string; factionId: string } | null },
  power: number,
  ratingBefore: number,
  ratingAfter: number | null
) {
  return {
    id: user.id,
    name: user.name,
    commander: user.commander,
    power,
    ratingBefore,
    ratingAfter,
  };
}

function rankNameForRating(rating: number) {
  if (rating >= 3200) return "Singularity";
  if (rating >= 2600) return "Ascendant";
  if (rating >= 2200) return "Diamond Constellation";
  if (rating >= 1800) return "Platinum Constellation";
  if (rating >= 1400) return "Gold Orbit";
  if (rating >= 1000) return "Silver Orbit";
  return "Bronze Orbit";
}

function divisionForRating(rating: number) {
  const withinBand = rating % 400;
  return Math.max(1, 5 - Math.floor(withinBand / 80));
}
