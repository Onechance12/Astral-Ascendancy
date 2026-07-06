import { getCardInstanceOverview } from "@/lib/card-instances";
import { db } from "@/lib/db";
import { RESOURCE_META, type ResourceType } from "@/lib/resources";

export type HeadquartersFacilityKey =
  | "capital"
  | "command"
  | "infirmary"
  | "training"
  | "research"
  | "engineering"
  | "hangar"
  | "security";

type HeadquartersField =
  | "capitalLevel"
  | "commandLevel"
  | "infirmaryLevel"
  | "trainingLevel"
  | "researchLevel"
  | "engineeringLevel"
  | "hangarLevel"
  | "securityLevel";

export type HeadquartersDoctrine = "balanced" | "expansion" | "research" | "war" | "recovery";

export type FacilityCost = {
  shards: number;
  resourceType: ResourceType;
  resourceAmount: number;
};

export type HeadquartersFacilityDef = {
  key: HeadquartersFacilityKey;
  field: HeadquartersField;
  name: string;
  glyph: string;
  description: string;
  phaseUse: string;
  resourceType: ResourceType;
  baseShardCost: number;
  baseResourceCost: number;
};

export const HEADQUARTERS_FACILITIES: Record<HeadquartersFacilityKey, HeadquartersFacilityDef> = {
  capital: {
    key: "capital",
    field: "capitalLevel",
    name: "Capital Core",
    glyph: "◆",
    description: "The central homeworld command structure. Raises the ceiling for every other facility.",
    phaseUse: "Long-term base level, major unlock gates, and future city expansion.",
    resourceType: "crystals",
    baseShardCost: 140,
    baseResourceCost: 50,
  },
  command: {
    key: "command",
    field: "commandLevel",
    name: "Command Spire",
    glyph: "✦",
    description: "Coordinates world operations, deck deployments, patrols, and mission control.",
    phaseUse: "Adds operation capacity and later controls petitions and strategic orders.",
    resourceType: "plasma",
    baseShardCost: 95,
    baseResourceCost: 35,
  },
  infirmary: {
    key: "infirmary",
    field: "infirmaryLevel",
    name: "Homeworld Infirmary",
    glyph: "✚",
    description: "Stabilizes injured living cards and prepares the recovery loop.",
    phaseUse: "Phase 5 medical beds, revival gates, recovery speed, and post-battle injuries.",
    resourceType: "biomass",
    baseShardCost: 85,
    baseResourceCost: 30,
  },
  training: {
    key: "training",
    field: "trainingLevel",
    name: "Training Grounds",
    glyph: "⚔",
    description: "Turns idle warriors into future specialists through timed training.",
    phaseUse: "Phase 5 card XP, class training, armor drills, and combat readiness.",
    resourceType: "tritium",
    baseShardCost: 85,
    baseResourceCost: 30,
  },
  research: {
    key: "research",
    field: "researchLevel",
    name: "Research Observatory",
    glyph: "⬡",
    description: "Processes surveys, scientific findings, anomalies, and faction breakthroughs.",
    phaseUse: "Science tracks, study cards, petitions from researchers, and unlock analysis.",
    resourceType: "quantumCores",
    baseShardCost: 100,
    baseResourceCost: 32,
  },
  engineering: {
    key: "engineering",
    field: "engineeringLevel",
    name: "Engineering Yard",
    glyph: "▣",
    description: "Builds, repairs, and eventually houses structure cards as real assets.",
    phaseUse: "Phase 4 structure containers, repair queues, build projects, and world upgrades.",
    resourceType: "crystals",
    baseShardCost: 100,
    baseResourceCost: 38,
  },
  hangar: {
    key: "hangar",
    field: "hangarLevel",
    name: "Starship Hangar",
    glyph: "△",
    description: "Stages expeditions, rescue teams, and future ship cards.",
    phaseUse: "Ship containers, travel capacity, expedition slots, and rescue range.",
    resourceType: "tritium",
    baseShardCost: 110,
    baseResourceCost: 42,
  },
  security: {
    key: "security",
    field: "securityLevel",
    name: "Defense Grid",
    glyph: "◈",
    description: "Protects the homeworld and claimed assets from raids, disasters, and invasions.",
    phaseUse: "Domain defense, invasion risk, secure operations, and emergency petitions.",
    resourceType: "plasma",
    baseShardCost: 90,
    baseResourceCost: 34,
  },
};

