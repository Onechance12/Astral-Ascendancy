// Astral Ascendancy — World-Building Cards
// Planet cards (deploy → claim planet), Development cards (activate → tech boost),
// Crew cards (assign to planet → production bonus).

import { db } from "./db";
import { CARD_DEFS } from "./match-engine";
import { STRUCTURE_DEFS, PLANET_TYPES, productionRate as baseProductionRate } from "./resources";

// ---------- Card categories ----------
export type CardCategory =
  | "entity"
  | "anomaly"
  | "world"
  | "structure"
  | "attachment"
  | "planet"
  | "development"
  | "crew";

// ---------- Planet card definitions ----------
export type PlanetCardDef = {
  defId: string;
  name: string;
  category: "planet";
  planetType: string; // star | organic | mineral | gas | anomaly
  rarity: string;
  description: string;
  flavor: string;
  art?: string;
  startingStructureLevel: number; // some planet cards come with a pre-built structure
};

export const PLANET_CARD_DEFS: PlanetCardDef[] = [
  {
    defId: "planet-star-helios",
    name: "Helios, the Eternal Forge",
    category: "planet",
    planetType: "star",
    rarity: "Rare",
    description: "A young star ripe for harvesting. Deploy to claim a Star Orbit planet.",
    flavor: "Its light has never known darkness.",
    startingStructureLevel: 0,
  },
  {
    defId: "planet-star-nova",
    name: "Nova Cinder",
    category: "planet",
    planetType: "star",
    rarity: "Holo",
    description: "A dying star burning its last. Deploys a Star Orbit with a pre-built Solar Harvester (Lv.1).",
    flavor: "Even in death, it gives.",
    startingStructureLevel: 1,
  },
  {
    defId: "planet-organic-verdant",
    name: "Verdant Bloom",
    category: "planet",
    planetType: "organic",
    rarity: "Uncommon",
    description: "A world teeming with life. Deploy to claim an Organic World.",
    flavor: "The swarm's cradle.",
    startingStructureLevel: 0,
  },
  {
    defId: "planet-mineral-geode",
    name: "The Great Geode",
    category: "planet",
    planetType: "mineral",
    rarity: "Rare",
    description: "A crystalline hollow world. Deploy to claim a Mineral World.",
    flavor: "Its facets sing in resonance.",
    startingStructureLevel: 0,
  },
  {
    defId: "planet-gas-cyclone",
    name: "Cyclone of Korath",
    category: "planet",
    planetType: "gas",
    rarity: "Uncommon",
    description: "A swirling gas giant. Deploy to claim a Gas Giant for Tritium refining.",
    flavor: "The Reavers call it the Endless Engine.",
    startingStructureLevel: 0,
  },
  {
    defId: "planet-anomaly-rift",
    name: "The Quantum Rift",
    category: "planet",
    planetType: "anomaly",
    rarity: "Mythic",
    description: "A tear in spacetime. Deploy to claim an Anomaly World with a pre-built Quantum Array (Lv.1).",
    flavor: "Reality folds here. So does probability.",
    startingStructureLevel: 1,
  },
  {
    defId: "planet-star-supernova",
    name: "Supernova Wreath",
    category: "planet",
    planetType: "star",
    rarity: "Mythic",
    description: "A star in the act of exploding. Deploys a Star Orbit with a pre-built Solar Harvester Lv.2.",
    flavor: "Catch the star while it dies. The energy is... immeasurable.",
    startingStructureLevel: 2,
  },
  {
    defId: "planet-organic-flesh",
    name: "Fleshforge",
    category: "planet",
    planetType: "organic",
    rarity: "Rare",
    description: "A living world of raw biomass. Deploys an Organic World with a pre-built Biomass Farm (Lv.1).",
    flavor: "The ground breathes. The sky bleeds. The swarm calls it home.",
    startingStructureLevel: 1,
  },
  {
    defId: "planet-mineral-diamond",
    name: "Diamond Core",
    category: "planet",
    planetType: "mineral",
    rarity: "Holo",
    description: "A planet-sized diamond. Deploys a Mineral World with a pre-built Crystal Mine (Lv.1).",
    flavor: "Pressure made this. Time polished it. You will harvest it.",
    startingStructureLevel: 1,
  },
  {
    defId: "planet-gas-storm",
    name: "The Eternal Storm",
    category: "planet",
    planetType: "gas",
    rarity: "Rare",
    description: "A gas giant of perpetual hurricanes. Deploys a Gas Giant with a pre-built Gas Refinery (Lv.1).",
    flavor: "The storm never ends. Neither does the fuel.",
    startingStructureLevel: 1,
  },
  {
    defId: "planet-anomaly-singularity",
    name: "Micro-Singularity",
    category: "planet",
    planetType: "anomaly",
    rarity: "Singularity",
    description: "A captured black hole. Deploys an Anomaly World with a pre-built Quantum Array Lv.2.",
    flavor: "You put a leash on infinity. It humors you. For now.",
    startingStructureLevel: 2,
  },
];

