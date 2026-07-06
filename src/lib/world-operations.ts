import { claimAssignment } from "@/lib/beta-progression";
import { findAvailableCardInstance } from "@/lib/card-instances";
import { db } from "@/lib/db";
import { ensureHeadquarters } from "@/lib/headquarters";
import { CARD_DEFS } from "@/lib/match-engine";
import { RESOURCE_META, STRUCTURE_DEFS, type ResourceType, type StructureType } from "@/lib/resources";
import { getCardCategory, getWorldCardDef } from "@/lib/world-cards";

export type WorldOperationType = "gather" | "survey" | "scout" | "secure";

export type WorldOperationDef = {
  type: WorldOperationType;
  assignmentType: string;
  title: string;
  verb: string;
  durationMinutes: number;
  description: string;
  eligibleCategories: string[];
  requiresStructure?: boolean;
  primaryReward: "resource" | "science" | "sector" | "stability";
};

export type OperationCardOption = {
  id: string;
  defId: string;
  name: string;
  category: string;
  rarity: string;
  level: number;
  condition: string;
  eligibleOperations: WorldOperationType[];
};

export const WORLD_OPERATION_DEFS: Record<WorldOperationType, WorldOperationDef> = {
  gather: {
    type: "gather",
    assignmentType: "world_gather",
    title: "Resource Extraction",
    verb: "Gather",
    durationMinutes: 35,
    description: "Send a living card to work a built world and bring back a focused resource haul.",
    eligibleCategories: ["crew", "entity", "structure"],
    requiresStructure: true,
    primaryReward: "resource",
  },
  survey: {
    type: "survey",
    assignmentType: "world_survey",
    title: "World Survey",
    verb: "Survey",
    durationMinutes: 45,
    description: "Study a planet's terrain, anomalies, and resource signatures for research progress.",
    eligibleCategories: ["crew", "science", "project", "entity"],
    primaryReward: "science",
  },
  scout: {
    type: "scout",
    assignmentType: "world_scout",
    title: "Deep Scout",
    verb: "Scout",
    durationMinutes: 30,
    description: "Probe the surrounding sector for routes, danger, salvage, and future campaign hooks.",
    eligibleCategories: ["crew", "entity", "skill"],
    primaryReward: "sector",
  },
  secure: {
    type: "secure",
    assignmentType: "world_secure",
    title: "Secure Perimeter",
    verb: "Secure",
    durationMinutes: 50,
    description: "Patrol a claimed world so production, future buildings, and stationed cards are safer.",
    eligibleCategories: ["crew", "entity", "relic", "skill"],
    primaryReward: "stability",
  },
};

const ASSIGNMENT_TYPE_TO_OPERATION = new Map(
  Object.values(WORLD_OPERATION_DEFS).map((def) => [def.assignmentType, def.type])
);

const WORLD_OPERATION_ASSIGNMENT_TYPES = Object.values(WORLD_OPERATION_DEFS).map((def) => def.assignmentType);

const PLANET_RESOURCE: Record<string, ResourceType | null> = {
  star: "plasma",
  organic: "biomass",
  mineral: "crystals",
  gas: "tritium",
  anomaly: "quantumCores",
  barren: null,
};

export async function listWorldOperations(userId: string) {
  await markReadyWorldOperations(userId);

  const [assignments, planets, cards, headquarters] = await Promise.all([
    db.assignment.findMany({
      where: {
        userId,
        type: { in: WORLD_OPERATION_ASSIGNMENT_TYPES },
        status: { in: ["active", "ready"] },
      },
      orderBy: [{ status: "desc" }, { completesAt: "asc" }],
    }),
    db.planet.findMany({ where: { userId }, orderBy: { slot: "asc" } }),
    listEligibleOperationCards(userId),
    ensureHeadquarters(userId),
  ]);

  const planetMap = new Map(planets.map((planet) => [planet.id, planet]));
  const operationCapacity = headquarters ? getWorldOperationCapacity(headquarters) : 1;

  return {
    definitions: WORLD_OPERATION_DEFS,
    capacity: {
      used: assignments.length,
      max: operationCapacity,
      available: Math.max(0, operationCapacity - assignments.length),
    },
    operations: assignments.map((assignment) => {
      const operationType = ASSIGNMENT_TYPE_TO_OPERATION.get(assignment.type) ?? "gather";
      const planet = assignment.planetId ? planetMap.get(assignment.planetId) : null;
      return {
        id: assignment.id,
        type: operationType,
        assignmentType: assignment.type,
        title: assignment.title,
        status: assignment.status,
        assetType: assignment.assetType,
        cardDefId: assignment.cardDefId,
        cardInstanceId: assignment.cardInstanceId,
        cardName: assignment.cardDefId ? getCardName(assignment.cardDefId) : null,
        planetId: assignment.planetId,
        planetName: planet?.name ?? null,
        planetType: planet?.planetType ?? null,
        description: assignment.description,
        rewards: JSON.parse(assignment.rewardsJson || "{}"),
        startedAt: assignment.startedAt,
        completesAt: assignment.completesAt,
        claimedAt: assignment.claimedAt,
      };
    }),
    eligibleCards: cards,
  };
}