const HOMEWORLD_BY_FACTION: Record<string, { name: string; type: string; baseName: string }> = {
  solari: { name: "Solennis Prime", type: "star", baseName: "Dawn Citadel" },
  voidborn: { name: "Vorrhusk Cradle", type: "organic", baseName: "Living Hive" },
  synthari: { name: "Synapse-9", type: "anomaly", baseName: "Logic Nexus" },
  crystalline: { name: "The Great Facet", type: "mineral", baseName: "Lattice Bastion" },
  reavers: { name: "Korath Anchorage", type: "gas", baseName: "Raid Dock" },
  verdant: { name: "Worldroot Vale", type: "organic", baseName: "Grovehold" },
  crimson: { name: "Emberfall", type: "mineral", baseName: "War Forge" },
  astral: { name: "Aster Gate", type: "anomaly", baseName: "Chronicle Spire" },
  quantum: { name: "Quantum Rift", type: "anomaly", baseName: "Probability Array" },
};

export async function ensureHeadquarters(userId: string) {
  const existing = await db.headquarters.findUnique({ where: { userId } });
  if (existing) return existing;

  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return null;

  const homeworld = HOMEWORLD_BY_FACTION[commander.factionId] ?? HOMEWORLD_BY_FACTION.solari;
  return db.headquarters.create({
    data: {
      userId,
      name: homeworld.baseName,
      homeworldName: homeworld.name,
      homeworldType: homeworld.type,
      doctrine: defaultDoctrineForFaction(commander.factionId),
    },
  });
}

export async function getHeadquartersState(userId: string) {
  const headquarters = await ensureHeadquarters(userId);
  if (!headquarters) return null;

  const [commander, planetCount, activeOperations, readyOperations, cardOverview] = await Promise.all([
    db.commander.findUnique({ where: { userId } }),
    db.planet.count({ where: { userId } }),
    db.assignment.count({ where: { userId, status: "active" } }),
    db.assignment.count({ where: { userId, status: "ready" } }),
    getCardInstanceOverview(userId),
  ]);
  if (!commander) return null;

  const resources = {
    shards: commander.shards,
    plasma: commander.plasma,
    biomass: commander.biomass,
    crystals: commander.crystals,
    tritium: commander.tritium,
    quantumCores: commander.quantumCores,
  };

  const facilities = Object.values(HEADQUARTERS_FACILITIES).map((def) => {
    const level = headquarters[def.field];
    const maxLevel = getFacilityMaxLevel(def.key, headquarters.capitalLevel);
    const nextLevel = level + 1;
    const nextCost = level >= maxLevel ? null : getFacilityCost(def.key, nextLevel);
    return {
      ...def,
      level,
      maxLevel,
      nextLevel: nextCost ? nextLevel : null,
      nextCost,
      canAfford: nextCost ? canAfford(resources, nextCost) : false,
      resourceLabel: RESOURCE_META[def.resourceType].label,
      resourceGlyph: RESOURCE_META[def.resourceType].glyph,
    };
  });

  const capacities = {
    worldOperationSlots: Math.max(1, headquarters.commandLevel + Math.floor(headquarters.capitalLevel / 2)),
    recoveryBeds: headquarters.infirmaryLevel,
    trainingSlots: headquarters.trainingLevel,
    researchProjects: Math.max(1, headquarters.researchLevel),
    engineeringProjects: Math.max(1, headquarters.engineeringLevel),
    expeditionSlots: headquarters.hangarLevel,
    defenseRating: headquarters.securityLevel * 12 + headquarters.capitalLevel * 4,
  };

  return {
    headquarters,
    facilities,
    capacities,
    resources,
    summary: {
      planetCount,
      activeOperations,
      readyOperations,
      cardInstances: cardOverview.summary,
      doctrine: getDoctrineSummary(headquarters.doctrine as HeadquartersDoctrine),
    },
  };
}

