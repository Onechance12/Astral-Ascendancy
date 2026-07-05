// Astral Ascendancy — Resource & Infrastructure Engine
// Passive gathering (idle-game tick), structure building/upgrading, resource costs.

import { db } from "./db";
import { CARD_DEFS } from "./match-engine";

// ---------- Structure definitions (in-code config) ----------
export type StructureType =
  | "solar_harvester"
  | "biomass_farm"
  | "crystal_mine"
  | "gas_refinery"
  | "quantum_array";

export type ResourceType = "plasma" | "biomass" | "crystals" | "tritium" | "quantumCores";

export type StructureDef = {
  type: StructureType;
  name: string;
  glyph: string;
  resourceType: ResourceType;
  description: string;
  baseRate: number; // per hour at level 1
  validPlanetType: string; // which planet type this can be built on
  color: string;
};

export const STRUCTURE_DEFS: Record<StructureType, StructureDef> = {
  solar_harvester: {
    type: "solar_harvester",
    name: "Solar Harvester",
    glyph: "☀",
    resourceType: "plasma",
    description: "Drinks light from the nearest star. Produces Plasma.",
    baseRate: 10,
    validPlanetType: "star",
    color: "#fbbf24",
  },
  biomass_farm: {
    type: "biomass_farm",
    name: "Biomass Farm",
    glyph: "☣",
    resourceType: "biomass",
    description: "Cultivates organic matter. Produces Biomass.",
    baseRate: 10,
    validPlanetType: "organic",
    color: "#e879f9",
  },
  crystal_mine: {
    type: "crystal_mine",
    name: "Crystal Mine",
    glyph: "◆",
    resourceType: "crystals",
    description: "Extracts raw gemstone. Produces Crystals.",
    baseRate: 10,
    validPlanetType: "mineral",
    color: "#22d3ee",
  },
  gas_refinery: {
    type: "gas_refinery",
    name: "Gas Refinery",
    glyph: "⚗",
    resourceType: "tritium",
    description: "Refines gas-giant atmosphere. Produces Tritium fuel.",
    baseRate: 8,
    validPlanetType: "gas",
    color: "#fb923c",
  },
  quantum_array: {
    type: "quantum_array",
    name: "Quantum Array",
    glyph: "⬡",
    resourceType: "quantumCores",
    description: "Harvests computational anomalies. Produces Quantum Cores.",
    baseRate: 6,
    validPlanetType: "anomaly",
    color: "#34d399",
  },
};

// Planet type definitions
export const PLANET_TYPES = {
  star: { name: "Star Orbit", glyph: "☀", color: "#fbbf24", desc: "A world bathed in stellar fire." },
  organic: { name: "Organic World", glyph: "☣", color: "#e879f9", desc: "Teeming with life and biomass." },
  mineral: { name: "Mineral World", glyph: "◆", color: "#22d3ee", desc: "Rich in crystal deposits." },
  gas: { name: "Gas Giant", glyph: "⚗", color: "#fb923c", desc: "A swirling atmosphere of fuel." },
  anomaly: { name: "Anomaly World", glyph: "⬡", color: "#34d399", desc: "A reality-warping quantum node." },
  barren: { name: "Barren Rock", glyph: "·", color: "#94a3b8", desc: "Lifeless. No structure can be built here." },
} as const;

// Resource metadata for display
export const RESOURCE_META: Record<ResourceType, { glyph: string; color: string; label: string }> = {
  plasma: { glyph: "☀", color: "#fbbf24", label: "Plasma" },
  biomass: { glyph: "☣", color: "#e879f9", label: "Biomass" },
  crystals: { glyph: "◆", color: "#22d3ee", label: "Crystals" },
  tritium: { glyph: "⚗", color: "#fb923c", label: "Tritium" },
  quantumCores: { glyph: "⬡", color: "#34d399", label: "Quantum" },
};

// ---------- Structure costs ----------
// Cost to build (level 0 → 1) and upgrade (level N → N+1)
// Level 1 only costs shards (so players can bootstrap). Higher levels also cost the resource.
export function structureCost(type: StructureType, targetLevel: number): { shards: number; resource: number; resourceType: ResourceType } {
  const def = STRUCTURE_DEFS[type];
  if (targetLevel === 1) {
    // first build — only shards, cheap
    return { shards: 50, resource: 0, resourceType: def.resourceType };
  }
  const shards = def.baseRate * 10 * targetLevel; // 200, 300, 400...
  const resource = def.baseRate * 5 * targetLevel; // 100, 150, 200...
  return { shards, resource, resourceType: def.resourceType };
}