export async function startWorldOperation(input: {
  userId: string;
  type: WorldOperationType;
  planetId: string;
  cardInstanceId?: string;
  cardDefId?: string;
}) {
  const def = WORLD_OPERATION_DEFS[input.type];
  const planet = await db.planet.findUnique({ where: { id: input.planetId } });
  if (!planet || planet.userId !== input.userId) return { ok: false as const, error: "world not found" };
  if (planet.planetType === "barren" && input.type === "gather") {
    return { ok: false as const, error: "barren worlds cannot gather resources" };
  }
  if (def.requiresStructure && (!planet.structureType || planet.structureLevel <= 0)) {
    return { ok: false as const, error: "build a structure on this world before gathering" };
  }

  const headquarters = await ensureHeadquarters(input.userId);
  const operationCapacity = headquarters ? getWorldOperationCapacity(headquarters) : 1;
  const activeOperations = await db.assignment.count({
    where: {
      userId: input.userId,
      type: { in: WORLD_OPERATION_ASSIGNMENT_TYPES },
      status: { in: ["active", "ready"] },
    },
  });
  if (activeOperations >= operationCapacity) {
    return { ok: false as const, error: "world operation capacity is full; upgrade Command Spire" };
  }

  const existingPlanetOp = await db.assignment.findFirst({
    where: {
      userId: input.userId,
      planetId: input.planetId,
      type: { in: WORLD_OPERATION_ASSIGNMENT_TYPES },
      status: { in: ["active", "ready"] },
    },
  });
  if (existingPlanetOp) return { ok: false as const, error: "this world already has an active operation" };

  const cardResult = await findAvailableCardInstance({
    userId: input.userId,
    cardInstanceId: input.cardInstanceId,
    defId: input.cardDefId,
  });
  if (!cardResult.ok) return cardResult;

  const category = getOperationCardCategory(cardResult.instance.defId);
  if (!def.eligibleCategories.includes(category)) {
    return { ok: false as const, error: `${getCardName(cardResult.instance.defId)} cannot run ${def.verb.toLowerCase()} operations` };
  }

  const rewards = calculateWorldOperationRewards(input.type, planet, cardResult.instance.level);
  const now = new Date();
  const assignment = await db
    .$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          userId: input.userId,
          type: def.assignmentType,
          title: `${def.title}: ${planet.name}`,
          assetType: "card",
          cardDefId: cardResult.instance.defId,
          cardInstanceId: cardResult.instance.id,
          planetId: planet.id,
          description: def.description,
          rewardsJson: JSON.stringify(rewards),
          completesAt: new Date(now.getTime() + def.durationMinutes * 60 * 1000),
        },
      });

      const moved = await tx.cardInstance.updateMany({
        where: {
          id: cardResult.instance.id,
          userId: input.userId,
          location: "collection",
          status: "available",
          condition: { in: ["healthy", "fatigued"] },
        },
        data: {
          location: "assignment",
          status: "busy",
          currentAssignmentId: created.id,
          planetId: planet.id,
          metadataJson: JSON.stringify({
            operationType: input.type,
            operationTitle: def.title,
            planetId: planet.id,
          }),
          lastStateChangeAt: new Date(),
        },
      });
      if (moved.count !== 1) throw new Error("CARD_INSTANCE_LOCK_FAILED");

      return created;
    })
    .catch((error) => {
      if (error instanceof Error && error.message === "CARD_INSTANCE_LOCK_FAILED") {
        return null;
      }
      throw error;
    });

  if (!assignment) return { ok: false as const, error: "card is already busy" };
  return { ok: true as const, assignment, rewards };
}