// ---------- Development card definitions (tech tree) ----------
export type DevelopmentCardDef = {
  defId: string;
  name: string;
  category: "development";
  rarity: string;
  description: string;
  flavor: string;
  effect: {
    type: "production_mult" | "max_level" | "storage_cap" | "discount";
    target?: string; // structure type or resource type
    value: number; // multiplier (2 = 2x), additive, etc.
  };
  art?: string;
};

export const DEVELOPMENT_CARD_DEFS: DevelopmentCardDef[] = [
  {
    defId: "dev-solar-amplifier",
    name: "Solar Amplifier",
    category: "development",
    rarity: "Rare",
    description: "Permanent: Solar Harvesters produce 50% more Plasma.",
    flavor: "Bend the star's will through focused resonance.",
    effect: { type: "production_mult", target: "solar_harvester", value: 1.5 },
  },
  {
    defId: "dev-biomass-accelerator",
    name: "Biomass Accelerator",
    category: "development",
    rarity: "Rare",
    description: "Permanent: Biomass Farms produce 50% more Biomass.",
    flavor: "Growth, accelerated beyond nature's intent.",
    effect: { type: "production_mult", target: "biomass_farm", value: 1.5 },
  },
  {
    defId: "dev-deep-mining",
    name: "Deep Mining Protocol",
    category: "development",
    rarity: "Holo",
    description: "Permanent: All structures can reach level 6 (was 5).",
    flavor: "There is always more beneath.",
    effect: { type: "max_level", value: 6 },
  },
  {
    defId: "dev-fusion-reactor",
    name: "Fusion Reactor",
    category: "development",
    rarity: "Holo",
    description: "Permanent: Crystal Mines produce 50% more Crystals.",
    flavor: "Pressure makes diamonds. And power.",
    effect: { type: "production_mult", target: "crystal_mine", value: 1.5 },
  },
  {
    defId: "dev-quantum-optimization",
    name: "Quantum Optimization",
    category: "development",
    rarity: "Mythic",
    description: "Permanent: ALL structures produce 25% more resources.",
    flavor: "Compute the optimal timeline. Inhabit it.",
    effect: { type: "production_mult", value: 1.25 }, // no target = all
  },
  {
    defId: "dev-efficient-construction",
    name: "Efficient Construction",
    category: "development",
    rarity: "Uncommon",
    description: "Permanent: Structure build costs are 20% cheaper.",
    flavor: "Work smarter. Build faster.",
    effect: { type: "discount", value: 0.8 },
  },
  {
    defId: "dev-gas-catalyst",
    name: "Gas Catalyst",
    category: "development",
    rarity: "Rare",
    description: "Permanent: Gas Refineries produce 50% more Tritium.",
    flavor: "The Reavers' secret. Now yours.",
    effect: { type: "production_mult", target: "gas_refinery", value: 1.5 },
  },
  {
    defId: "dev-quantum-entanglement",
    name: "Quantum Entanglement Grid",
    category: "development",
    rarity: "Mythic",
    description: "Permanent: ALL structures produce 50% more resources.",
    flavor: "Connect every harvester across every world. They share more than energy — they share purpose.",
    effect: { type: "production_mult", value: 1.5 },
  },
  {
    defId: "dev-megastructure",
    name: "Megastructure Protocol",
    category: "development",
    rarity: "Singularity",
    description: "Permanent: All structures can reach level 8 (was 5). Build costs 30% cheaper.",
    flavor: "When a civilization builds big enough, the universe takes notice. Sometimes it steps aside.",
    effect: { type: "max_level", value: 8 },
  },
];

// ---------- Crew card definitions ----------
export type CrewCardDef = {
  defId: string;
  name: string;
  category: "crew";
  rarity: string;
  description: string;
  flavor: string;
  bonus: {
    type: "production_mult" | "flat_rate" | "reveal_sector";
    value: number; // 1.5 = +50% production, 5 = +5/hr flat
  };
  art?: string;
};

