import type { Petition } from "@prisma/client";
import { ensureCardInstancesForUser } from "@/lib/card-instances";
import { db } from "@/lib/db";
import { ensureHeadquarters } from "@/lib/headquarters";
import { ensureStructureContainersForUser, listStructureEligibleCards } from "@/lib/structure-containers";
import { listEligibleOperationCards } from "@/lib/world-operations";

type PetitionTone = "urgent" | "opportunity" | "warning" | "request" | "neutral";

type PetitionAction =
  | "open_headquarters"
  | "open_domain"
  | "open_operations"
  | "open_pack";

type PetitionCandidate = {
  generatedKey: string;
  sourceType: string;
  sourceId?: string | null;
  title: string;
  body: string;
  tone: PetitionTone;
  actionType: PetitionAction;
  actionPayload?: Record<string, unknown>;
  priority: number;
  expiresAt?: Date | null;
};

const CARE_ASSIGNMENT_TYPES = ["medical_recovery", "training_drill"];

export async function listPetitions(userId: string) {
  await ensurePetitionsForUser(userId);

  const petitions = await db.petition.findMany({
    where: { userId, status: "open" },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 8,
  });

  return petitions.map(formatPetition);
}

export async function resolvePetition(input: {
  userId: string;
  petitionId: string;
  action: "approve" | "dismiss";
}) {
  const petition = await db.petition.findUnique({ where: { id: input.petitionId } });
  if (!petition || petition.userId !== input.userId) {
    return { ok: false as const, error: "petition not found" };
  }
  if (petition.status !== "open") {
    return { ok: false as const, error: "petition is no longer open" };
  }

  const updated = await db.petition.update({
    where: { id: petition.id },
    data: {
      status: input.action === "approve" ? "approved" : "dismissed",
      resolvedAt: new Date(),
    },
  });

  return {
    ok: true as const,
    petition: formatPetition(updated),
  };
}

async function ensurePetitionsForUser(userId: string) {
  await ensureCardInstancesForUser(userId);
  await ensureStructureContainersForUser(userId);
  await markReadyAssignments(userId);

  const candidates = await buildPetitionCandidates(userId);
  const activeKeys = candidates.map((candidate) => candidate.generatedKey);

  await expireStaleOpenPetitions(userId, activeKeys);

  if (candidates.length === 0) return;

  const existing = await db.petition.findMany({
    where: { userId, generatedKey: { in: activeKeys } },
  });
  const existingByKey = new Map(existing.map((petition) => [petition.generatedKey, petition]));

  for (const candidate of candidates) {
    const current = existingByKey.get(candidate.generatedKey);
    const data = toPetitionData(userId, candidate);
    if (!current) {
      await db.petition.create({ data });
      continue;
    }

    if (current.status === "open" || current.status === "expired") {
      await db.petition.update({
        where: { id: current.id },
        data: {
          ...data,
          status: "open",
          resolvedAt: null,
        },
      });
    }
  }
}

