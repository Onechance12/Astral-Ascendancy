import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeDeckPower } from "@/lib/pvp";

// PATCH /api/decks/[id] — update deck (rename, cards) or set active
// DELETE /api/decks/[id] — delete deck
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const deck = await db.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const nextCardDefIds = Array.isArray(body.cardDefIds) ? body.cardDefIds : JSON.parse(deck.cardDefIds);
  const power = analyzeDeckPower(nextCardDefIds);

  // activating a deck: deactivate all others first
  if (body.isActive === true) {
    await db.deck.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  const updated = await db.deck.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim().slice(0, 40) : undefined,
      cardDefIds: Array.isArray(body.cardDefIds) ? JSON.stringify(nextCardDefIds) : undefined,
      powerScore: power.score,
      powerTier: power.tier,
      powerVersion: power.version,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
  });

  // if activated, also set the commander's activeDeckId
  if (body.isActive === true) {
    await db.commander.update({
      where: { userId: session.user.id },
      data: { activeDeckId: id },
    });
  }

  return NextResponse.json({
    deck: {
      id: updated.id,
      name: updated.name,
      factionId: updated.factionId,
      cardDefIds: JSON.parse(updated.cardDefIds),
      isActive: updated.isActive,
      format: updated.format,
      powerScore: updated.powerScore,
      powerTier: updated.powerTier,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const deck = await db.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await db.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