export const CREW_CARD_DEFS: CrewCardDef[] = [
  {
    defId: "crew-mining-team",
    name: "Veteran Mining Team",
    category: "crew",
    rarity: "Uncommon",
    description: "Assign to a planet: +50% resource production on that planet.",
    flavor: "They've dug through stranger earths than this.",
    bonus: { type: "production_mult", value: 1.5 },
  },
  {
    defId: "crew-scout-squad",
    name: "Deep-Scout Squad",
    category: "crew",
    rarity: "Rare",
    description: "Assign to a planet: +5/hr flat bonus to that planet's resource.",
    flavor: "They see what others miss.",
    bonus: { type: "flat_rate", value: 5 },
  },
  {
    defId: "crew-quantum-analysts",
    name: "Quantum Analysts",
    category: "crew",
    rarity: "Holo",
    description: "Assign to a planet: +100% resource production on that planet.",
    flavor: "They compute the future. The future is profitable.",
    bonus: { type: "production_mult", value: 2 },
  },
  {
    defId: "crew-solar-priests",
    name: "Solar Priests of Dawn",
    category: "crew",
    rarity: "Rare",
    description: "Assign to a Star Orbit: +3/hr Plasma through worship.",
    flavor: "They sing the sun's name. It listens.",
    bonus: { type: "flat_rate", value: 3 },
  },
  {
    defId: "crew-biomass-cultivators",
    name: "Biomass Cultivators",
    category: "crew",
    rarity: "Uncommon",
    description: "Assign to an Organic World: +4/hr Biomass.",
    flavor: "They breed life. Life breeds resources. The cycle feeds itself.",
    bonus: { type: "flat_rate", value: 4 },
  },
  {
    defId: "crew-crystal-cutters",
    name: "Master Crystal Cutters",
    category: "crew",
    rarity: "Uncommon",
    description: "Assign to a Mineral World: +4/hr Crystals.",
    flavor: "They hear the song inside the stone. They know exactly where to cut.",
    bonus: { type: "flat_rate", value: 4 },
  },
  {
    defId: "crew-void-prospectors",
    name: "Void Prospectors",
    category: "crew",
    rarity: "Rare",
    description: "Assign to any planet: +25% production AND +2/hr flat bonus.",
    flavor: "They've prospected a thousand dead worlds. They know what they're looking at.",
    bonus: { type: "production_mult", value: 1.25 },
  },
];

// ---------- Combined world-card registry ----------
export type WorldCardDef =
  | PlanetCardDef
  | DevelopmentCardDef
  | CrewCardDef;

export const ALL_WORLD_CARDS: WorldCardDef[] = [
  ...PLANET_CARD_DEFS,
  ...DEVELOPMENT_CARD_DEFS,
  ...CREW_CARD_DEFS,
];

export function getWorldCardDef(defId: string): WorldCardDef | undefined {
  return ALL_WORLD_CARDS.find((c) => c.defId === defId);
}

// Check if a defId is a world card (not a battle card)
export function isWorldCard(defId: string): boolean {
  return ALL_WORLD_CARDS.some((c) => c.defId === defId);
}

export function getCardCategory(defId: string): CardCategory {
  if (PLANET_CARD_DEFS.some((c) => c.defId === defId)) return "planet";
  if (DEVELOPMENT_CARD_DEFS.some((c) => c.defId === defId)) return "development";
  if (CREW_CARD_DEFS.some((c) => c.defId === defId)) return "crew";
  const def = CARD_DEFS.find((c) => c.defId === defId);
  if (def) return def.type.toLowerCase() as CardCategory;
  return "entity";
}

// ---------- Deploy a planet card → claim a new planet ----------
export async function deployPlanetCard(userId: string, planetCardDefId: string, customName?: string): Promise<{
  ok: boolean;
  error?: string;
  planetId?: string;
}> {
  const cardDef = PLANET_CARD_DEFS.find((c) => c.defId === planetCardDefId);
  if (!cardDef) return { ok: false, error: "invalid planet card" };

  // check user owns the card
  const userCard = await db.userCard.findUnique({
    where: { userId_defId: { userId, defId: planetCardDefId } },
  });
  if (!userCard || userCard.count < 1) return { ok: false, error: "you don't own this card" };

  // count existing planets to assign a slot
  const existingPlanets = await db.planet.findMany({ where: { userId } });
  const slot = existingPlanets.length;
  if (slot >= 12) return { ok: false, error: "domain full (max 12 planets)" };

  // determine structure type + starting level
  const structureType = Object.values(STRUCTURE_DEFS).find(
    (s) => s.validPlanetType === cardDef.planetType
  );
  const startingLevel = cardDef.startingStructureLevel;

  // create the planet
  const planet = await db.planet.create({
    data: {
      userId,
      name: customName?.trim() || cardDef.name,
      planetType: cardDef.planetType,
      sector: "home",
      slot,
      structureType: startingLevel > 0 ? structureType?.type || null : null,
      structureLevel: startingLevel,
      sourceCardDefId: planetCardDefId,
    },
  });

  // consume the card (decrement count, delete if 0)
  if (userCard.count <= 1) {
    await db.userCard.delete({ where: { id: userCard.id } });
  } else {
    await db.userCard.update({
      where: { id: userCard.id },
      data: { count: { decrement: 1 } },
    });
  }

  return { ok: true, planetId: planet.id };
}

