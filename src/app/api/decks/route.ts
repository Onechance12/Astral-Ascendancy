import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
  if (cardDefIds.length < 10 || cardDefIds.length > 20) {
    return NextResponse.json({ error: "deck must be 10-20 cards" }, { status: 400 });
  }

  const deck = await db.deck.create({
    data: {
      userId: session.user.id,
      name: name.trim().slice(0, 40),
      factionId,
      cardDefIds: JSON.stringify(cardDefIds),
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
    },
  });
}