// Production rate at a given level (resources per hour)
export function productionRate(type: StructureType, level: number): number {
  const def = STRUCTURE_DEFS[type];
  return def.baseRate * level;
}

// ---------- Passive gathering ----------
// Calculate accumulated resources since lastHarvest and add them.
// Accounts for active developments + assigned crew.
export async function harvestResources(userId: string): Promise<{
  gained: Partial<Record<ResourceType, number>>;
  totals: Record<ResourceType, number>;
}> {
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return { gained: {}, totals: emptyTotals() };

  const planets = await db.planet.findMany({ where: { userId } });
  const now = new Date();
  const elapsed = (now.getTime() - commander.lastHarvest.getTime()) / 1000; // seconds
  const hours = elapsed / 3600;

  // load active developments + crew defs for production calculations
  const { getActiveDevelopments, effectiveProductionRate, CREW_CARD_DEFS } = await import("./world-cards");
  const developments = await getActiveDevelopments(userId);

  const gained: Partial<Record<ResourceType, number>> = {};
  let hasGains = false;

  for (const planet of planets) {
    if (!planet.structureType || planet.structureLevel === 0) continue;
    const def = STRUCTURE_DEFS[planet.structureType as StructureType];
    if (!def) continue;
    // find crew assigned to this planet
    const crewDef = planet.crewCardDefId
      ? CREW_CARD_DEFS.find((c) => c.defId === planet.crewCardDefId)
      : undefined;
    const rate = effectiveProductionRate(def.type, planet.structureLevel, developments, crewDef);
    const amount = Math.floor(rate * hours);
    if (amount > 0) {
      gained[def.resourceType] = (gained[def.resourceType] || 0) + amount;
      hasGains = true;
    }
  }

  if (!hasGains) {
    // still update lastHarvest so we don't accumulate infinitely
    await db.commander.update({ where: { userId }, data: { lastHarvest: now } });
    return { gained: {}, totals: currentTotals(commander) };
  }

  // apply gains
  const update: Record<string, { increment: number }> = {};
  for (const [k, v] of Object.entries(gained)) {
    update[k] = { increment: v as number };
  }
  const updated = await db.commander.update({
    where: { userId },
    data: { ...update, lastHarvest: now } as any,
  });

  return { gained, totals: currentTotals(updated) };
}

// Get pending (un-harvested) resources without claiming them
export async function getPendingResources(userId: string): Promise<Partial<Record<ResourceType, number>>> {
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return {};
  const planets = await db.planet.findMany({ where: { userId } });
  const now = new Date();
  const hours = (now.getTime() - commander.lastHarvest.getTime()) / 3600000;

  const { getActiveDevelopments, effectiveProductionRate, CREW_CARD_DEFS } = await import("./world-cards");
  const developments = await getActiveDevelopments(userId);

  const pending: Partial<Record<ResourceType, number>> = {};
  for (const planet of planets) {
    if (!planet.structureType || planet.structureLevel === 0) continue;
    const def = STRUCTURE_DEFS[planet.structureType as StructureType];
    if (!def) continue;
    const crewDef = planet.crewCardDefId
      ? CREW_CARD_DEFS.find((c) => c.defId === planet.crewCardDefId)
      : undefined;
    const rate = effectiveProductionRate(def.type, planet.structureLevel, developments, crewDef);
    const amount = Math.floor(rate * hours);
    if (amount > 0) {
      pending[def.resourceType] = (pending[def.resourceType] || 0) + amount;
    }
  }
  return pending;
}

