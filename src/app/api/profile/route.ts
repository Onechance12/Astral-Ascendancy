import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureHeadquarters } from "@/lib/headquarters";

// GET /api/profile — the logged-in commander's profile + stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureHeadquarters(session.user.id);
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      commander: true,
      headquarters: true,
      decks: { orderBy: { updatedAt: "desc" } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    commander: user.commander
      ? {
          id: user.commander.id,
          name: user.commander.name,
          title: user.commander.title,
          factionId: user.commander.factionId,
          wins: user.commander.wins,
          losses: user.commander.losses,
          matches: user.commander.matches,
          influence: user.commander.influence,
          shards: user.commander.shards,
          seasonXp: user.commander.seasonXp,
          seasonTier: user.commander.seasonTier,
          collectionLevel: user.commander.collectionLevel,
          plasma: user.commander.plasma,
          biomass: user.commander.biomass,
          crystals: user.commander.crystals,
          tritium: user.commander.tritium,
          quantumCores: user.commander.quantumCores,
          activeDeckId: user.commander.activeDeckId,
          headquarters: user.headquarters
            ? {
                id: user.headquarters.id,
                name: user.headquarters.name,
                homeworldName: user.headquarters.homeworldName,
                homeworldType: user.headquarters.homeworldType,
                doctrine: user.headquarters.doctrine,
                capitalLevel: user.headquarters.capitalLevel,
              }
            : null,
        }
      : null,
    decks: user.decks.map((d) => ({
      id: d.id,
      name: d.name,
      factionId: d.factionId,
      cardDefIds: JSON.parse(d.cardDefIds),
      isActive: d.isActive,
    })),
  });
}