// ---------- Activate a development card → permanent tech boost ----------
export async function activateDevelopmentCard(userId: string, devCardDefId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cardDef = DEVELOPMENT_CARD_DEFS.find((c) => c.defId === devCardDefId);
  if (!cardDef) return { ok: false, error: "invalid development card" };

  // check ownership
  const userCard = await db.userCard.findUnique({
    where: { userId_defId: { userId, defId: devCardDefId } },
  });
  if (!userCard || userCard.count < 1) return { ok: false, error: "you don't own this card" };

  // check not already activated
  const existing = await db.developmentProgress.findUnique({
    where: { userId_devCardDefId: { userId, devCardDefId } },
  });
  if (existing) return { ok: false, error: "already activated" };

  // activate
  await db.developmentProgress.create({
    data: { userId, devCardDefId },
  });

  // consume the card
  if (userCard.count <= 1) {
    await db.userCard.delete({ where: { id: userCard.id } });
  } else {
    await db.userCard.update({
      where: { id: userCard.id },
      data: { count: { decrement: 1 } },
    });
  }

  return { ok: true };
}

// Get all active developments for a user (for production calculations)
export async function getActiveDevelopments(userId: string): Promise<DevelopmentCardDef[]> {
  const progress = await db.developmentProgress.findMany({ where: { userId } });
  return progress
    .map((p) => DEVELOPMENT_CARD_DEFS.find((c) => c.defId === p.devCardDefId))
    .filter((c): c is DevelopmentCardDef => c !== undefined);
}

// ---------- Assign a crew card to a planet ----------
export async function assignCrewToPlanet(userId: string, planetId: string, crewCardDefId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cardDef = CREW_CARD_DEFS.find((c) => c.defId === crewCardDefId);
  if (!cardDef) return { ok: false, error: "invalid crew card" };

  const planet = await db.planet.findUnique({ where: { id: planetId } });
  if (!planet || planet.userId !== userId) return { ok: false, error: "planet not found" };

  // check ownership (crew cards are NOT consumed — they're assigned)
  const userCard = await db.userCard.findUnique({
    where: { userId_defId: { userId, defId: crewCardDefId } },
  });
  if (!userCard || userCard.count < 1) return { ok: false, error: "you don't own this crew card" };

  // assign (replaces any existing crew)
  await db.planet.update({
    where: { id: planetId },
    data: {
      crewCardDefId,
      crewAssignedAt: new Date(),
    },
  });

  return { ok: true };
}

export async function unassignCrew(userId: string, planetId: string): Promise<{ ok: boolean }> {
  const planet = await db.planet.findUnique({ where: { id: planetId } });
  if (!planet || planet.userId !== userId) return { ok: false };
  await db.planet.update({
    where: { id: planetId },
    data: { crewCardDefId: null, crewAssignedAt: null },
  });
  return { ok: true };
}

// ---------- Calculate effective production rate (with developments + crew) ----------
export function effectiveProductionRate(
  structureType: string,
  level: number,
  developments: DevelopmentCardDef[],
  crewDef: CrewCardDef | undefined
): number {
  let rate = baseProductionRate(structureType as any, level);

  // apply production_mult developments
  for (const dev of developments) {
    if (dev.effect.type === "production_mult") {
      if (!dev.effect.target || dev.effect.target === structureType) {
        rate *= dev.effect.value;
      }
    }
  }

  // apply crew bonus
  if (crewDef) {
    if (crewDef.bonus.type === "production_mult") {
      rate *= crewDef.bonus.value;
    } else if (crewDef.bonus.type === "flat_rate") {
      rate += crewDef.bonus.value;
    }
  }

  return Math.round(rate * 100) / 100; // round to 2 decimals
}

// ---------- Max structure level (with Deep Mining development) ----------
export function getMaxStructureLevel(developments: DevelopmentCardDef[]): number {
  const deepMining = developments.find((d) => d.effect.type === "max_level");
  return deepMining ? deepMining.effect.value : 5;
}
