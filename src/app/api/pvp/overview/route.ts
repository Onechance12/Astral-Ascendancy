import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeDeckPower } from "@/lib/pvp";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [decks, ranks, activeQueue, friends, tribeMemberships] = await Promise.all([
    db.deck.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    db.pvpRank.findMany({
      where: { userId: session.user.id },
      orderBy: [{ tier: "asc" }, { queueType: "asc" }],
    }),
    db.pvpQueueEntry.findFirst({
      where: { userId: session.user.id, status: "queued" },
      orderBy: { createdAt: "desc" },
    }),
    db.friend.count({
      where: {
        OR: [
          { requesterId: session.user.id, status: "accepted" },
          { addresseeId: session.user.id, status: "accepted" },
        ],
      },
    }),
    db.tribeMember.findMany({
      where: { userId: session.user.id },
      include: { tribe: true },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    decks: decks.map((deck) => {
      const cardDefIds = JSON.parse(deck.cardDefIds) as string[];
      const power = analyzeDeckPower(cardDefIds);
      return {
        id: deck.id,
        name: deck.name,
        factionId: deck.factionId,
        cardDefIds,
        isActive: deck.isActive,
        format: deck.format,
        powerScore: deck.powerScore || power.score,
        powerTier: deck.powerTier || power.tier,
        power,
      };
    }),
    ranks,
    activeQueue,
    social: {
      friendCount: friends,
      tribes: tribeMemberships.map((membership) => ({
        id: membership.tribe.id,
        name: membership.tribe.name,
        slug: membership.tribe.slug,
        emblemGlyph: membership.tribe.emblemGlyph,
        role: membership.role,
        contribution: membership.contribution,
      })),
    },
  });
}
