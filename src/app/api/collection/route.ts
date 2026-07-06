import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS, getCardCategory } from "@/lib/world-cards";
import { getCardInstanceOverview } from "@/lib/card-instances";

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
  const instanceOverview = await getCardInstanceOverview(session.user.id);
  const instancesByDef = new Map<
    string,
    { total: number; available: number; busy: number; unavailable: number; injured: number }
  >();
  for (const instance of instanceOverview.instances) {
    const summary = instancesByDef.get(instance.defId) ?? {
      total: 0,
      available: 0,
      busy: 0,
      unavailable: 0,
      injured: 0,
    };
    summary.total += 1;
    if (instance.status === "available") summary.available += 1;
    if (instance.status === "busy") summary.busy += 1;
    if (instance.status === "unavailable") summary.unavailable += 1;
    if (["injured", "critical", "fallen"].includes(instance.condition)) summary.injured += 1;
    instancesByDef.set(instance.defId, summary);
  }

  // join with battle card defs OR world card defs
  const enriched = cards.map((c) => {
    const battleDef = CARD_DEFS.find((d) => d.defId === c.defId);
    const worldDef = ALL_WORLD_CARDS.find((d) => d.defId === c.defId);
    const category = getCardCategory(c.defId);

    if (battleDef) {
      return {
        defId: c.defId,
        count: c.count,
        instances: instancesByDef.get(c.defId) ?? { total: 0, available: 0, busy: 0, unavailable: 0, injured: 0 },
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
        instances: instancesByDef.get(c.defId) ?? { total: 0, available: 0, busy: 0, unavailable: 0, injured: 0 },
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
      instances: instancesByDef.get(c.defId) ?? { total: 0, available: 0, busy: 0, unavailable: 0, injured: 0 },
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
    instanceSummary: instanceOverview.summary,
    resources: {
      plasma: commander?.plasma || 0,
      biomass: commander?.biomass || 0,
      crystals: commander?.crystals || 0,
      tritium: commander?.tritium || 0,
      quantumCores: commander?.quantumCores || 0,
    },
  });
}
