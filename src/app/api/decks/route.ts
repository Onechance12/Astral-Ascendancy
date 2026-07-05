import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeDeckPower, validateDeckCardIds } from "@/lib/pvp";

// GET /api/decks — all decks for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const decks = await db.deck.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({
    decks: decks.map((d) => ({
      id: d.id,
      name: d.name,
      factionId: d.factionId,
      cardDefIds: JSON.parse(d.cardDefIds),
      isActive: d.isActive,
      format: d.format,
      powerScore: d.powerScore,
      powerTier: d.powerTier,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
  });
}

// POST /api/decks — create a new deck
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { name, factionId, cardDefIds } = body as {
    name?: string;
    factionId?: string;
    cardDefIds?: string[];
  };

  if (!name?.trim() || !factionId || !Array.isArray(cardDefIds)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const deckValidation = validateDeckCardIds(cardDefIds, { minCards: 10, maxCards: 20 });
  if (!deckValidation.ok) {
    return NextResponse.json({ error: deckValidation.errors[0], validation: deckValidation }, { status: 400 });
  }
  const power = analyzeDeckPower(cardDefIds);

  const deck = await db.deck.create({
    data: {
      userId: session.user.id,
      name: name.trim().slice(0, 40),
      factionId,
      cardDefIds: JSON.stringify(cardDefIds),
      powerScore: power.score,
      powerTier: power.tier,
      powerVersion: power.version,
      isActive: false,
    },
  });

  return NextResponse.json({
    deck: {
      id: deck.id,
      name: deck.name,
      factionId: deck.factionId,
      cardDefIds,
      isActive: deck.isActive,
      format: deck.format,
      powerScore: deck.powerScore,
      powerTier: deck.powerTier,
    },
  });
}