export async function claimWorldOperation(userId: string, assignmentId: string) {
  const assignment = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) return { ok: false as const, error: "operation not found" };
  if (!WORLD_OPERATION_ASSIGNMENT_TYPES.includes(assignment.type)) {
    return { ok: false as const, error: "not a world operation" };
  }

  return claimAssignment(userId, assignmentId);
}

export async function listEligibleOperationCards(userId: string): Promise<OperationCardOption[]> {
  const instances = await db.cardInstance.findMany({
    where: {
      userId,
      location: "collection",
      status: "available",
      condition: { in: ["healthy", "fatigued"] },
    },
    orderBy: [{ level: "desc" }, { acquiredAt: "asc" }],
  });

  return instances
    .map((instance) => {
      const category = getOperationCardCategory(instance.defId);
      const eligibleOperations = Object.values(WORLD_OPERATION_DEFS)
        .filter((def) => def.eligibleCategories.includes(category))
        .map((def) => def.type);
      return {
        id: instance.id,
        defId: instance.defId,
        name: instance.displayName || getCardName(instance.defId),
        category,
        rarity: getCardRarity(instance.defId),
        level: instance.level,
        condition: instance.condition,
        eligibleOperations,
      };
    })
    .filter((card) => card.eligibleOperations.length > 0);
}

function calculateWorldOperationRewards(
  type: WorldOperationType,
  planet: { planetType: string; structureType: string | null; structureLevel: number },
  cardLevel: number
) {
  const levelBonus = Math.max(0, cardLevel - 1) * 3;
  const structureBonus = Math.max(0, planet.structureLevel) * 8;
  const resourceType = getPlanetResourceType(planet);

  if (type === "gather") {
    const amount = 20 + structureBonus + levelBonus;
    return {
      shards: 8,
      [resourceType ?? "plasma"]: amount,
      licenseProgress: { licenseId: "skirmish", amount: 1 },
    };
  }

  if (type === "survey") {
    return {
      shards: 18 + Math.floor(levelBonus / 2),
      quantumCores: planet.planetType === "anomaly" ? 18 + levelBonus : 8 + levelBonus,
      licenseProgress: { licenseId: "skirmish", amount: 1 },
    };
  }

  if (type === "scout") {
    return {
      shards: 16 + levelBonus,
      tritium: planet.planetType === "gas" ? 16 : 8,
      licenseProgress: { licenseId: "veteran", amount: 1 },
    };
  }

  return {
    shards: 24 + levelBonus,
    [resourceType ?? "crystals"]: 10 + Math.floor(structureBonus / 2),
    licenseProgress: { licenseId: "veteran", amount: 1 },
  };
}

function getPlanetResourceType(planet: { planetType: string; structureType: string | null }) {
  if (planet.structureType) {
    const def = STRUCTURE_DEFS[planet.structureType as StructureType];
    if (def) return def.resourceType;
  }
  return PLANET_RESOURCE[planet.planetType] ?? null;
}

function getOperationCardCategory(defId: string) {
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

async function markReadyWorldOperations(userId: string) {
  await db.assignment.updateMany({
    where: {
      userId,
      type: { in: WORLD_OPERATION_ASSIGNMENT_TYPES },
      status: "active",
      completesAt: { lte: new Date() },
    },
    data: { status: "ready" },
  });
}

function getWorldOperationCapacity(headquarters: { commandLevel: number; capitalLevel: number }) {
  return Math.max(1, headquarters.commandLevel + Math.floor(headquarters.capitalLevel / 2));
}

export function formatWorldOperationReward(rewards: Record<string, unknown>) {
  const parts: string[] = [];
  if (typeof rewards.shards === "number" && rewards.shards > 0) parts.push(`◈ ${rewards.shards}`);
  for (const key of Object.keys(RESOURCE_META) as ResourceType[]) {
    const value = rewards[key];
    if (typeof value === "number" && value > 0) {
      parts.push(`${RESOURCE_META[key].glyph} ${value}`);
    }
  }
  return parts.join("  ");
}
