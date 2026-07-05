import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  STRUCTURE_DEFS,
  PLANET_TYPES,
  RESOURCE_META,
  productionRate,
  structureCost,
  getPendingResources,
  type StructureType,
  type ResourceType,
} from "@/lib/resources";
import {
  PLANET_CARD_DEFS,
  DEVELOPMENT_CARD_DEFS,
  CREW_CARD_DEFS,
  getActiveDevelopments,
  effectiveProductionRate,
  getMaxStructureLevel,
} from "@/lib/world-cards";

// GET /api/domain — planets, structures, resources, developments, owned world cards, pending harvest
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { seedStarterPlanets } = await import("@/lib/resources");
  await seedStarterPlanets(session.user.id);

  const commander = await db.commander.findUnique({ where: { userId: session.user.id } });
  const planets = await db.planet.findMany({
    where: { userId: session.user.id },
    orderBy: { slot: "asc" },
  });
  const pending = await getPendingResources(session.user.id);

  // load active developments
  const developments = await getActiveDevelopments(session.user.id);
  const maxLevel = getMaxStructureLevel(developments);

  // load owned world cards (planet + development + crew)
  const ownedCards = await db.userCard.findMany({ where: { userId: session.user.id } });
  const ownedMap = new Map(ownedCards.map((c) => [c.defId, c.count]));

  const ownedPlanetCards = PLANET_CARD_DEFS.filter((c) => (ownedMap.get(c.defId) || 0) > 0).map((c) => ({
    ...c,
    count: ownedMap.get(c.defId),
  }));
  const ownedDevelopmentCards = DEVELOPMENT_CARD_DEFS.filter((c) => (ownedMap.get(c.defId) || 0) > 0).map((c) => ({
    ...c,
    count: ownedMap.get(c.defId),
    activated: developments.some((d) => d.defId === c.defId),
  }));
  const ownedCrewCards = CREW_CARD_DEFS.filter((c) => (ownedMap.get(c.defId) || 0) > 0).map((c) => ({
    ...c,
    count: ownedMap.get(c.defId),
  }));

  // enrich planets with structure + production + crew info
  const enrichedPlanets = planets.map((p) => {
    const planetType = PLANET_TYPES[p.planetType as keyof typeof PLANET_TYPES] || PLANET_TYPES.barren;
    const structure = p.structureType
      ? STRUCTURE_DEFS[p.structureType as StructureType]
      : null;
    const crewDef = p.crewCardDefId
      ? CREW_CARD_DEFS.find((c) => c.defId === p.crewCardDefId)
      : null;
    const rate = structure && p.structureLevel > 0
      ? effectiveProductionRate(structure.type, p.structureLevel, developments, crewDef || undefined)
      : 0;
    const validStructure = Object.values(STRUCTURE_DEFS).find((s) => s.validPlanetType === p.planetType);
    return {
      id: p.id,
      name: p.name,
      planetType: p.planetType,
      planetTypeName: planetType.name,
      planetGlyph: planetType.glyph,
      planetColor: planetType.color,
      planetDesc: planetType.desc,
      sector: p.sector,
      slot: p.slot,
      structureType: p.structureType,
      structureLevel: p.structureLevel,
      structureName: structure?.name || null,
      structureGlyph: structure?.glyph || null,
      structureColor: structure?.color || null,
      productionRate: rate,
      productionResource: structure?.resourceType || null,
      validStructureType: validStructure?.type || null,
      validStructureName: validStructure?.name || null,
      crewCardDefId: p.crewCardDefId,
      crewName: crewDef?.name || null,
      crewBonus: crewDef?.description || null,
      sourceCardDefId: p.sourceCardDefId,
      nextLevelCost: p.structureLevel < maxLevel && validStructure
        ? structureCost(validStructure.type, p.structureLevel + 1)
        : null,
    };
  });

  return NextResponse.json({
    planets: enrichedPlanets,
    resources: {
      plasma: commander?.plasma || 0,
      biomass: commander?.biomass || 0,
      crystals: commander?.crystals || 0,
      tritium: commander?.tritium || 0,
      quantumCores: commander?.quantumCores || 0,
      shards: commander?.shards || 0,
    },
    pending,
    resourceMeta: RESOURCE_META,
    lastHarvest: commander?.lastHarvest || new Date(),
    // world cards
    developments: developments.map((d) => ({ defId: d.defId, name: d.name, description: d.description, effect: d.effect })),
    ownedPlanetCards,
    ownedDevelopmentCards,
    ownedCrewCards,
    maxStructureLevel: maxLevel,
  });
}