export async function upgradeHeadquartersFacility(userId: string, facilityKey: HeadquartersFacilityKey) {
  const def = HEADQUARTERS_FACILITIES[facilityKey];
  if (!def) return { ok: false as const, error: "invalid facility" };

  const headquarters = await ensureHeadquarters(userId);
  if (!headquarters) return { ok: false as const, error: "headquarters not found" };

  const currentLevel = headquarters[def.field];
  const maxLevel = getFacilityMaxLevel(facilityKey, headquarters.capitalLevel);
  if (currentLevel >= maxLevel) return { ok: false as const, error: "facility is at current max level" };

  const targetLevel = currentLevel + 1;
  const cost = getFacilityCost(facilityKey, targetLevel);
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return { ok: false as const, error: "commander not found" };
  if (!canAfford({
    shards: commander.shards,
    plasma: commander.plasma,
    biomass: commander.biomass,
    crystals: commander.crystals,
    tritium: commander.tritium,
    quantumCores: commander.quantumCores,
  }, cost)) {
    return { ok: false as const, error: `need ${cost.shards} shards and ${cost.resourceAmount} ${RESOURCE_META[cost.resourceType].label}` };
  }

  const result = await db.$transaction(async (tx) => {
    const spent = await tx.commander.updateMany({
      where: {
        userId,
        shards: { gte: cost.shards },
        [cost.resourceType]: { gte: cost.resourceAmount },
      },
      data: {
        shards: { decrement: cost.shards },
        [cost.resourceType]: { decrement: cost.resourceAmount },
      } as any,
    });
    if (spent.count !== 1) throw new Error("RESOURCE_SPEND_FAILED");

    return tx.headquarters.update({
      where: { userId },
      data: {
        [def.field]: { increment: 1 },
        morale: { increment: facilityKey === "capital" ? 3 : 1 },
        stability: { increment: facilityKey === "security" || facilityKey === "engineering" ? 2 : 1 },
      } as any,
    });
  }).catch((error) => {
    if (error instanceof Error && error.message === "RESOURCE_SPEND_FAILED") return null;
    throw error;
  });

  if (!result) return { ok: false as const, error: "resources changed before upgrade could complete" };
  return { ok: true as const, headquarters: result, facility: def, newLevel: targetLevel, cost };
}

export async function updateHeadquartersDoctrine(userId: string, doctrine: HeadquartersDoctrine) {
  const valid: HeadquartersDoctrine[] = ["balanced", "expansion", "research", "war", "recovery"];
  if (!valid.includes(doctrine)) return { ok: false as const, error: "invalid doctrine" };
  await ensureHeadquarters(userId);
  const headquarters = await db.headquarters.update({
    where: { userId },
    data: { doctrine },
  });
  return { ok: true as const, headquarters };
}

function getFacilityMaxLevel(key: HeadquartersFacilityKey, capitalLevel: number) {
  if (key === "capital") return 10;
  return Math.min(10, Math.max(2, capitalLevel + 2));
}

function getFacilityCost(key: HeadquartersFacilityKey, targetLevel: number): FacilityCost {
  const def = HEADQUARTERS_FACILITIES[key];
  const multiplier = targetLevel === 1 ? 1 : targetLevel * targetLevel;
  return {
    shards: def.baseShardCost * multiplier,
    resourceType: def.resourceType,
    resourceAmount: def.baseResourceCost * multiplier,
  };
}

function canAfford(resources: Record<"shards" | ResourceType, number>, cost: FacilityCost) {
  return resources.shards >= cost.shards && resources[cost.resourceType] >= cost.resourceAmount;
}

function defaultDoctrineForFaction(factionId: string): HeadquartersDoctrine {
  if (["solari", "crystalline"].includes(factionId)) return "balanced";
  if (["voidborn", "verdant"].includes(factionId)) return "recovery";
  if (["synthari", "astral", "quantum"].includes(factionId)) return "research";
  if (["crimson", "reavers"].includes(factionId)) return "war";
  return "balanced";
}

function getDoctrineSummary(doctrine: HeadquartersDoctrine) {
  const summaries: Record<HeadquartersDoctrine, string> = {
    balanced: "Balanced doctrine keeps the homeworld flexible while the player learns the wider game.",
    expansion: "Expansion doctrine favors worlds, operations, hangars, and planetary growth.",
    research: "Research doctrine favors surveys, science, engineering projects, and unlock planning.",
    war: "War doctrine favors security, training, patrols, and aggressive campaign pressure.",
    recovery: "Recovery doctrine favors infirmary growth, healing loops, and preserving living cards.",
  };
  return summaries[doctrine] ?? summaries.balanced;
}