async function buildPetitionCandidates(userId: string): Promise<PetitionCandidate[]> {
  const headquarters = await ensureHeadquarters(userId);
  if (!headquarters) return [];

  const [
    commander,
    readyAssignments,
    activeCareAssignments,
    injuredCards,
    trainableCards,
    planets,
    activeWorldOperations,
    structures,
    structureEligibleCards,
    operationEligibleCards,
  ] = await Promise.all([
    db.commander.findUnique({ where: { userId } }),
    db.assignment.findMany({
      where: { userId, status: "ready" },
      orderBy: { completesAt: "asc" },
      take: 4,
    }),
    db.assignment.findMany({
      where: {
        userId,
        type: { in: CARE_ASSIGNMENT_TYPES },
        status: { in: ["active", "ready"] },
      },
    }),
    db.cardInstance.findMany({
      where: {
        userId,
        status: "available",
        location: "collection",
        condition: { in: ["injured", "critical", "fallen", "damaged", "restoring"] },
      },
      orderBy: [{ condition: "desc" }, { level: "desc" }],
      take: 3,
    }),
    db.cardInstance.findMany({
      where: {
        userId,
        status: "available",
        location: "collection",
        condition: { in: ["healthy", "fatigued"] },
      },
      orderBy: [{ level: "desc" }, { acquiredAt: "asc" }],
      take: 3,
    }),
    db.planet.findMany({ where: { userId }, orderBy: { slot: "asc" }, take: 4 }),
    db.assignment.findMany({
      where: {
        userId,
        type: { in: ["world_gather", "world_survey", "world_scout", "world_secure"] },
        status: { in: ["active", "ready"] },
      },
      select: { planetId: true },
    }),
    db.structureInstance.findMany({ where: { userId, status: "active" }, orderBy: [{ planetId: "asc" }, { slot: "asc" }] }),
    listStructureEligibleCards(userId),
    listEligibleOperationCards(userId),
  ]);

  const candidates: PetitionCandidate[] = [];

  for (const assignment of readyAssignments) {
    candidates.push({
      generatedKey: `ready-assignment-${assignment.id}`,
      sourceType: "assignment",
      sourceId: assignment.id,
      title: `Claim ${assignment.title}`,
      body: "A completed order is waiting for command review. Claim it before the next deployment stacks up.",
      tone: "opportunity",
      actionType: CARE_ASSIGNMENT_TYPES.includes(assignment.type) ? "open_headquarters" : "open_operations",
      actionPayload: { assignmentId: assignment.id, assignmentType: assignment.type },
      priority: 100,
    });
  }

  if (headquarters.capitalLevel <= 1) {
    candidates.push({
      generatedKey: "hq-capital-priority",
      sourceType: "headquarters",
      sourceId: headquarters.id,
      title: "Set Homeworld Command Priorities",
      body: `${headquarters.name} is still a young command center. Choose what the capital should become before the sector expands too far.`,
      tone: "request",
      actionType: "open_headquarters",
      actionPayload: { section: "facilities" },
      priority: 82,
    });
  }

  const activeRecovery = activeCareAssignments.filter((assignment) => assignment.type === "medical_recovery").length;
  const activeTraining = activeCareAssignments.filter((assignment) => assignment.type === "training_drill").length;

  if (injuredCards.length > 0 && headquarters.infirmaryLevel <= 0) {
    candidates.push({
      generatedKey: "hq-build-infirmary",
      sourceType: "headquarters",
      sourceId: headquarters.id,
      title: "Authorize a Homeworld Infirmary",
      body: `${injuredCards.length} card${injuredCards.length === 1 ? "" : "s"} need medical support. Recovery and revival should become a real base system now.`,
      tone: "urgent",
      actionType: "open_headquarters",
      actionPayload: { facilityKey: "infirmary" },
      priority: 96,
    });
  }

  if (injuredCards.length > 0 && headquarters.infirmaryLevel > activeRecovery) {
    const card = injuredCards[0];
    candidates.push({
      generatedKey: `medical-recovery-${card.id}`,
      sourceType: "card",
      sourceId: card.id,
      title: `${card.displayName ?? getReadableDefId(card.defId)} Requests Treatment`,
      body: `${card.condition} assets should not sit in the collection. Approve recovery so this card can return to future battles.`,
      tone: "urgent",
      actionType: "open_headquarters",
      actionPayload: { section: "medical", cardInstanceId: card.id },
      priority: card.condition === "fallen" ? 98 : 90,
    });
  }

  if (trainableCards.length > 0 && headquarters.trainingLevel <= 0) {
    candidates.push({
      generatedKey: "hq-build-training",
      sourceType: "headquarters",
      sourceId: headquarters.id,
      title: "Open the Training Grounds",
      body: "Idle cards need a place to grow between battles. Training turns collection depth into real long-term power.",
      tone: "request",
      actionType: "open_headquarters",
      actionPayload: { facilityKey: "training" },
      priority: 78,
    });
  }

  if (trainableCards.length > 0 && headquarters.trainingLevel > activeTraining) {
    const card = trainableCards[0];
    candidates.push({
      generatedKey: `training-rotation-${card.id}`,
      sourceType: "card",
      sourceId: card.id,
      title: `${card.displayName ?? getReadableDefId(card.defId)} Requests Training`,
      body: "A ready card is available for a timed drill. Approve the rotation to gain mastery XP and make progression feel alive.",
      tone: "request",
      actionType: "open_headquarters",
      actionPayload: { section: "training", cardInstanceId: card.id },
      priority: 72,
    });
  }

  const busyPlanetIds = new Set(activeWorldOperations.map((operation) => operation.planetId).filter(Boolean));
  const idleWorld = planets.find((planet) => !busyPlanetIds.has(planet.id));
  if (idleWorld && operationEligibleCards.length > 0) {
    candidates.push({
      generatedKey: `world-operation-${idleWorld.id}`,
      sourceType: "world",
      sourceId: idleWorld.id,
      title: `${idleWorld.name} Awaits Orders`,
      body: "This world can host a gather, survey, scout, or secure order. Send a card so planets feel like living production fronts.",
      tone: "opportunity",
      actionType: "open_domain",
      actionPayload: { planetId: idleWorld.id, section: "operations" },
      priority: idleWorld.structureLevel > 0 ? 76 : 66,
    });
  }

  const occupiedByStructure = await getStructureOccupancy(userId);
  const openStructure = structures.find((structure) => (occupiedByStructure.get(structure.id) ?? 0) < structure.capacity);
  if (openStructure && structureEligibleCards.length > 0) {
    candidates.push({
      generatedKey: `structure-staffing-${openStructure.id}`,
      sourceType: "structure",
      sourceId: openStructure.id,
      title: `${openStructure.name} Has Open Stations`,
      body: "Structures should become card containers, not passive buildings. Station a card to make the world feel staffed and owned.",
      tone: "opportunity",
      actionType: "open_domain",
      actionPayload: { structureId: openStructure.id, section: "structures" },
      priority: 70,
    });
  }

  if (commander && commander.shards >= 100) {
    candidates.push({
      generatedKey: `pack-ready-${Math.floor(commander.shards / 100)}`,
      sourceType: "reward",
      title: "Signal Pack Available",
      body: "You have enough shards to open a pack. New cards can become units, worlds, structures, training projects, or future petitions.",
      tone: "opportunity",
      actionType: "open_pack",
      actionPayload: { cost: 100 },
      priority: 62,
    });
  }

  return candidates.sort((a, b) => b.priority - a.priority).slice(0, 12);
}

