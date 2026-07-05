import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeDeckPower, type PvpDeckTier, type PvpQueueType, validateDeckForQueue } from "@/lib/pvp";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const deckId = typeof body.deckId === "string" ? body.deckId : null;
  const queueType = normalizeQueueType(body.queueType);
  const requestedTier = normalizeTier(body.requestedTier);

  if (!deckId) {
    return NextResponse.json({ error: "deckId is required" }, { status: 400 });
  }

  const deck = await db.deck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "deck not found" }, { status: 404 });
  }

  const cardDefIds = JSON.parse(deck.cardDefIds) as string[];
  const power = analyzeDeckPower(cardDefIds);
  const validation = validateDeckForQueue(cardDefIds, queueType, requestedTier ?? power.tier);
  if (!validation.ok) {
    return NextResponse.json({ error: "deck is not legal for this queue", validation, power }, { status: 400 });
  }

  await db.deck.update({
    where: { id: deck.id },
    data: {
      powerScore: power.score,
      powerTier: power.tier,
      powerVersion: power.version,
    },
  });

  await db.pvpQueueEntry.updateMany({
    where: { userId: session.user.id, status: "queued" },
    data: { status: "canceled" },
  });

  const rank = queueType === "ranked"
    ? await db.pvpRank.upsert({
        where: {
          userId_season_queueType_tier: {
            userId: session.user.id,
            season: "alpha",
            queueType: "ranked",
            tier: validation.requestedTier,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          season: "alpha",
          queueType: "ranked",
          tier: validation.requestedTier,
        },
      })
    : null;

  const queueEntry = await db.pvpQueueEntry.create({
    data: {
      userId: session.user.id,
      deckId: deck.id,
      queueType,
      tier: validation.requestedTier,
      powerScore: power.score,
      rating: rank?.rating ?? 1000,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    queue: queueEntry,
    rank,
    power,
    validation,
    note: "Queue entry created. Live opponent pairing and battle sync are the next service layer.",
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await db.pvpQueueEntry.updateMany({
    where: { userId: session.user.id, status: "queued" },
    data: { status: "canceled" },
  });

  return NextResponse.json({ ok: true });
}

function normalizeQueueType(value: unknown): PvpQueueType {
  return value === "ranked" || value === "unranked" || value === "event" ? value : "unranked";
}

function normalizeTier(value: unknown): PvpDeckTier | undefined {
  if (
    value === "starter" ||
    value === "skirmish" ||
    value === "veteran" ||
    value === "ascendant" ||
    value === "mythic" ||
    value === "open_war"
  ) {
    return value;
  }
  return undefined;
}