// ---------- Build / Upgrade structures ----------
export async function buildOrUpgradeStructure(userId: string, planetId: string): Promise<{
  ok: boolean;
  error?: string;
  newLevel?: number;
}> {
  const planet = await db.planet.findUnique({ where: { id: planetId } });
  if (!planet || planet.userId !== userId) return { ok: false, error: "not found" };

  const planetType = PLANET_TYPES[planet.planetType as keyof typeof PLANET_TYPES];
  if (planet.planetType === "barren") return { ok: false, error: "barren planet — cannot build" };

  // determine which structure type this planet supports
  const structureType = Object.values(STRUCTURE_DEFS).find((s) => s.validPlanetType === planet.planetType);
  if (!structureType) return { ok: false, error: "no structure for this planet type" };

  const currentLevel = planet.structureLevel;
  if (currentLevel >= 5) return { ok: false, error: "max level" };

  const targetLevel = currentLevel + 1;
  const cost = structureCost(structureType.type, targetLevel);
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return { ok: false, error: "no commander" };

  if (commander.shards < cost.shards) return { ok: false, error: `need ${cost.shards} shards` };
  if (commander[cost.resourceType] < cost.resource) return { ok: false, error: `need ${cost.resource} ${RESOURCE_META[cost.resourceType].label}` };

  // deduct
  const update: Record<string, { decrement: number }> = {
    shards: { decrement: cost.shards },
  };
  update[cost.resourceType] = { decrement: cost.resource };
  await db.commander.update({ where: { userId }, data: update as any });

  // build/upgrade the planet
  await db.planet.update({
    where: { id: planetId },
    data: {
      structureType: structureType.type,
      structureLevel: targetLevel,
    },
  });

  return { ok: true, newLevel: targetLevel };
}

// ---------- Starter planets for new commanders ----------
const PLANET_NAMES = [
  "Vrellis Prime", "Korath", "Nyxara", "Theron", "Zhael", "Drakmoor",
  "Solennis", "Voraxis", "Aetheris", "Quorin",
];

export async function seedStarterPlanets(userId: string): Promise<void> {
  const existing = await db.planet.findMany({ where: { userId } });
  if (existing.length > 0) return;

  // give 3 starter planets: one matching their faction, one random resource, one barren
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return;

  const factionPlanetMap: Record<string, string> = {
    solari: "star",
    voidborn: "organic",
    crystalline: "mineral",
    reavers: "gas",
    quantum: "anomaly",
  };

  const types = [
    factionPlanetMap[commander.factionId] || "star",
    ["star", "organic", "mineral", "gas", "anomaly"][Math.floor(Math.random() * 5)],
    "barren",
  ];

  const names = [...PLANET_NAMES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < types.length; i++) {
    await db.planet.create({
      data: {
        userId,
        name: names[i],
        planetType: types[i],
        sector: "home",
        slot: i,
        structureType: null,
        structureLevel: 0,
      },
    });
  }
}

// ---------- Resource costs for crafting ----------
// Crafting a card costs shards + the faction's resource
export function craftingCost(defId: string): { shards: number; resource: ResourceType | null; resourceAmount: number } {
  // Check battle cards first
  const def = CARD_DEFS.find((c) => c.defId === defId);
  if (def) {
    const shardCost = SHARD_COST_BY_RARITY[def.rarity] || 20;
    const factionResource: Record<string, ResourceType> = {
      solari: "plasma",
      voidborn: "biomass",
      crystalline: "crystals",
      reavers: "tritium",
      quantum: "quantumCores",
    };
    const resource = factionResource[def.faction] || null;
    const resourceAmount = (shardCost / 2) | 0;
    return { shards: shardCost, resource, resourceAmount };
  }

  // Check world cards (planets, developments, crew) — craftable with shards only
  // Infer from defId prefix to avoid circular import
  if (defId.startsWith("planet-") || defId.startsWith("dev-") || defId.startsWith("crew-")) {
    // World cards have varying rarity, but we can't look it up here without import.
    // Default to 80 shards for world cards (Rare-tier baseline).
    return { shards: 80, resource: null, resourceAmount: 0 };
  }

  return { shards: 0, resource: null, resourceAmount: 0 };
}

const SHARD_COST_BY_RARITY: Record<string, number> = {
  Common: 20,
  Uncommon: 40,
  Rare: 80,
  Holo: 160,
  Mythic: 320,
  Singularity: 640,
};

// ---------- Travel cost (Tritium fuel) ----------
export const TRAVEL_COST_TRITIUM = 5; // per campaign chapter "travel"

// ---------- Helpers ----------
function emptyTotals(): Record<ResourceType, number> {
  return { plasma: 0, biomass: 0, crystals: 0, tritium: 0, quantumCores: 0 };
}

function currentTotals(c: {
  plasma: number;
  biomass: number;
  crystals: number;
  tritium: number;
  quantumCores: number;
}): Record<ResourceType, number> {
  return {
    plasma: c.plasma,
    biomass: c.biomass,
    crystals: c.crystals,
    tritium: c.tritium,
    quantumCores: c.quantumCores,
  };
}