async function getStructureOccupancy(userId: string) {
  const stationed = await db.cardInstance.groupBy({
    by: ["structureKey"],
    where: { userId, location: "structure", structureKey: { not: null } },
    _count: { _all: true },
  });

  const occupied = new Map<string, number>();
  for (const row of stationed) {
    if (row.structureKey) occupied.set(row.structureKey, row._count._all);
  }
  return occupied;
}

async function markReadyAssignments(userId: string) {
  await db.assignment.updateMany({
    where: {
      userId,
      status: "active",
      completesAt: { lte: new Date() },
    },
    data: { status: "ready" },
  });
}

async function expireStaleOpenPetitions(userId: string, activeKeys: string[]) {
  await db.petition.updateMany({
    where: {
      userId,
      status: "open",
      generatedKey: activeKeys.length > 0 ? { notIn: activeKeys } : undefined,
    },
    data: {
      status: "expired",
      resolvedAt: new Date(),
    },
  });
}

function toPetitionData(userId: string, candidate: PetitionCandidate) {
  return {
    userId,
    sourceType: candidate.sourceType,
    sourceId: candidate.sourceId ?? null,
    title: candidate.title,
    body: candidate.body,
    tone: candidate.tone,
    status: "open",
    actionType: candidate.actionType,
    actionPayloadJson: JSON.stringify(candidate.actionPayload ?? {}),
    priority: candidate.priority,
    generatedKey: candidate.generatedKey,
    expiresAt: candidate.expiresAt ?? null,
  };
}

function formatPetition(petition: Petition) {
  return {
    id: petition.id,
    sourceType: petition.sourceType,
    sourceId: petition.sourceId,
    title: petition.title,
    body: petition.body,
    tone: petition.tone,
    status: petition.status,
    actionType: petition.actionType,
    actionPayload: parseJson(petition.actionPayloadJson),
    priority: petition.priority,
    createdAt: petition.createdAt,
    expiresAt: petition.expiresAt,
  };
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getReadableDefId(defId: string) {
  return defId
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
