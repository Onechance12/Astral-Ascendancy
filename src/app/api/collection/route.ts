import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS, getCardCategory } from "@/lib/world-cards";

// GET /api/collection — all cards owned by the user, with counts + meta
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cards = await db.userCard.findMany({
    where: { userId: session.user.id },
    orderBy: { acquiredAt: "desc" },
  });
  const commander = await db.commander.findUnique({
    where: { userId: session.user.id },
    select: { shards: true, collectionLevel: true, plasma: true, biomass: true, crystals: true, tritium: true, quantumCores: true },
  });

  // join with battle card defs OR world card defs
  const enriched = cards.map((c) => {
    const battleDef = CARD_DEFS.find((d) => d.defId === c.defId);
    const worldDef = ALL_WORLD_CARDS.find((d) => d.defId === c.defId);
    const category = getCardCategory(c.defId);

    if (battleDef) {
      return {
        defId: c.defId,
        count: c.count,
        source: c.source,
        acquiredAt: c.acquiredAt,
        category,
        name: battleDef.name,
        faction: battleDef.faction,
        type: battleDef.type,
        cost: battleDef.cost,
        attack: battleDef.attack,
        hp: battleDef.hp,
        rarity: battleDef.rarity,
        art: battleDef.art,
        evolvesTo: !!battleDef.evolvesTo,
        description: battleDef.text,
      };
    }
    if (worldDef) {
      return {
        defId: c.defId,
        count: c.count,
        source: c.source,
        acquiredAt: c.acquiredAt,
        category,
        name: worldDef.name,
        faction: "world",
        type: "World",
        cost: 0,
        attack: 0,
        hp: 0,
        rarity: worldDef.rarity,
        art: undefined,
        evolvesTo: false,
        description: "description" in worldDef ? worldDef.description : "",
      };
    }
    // unknown card
    return {
      defId: c.defId,
      count: c.count,
      source: c.source,
      acquiredAt: c.acquiredAt,
      category,
      name: c.defId,
      faction: "unknown",
      type: "Unknown",
      cost: 0,
      attack: 0,
      hp: 0,
      rarity: "Common",
      art: undefined,
      evolvesTo: false,
      description: "",
    };
  });

  const totalCards = cards.reduce((s, c) => s + c.count, 0);
  const uniqueCards = cards.length;
  const catalogTotal = CARD_DEFS.length + ALL_WORLD_CARDS.length;

  return NextResponse.json({
    cards: enriched,
    totalCards,
    uniqueCards,
    shards: commander?.shards || 0,
    collectionLevel: commander?.collectionLevel || 0,
    catalogTotal,
    resources: {
      plasma: commander?.plasma || 0,
      biomass: commander?.biomass || 0,
      crystals: commander?.crystals || 0,
      tritium: commander?.tritium || 0,
      quantumCores: commander?.quantumCores || 0,
    },
  });
}
