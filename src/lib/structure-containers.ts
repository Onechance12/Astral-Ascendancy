import { findAvailableCardInstance } from "@/lib/card-instances";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { STRUCTURE_DEFS, type StructureType } from "@/lib/resources";
import { getCardCategory, getWorldCardDef } from "@/lib/world-cards";

const STRUCTURE_STATION_CATEGORIES = new Set(["crew", "entity", "science", "project", "structure"]);

type StationedCard = {
  id: string;
  defId: string;
  name: string;
  category: string;
  rarity: string;
  level: number;
  condition: string;
};

export async function ensureStructureContainersForUser(userId: string) {
  const planets = await db.planet.findMany({
    where: {
      userId,
      structureType: { not: null },
      structureLevel: { gt: 0 },
    },
  });

  for (const planet of planets) {
    if (!planet.structureType) continue;
    const def = STRUCTURE_DEFS[planet.structureType as StructureType];
    if (!def) continue;
    const maxIntegrity = getStructureMaxIntegrity(planet.structureLevel);
    await db.structureInstance.upsert({
      where: { planetId_type: { planetId: planet.id, type: planet.structureType } },
      update: {
        userId,
        name: def.name,
        level: planet.structureLevel,
        maxIntegrity,
        capacity: getStructureCapacity(planet.structureLevel),
        status: "active",
      },
      create: {
        userId,
        planetId: planet.id,
        type: planet.structureType,
        name: def.name,
        level: planet.structureLevel,
        maxIntegrity,
        integrity: maxIntegrity,
        capacity: getStructureCapacity(planet.structureLevel),
      },
    });
  }
}

export async function listStructureContainers(userId: string) {
  await ensureStructureContainersForUser(userId);

  const [structures, stationed, eligibleCards] = await Promise.all([
    db.structureInstance.findMany({
      where: { userId },
      include: { planet: true },
      orderBy: [{ planet: { slot: "asc" } }, { slot: "asc" }],
    }),
    db.cardInstance.findMany({
      where: { userId, location: "structure" },
      orderBy: [{ level: "desc" }, { acquiredAt: "asc" }],
    }),
    listStructureEligibleCards(userId),
  ]);

  const stationedByStructure = new Map<string, StationedCard[]>();
  for (const card of stationed) {
    if (!card.structureKey) continue;
    const list = stationedByStructure.get(card.structureKey) ?? [];
    list.push(toStationedCard(card));
    stationedByStructure.set(card.structureKey, list);
  }

  return {
    structures: structures.map((structure) => {
      const def = STRUCTURE_DEFS[structure.type as StructureType];
      const cards = stationedByStructure.get(structure.id) ?? [];
      return {
        id: structure.id,
        planetId: structure.planetId,
        planetName: structure.planet.name,
        planetType: structure.planet.planetType,
        type: structure.type,
        name: structure.name,
        glyph: def?.glyph ?? "▣",
        color: def?.color ?? "#94a3b8",
        resourceType: def?.resourceType ?? null,
        level: structure.level,
        status: structure.status,
        integrity: structure.integrity,
        maxIntegrity: structure.maxIntegrity,
        capacity: structure.capacity,
        occupied: cards.length,
        stationedCards: cards,
        description: def?.description ?? "Built domain structure.",
      };
    }),
    eligibleCards,
  };
}

export async function stationCardInStructure(input: {
  userId: string;
  structureId: string;
  cardInstanceId?: string;
  cardDefId?: string;
}) {
  const structure = await db.structureInstance.findUnique({ where: { id: input.structureId } });
  if (!structure || structure.userId !== input.userId) return { ok: false as const, error: "structure not found" };
  if (structure.status !== "active") return { ok: false as const, error: "structure is not active" };

  const occupied = await db.cardInstance.count({
    where: { userId: input.userId, location: "structure", structureKey: structure.id },
  });
  if (occupied >= structure.capacity) return { ok: false as const, error: "structure is full" };

  const cardResult = await findAvailableCardInstance({
    userId: input.userId,
    cardInstanceId: input.cardInstanceId,
    defId: input.cardDefId,
  });
  if (!cardResult.ok) return cardResult;

  const category = getStructureCardCategory(cardResult.instance.defId);
  if (!STRUCTURE_STATION_CATEGORIES.has(category)) {
    return { ok: false as const, error: `${getCardName(cardResult.instance.defId)} cannot be stationed in structures` };
  }

  const moved = await db.cardInstance.updateMany({
    where: {
      id: cardResult.instance.id,
      userId: input.userId,
      location: "collection",
      status: "available",
      condition: { in: ["healthy", "fatigued"] },
    },
    data: {
      location: "structure",
      status: "busy",
      planetId: structure.planetId,
      structureKey: structure.id,
      metadataJson: JSON.stringify({
        structureId: structure.id,
        structureType: structure.type,
        stationedAt: new Date().toISOString(),
      }),
      lastStateChangeAt: new Date(),
    },
  });
  if (moved.count !== 1) return { ok: false as const, error: "card is already busy" };

  return { ok: true as const };
}

export async function unstationCardFromStructure(input: {
  userId: string;
  cardInstanceId: string;
}) {
  const moved = await db.cardInstance.updateMany({
    where: {
      id: input.cardInstanceId,
      userId: input.userId,
      location: "structure",
    },
    data: {
      location: "collection",
      status: "available",
      planetId: null,
      structureKey: null,
      metadataJson: "{}",
      lastStateChangeAt: new Date(),
    },
  });
  if (moved.count !== 1) return { ok: false as const, error: "stationed card not found" };
  return { ok: true as const };
}

export async function listStructureEligibleCards(userId: string) {
  const cards = await db.cardInstance.findMany({
    where: {
      userId,
      location: "collection",
      status: "available",
      condition: { in: ["healthy", "fatigued"] },
    },
    orderBy: [{ level: "desc" }, { acquiredAt: "asc" }],
  });
  return cards
    .map(toStationedCard)
    .filter((card) => STRUCTURE_STATION_CATEGORIES.has(card.category));
}

function getStructureCapacity(level: number) {
  return Math.max(1, Math.min(5, level));
}

function getStructureMaxIntegrity(level: number) {
  return 100 + Math.max(0, level - 1) * 25;
}

function toStationedCard(card: {
  id: string;
  defId: string;
  displayName: string | null;
  level: number;
  condition: string;
}) {
  return {
    id: card.id,
    defId: card.defId,
    name: card.displayName || getCardName(card.defId),
    category: getStructureCardCategory(card.defId),
    rarity: getCardRarity(card.defId),
    level: card.level,
    condition: card.condition,
  };
}

function getStructureCardCategory(defId: string) {
  const worldCard = getWorldCardDef(defId);
  if (worldCard) return getCardCategory(defId);
  const battleCard = CARD_DEFS.find((card) => card.defId === defId);
  return battleCard ? battleCard.type.toLowerCase() : "entity";
}

function getCardName(defId: string) {
  return getWorldCardDef(defId)?.name ?? CARD_DEFS.find((card) => card.defId === defId)?.name ?? defId;
}

function getCardRarity(defId: string) {
  return getWorldCardDef(defId)?.rarity ?? CARD_DEFS.find((card) => card.defId === defId)?.rarity ?? "Common";
}
