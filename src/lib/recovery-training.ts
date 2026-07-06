import type { Prisma } from "@prisma/client";
import { ensureCardInstancesForUser } from "@/lib/card-instances";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { ensureHeadquarters } from "@/lib/headquarters";
import { getWorldCardDef } from "@/lib/world-cards";

export type CareQueueType = "medical_recovery" | "training_drill";

type CareCard = {
  id: string;
  defId: string;
  name: string;
  rarity: string;
  level: number;
  xp: number;
  condition: string;
  location: string;
};

const CARE_TYPES: CareQueueType[] = ["medical_recovery", "training_drill"];
const TRAINING_CONDITIONS = new Set(["healthy", "fatigued"]);
const RECOVERY_CONDITIONS = new Set(["fatigued", "injured", "critical", "fallen", "damaged", "restoring"]);

export async function listRecoveryTrainingState(userId: string) {
  await ensureCardInstancesForUser(userId);
  await markReadyCareAssignments(userId);

  const headquarters = await ensureHeadquarters(userId);
  if (!headquarters) return null;

  const [assignments, cards] = await Promise.all([
    db.assignment.findMany({
      where: {
        userId,
        type: { in: CARE_TYPES },
        status: { in: ["active", "ready"] },
      },
      orderBy: [{ status: "desc" }, { completesAt: "asc" }],
    }),
    db.cardInstance.findMany({
      where: { userId },
      orderBy: [{ condition: "asc" }, { level: "desc" }, { acquiredAt: "asc" }],
    }),
  ]);

  const activeMedical = assignments.filter((assignment) => assignment.type === "medical_recovery").length;
  const activeTraining = assignments.filter((assignment) => assignment.type === "training_drill").length;
  const cardMap = new Map(cards.map((card) => [card.id, card]));

  return {
    capacities: {
      recoveryBeds: headquarters.infirmaryLevel,
      recoveryUsed: activeMedical,
      trainingSlots: headquarters.trainingLevel,
      trainingUsed: activeTraining,
    },
    queues: assignments.map((assignment) => {
      const card = assignment.cardInstanceId ? cardMap.get(assignment.cardInstanceId) : null;
      return {
        id: assignment.id,
        type: assignment.type as CareQueueType,
        title: assignment.title,
        status: assignment.status,
        cardInstanceId: assignment.cardInstanceId,
        cardDefId: assignment.cardDefId,
        cardName: card ? getCardName(card.defId, card.displayName) : assignment.cardDefId ? getCardName(assignment.cardDefId) : null,
        cardLevel: card?.level ?? null,
        cardCondition: card?.condition ?? null,
        rewards: JSON.parse(assignment.rewardsJson || "{}"),
        startedAt: assignment.startedAt,
        completesAt: assignment.completesAt,
      };
    }),
    recoveryCandidates: cards
      .filter((card) => card.userId === userId && card.location === "collection" && card.status === "available" && RECOVERY_CONDITIONS.has(card.condition))
      .map(toCareCard),
    trainingCandidates: cards
      .filter((card) => card.userId === userId && card.location === "collection" && card.status === "available" && TRAINING_CONDITIONS.has(card.condition))
      .map(toCareCard),
  };
}

export async function startRecovery(input: { userId: string; cardInstanceId: string }) {
  const headquarters = await ensureHeadquarters(input.userId);
  if (!headquarters) return { ok: false as const, error: "headquarters not found" };
  if (headquarters.infirmaryLevel <= 0) return { ok: false as const, error: "build or upgrade the infirmary first" };

  const active = await db.assignment.count({
    where: { userId: input.userId, type: "medical_recovery", status: { in: ["active", "ready"] } },
  });
  if (active >= headquarters.infirmaryLevel) return { ok: false as const, error: "all infirmary beds are occupied" };

  const card = await db.cardInstance.findUnique({ where: { id: input.cardInstanceId } });
  if (!card || card.userId !== input.userId) return { ok: false as const, error: "card not found" };
  if (card.location !== "collection" || card.status !== "available") return { ok: false as const, error: "card is busy" };
  if (!RECOVERY_CONDITIONS.has(card.condition)) return { ok: false as const, error: "card does not need recovery" };
  if (card.condition === "fallen" && headquarters.infirmaryLevel < 3) {
    return { ok: false as const, error: "fallen cards require Infirmary level 3 for revival" };
  }

  const durationMinutes = getRecoveryMinutes(card.condition, headquarters.infirmaryLevel);
  const reward = { recoveredCondition: "healthy", previousCondition: card.condition };
  const now = new Date();

  const assignment = await db.$transaction(async (tx) => {
    const created = await tx.assignment.create({
      data: {
        userId: input.userId,
        type: "medical_recovery",
        title: `Medical Recovery: ${getCardName(card.defId, card.displayName)}`,
        assetType: "card",
        cardDefId: card.defId,
        cardInstanceId: card.id,
        description: "Homeworld infirmary treatment. The card is unavailable until discharged.",
        rewardsJson: JSON.stringify(reward),
        completesAt: new Date(now.getTime() + durationMinutes * 60 * 1000),
      },
    });

    const moved = await tx.cardInstance.updateMany({
      where: { id: card.id, userId: input.userId, location: "collection", status: "available" },
      data: {
        location: "medical",
        status: "busy",
        condition: "restoring",
        currentAssignmentId: created.id,
        metadataJson: JSON.stringify({
          careType: "medical_recovery",
          previousCondition: card.condition,
          targetCondition: "healthy",
        }),
        lastStateChangeAt: new Date(),
      },
    });
    if (moved.count !== 1) throw new Error("CARD_LOCK_FAILED");
    return created;
  }).catch((error) => {
    if (error instanceof Error && error.message === "CARD_LOCK_FAILED") return null;
    throw error;
  });

  if (!assignment) return { ok: false as const, error: "card is already busy" };
  return { ok: true as const, assignment };
}

export async function startTraining(input: { userId: string; cardInstanceId: string }) {
  const headquarters = await ensureHeadquarters(input.userId);
  if (!headquarters) return { ok: false as const, error: "headquarters not found" };
  if (headquarters.trainingLevel <= 0) return { ok: false as const, error: "build or upgrade training grounds first" };

  const active = await db.assignment.count({
    where: { userId: input.userId, type: "training_drill", status: { in: ["active", "ready"] } },
  });
  if (active >= headquarters.trainingLevel) return { ok: false as const, error: "all training slots are occupied" };

  const card = await db.cardInstance.findUnique({ where: { id: input.cardInstanceId } });
  if (!card || card.userId !== input.userId) return { ok: false as const, error: "card not found" };
  if (card.location !== "collection" || card.status !== "available") return { ok: false as const, error: "card is busy" };
  if (!TRAINING_CONDITIONS.has(card.condition)) return { ok: false as const, error: "card is not healthy enough to train" };

  const xp = getTrainingXp(headquarters.trainingLevel, card.level);
  const durationMinutes = getTrainingMinutes(headquarters.trainingLevel, card.level);
  const now = new Date();

  const assignment = await db.$transaction(async (tx) => {
    const created = await tx.assignment.create({
      data: {
        userId: input.userId,
        type: "training_drill",
        title: `Training Drill: ${getCardName(card.defId, card.displayName)}`,
        assetType: "card",
        cardDefId: card.defId,
        cardInstanceId: card.id,
        description: "Homeworld training. The card gains mastery XP when the drill is claimed.",
        rewardsJson: JSON.stringify({ cardXp: xp }),
        completesAt: new Date(now.getTime() + durationMinutes * 60 * 1000),
      },
    });

    const moved = await tx.cardInstance.updateMany({
      where: {
        id: card.id,
        userId: input.userId,
        location: "collection",
        status: "available",
        condition: { in: Array.from(TRAINING_CONDITIONS) },
      },
      data: {
        location: "training",
        status: "busy",
        currentAssignmentId: created.id,
        metadataJson: JSON.stringify({ careType: "training_drill", cardXp: xp }),
        lastStateChangeAt: new Date(),
      },
    });
    if (moved.count !== 1) throw new Error("CARD_LOCK_FAILED");
    return created;
  }).catch((error) => {
    if (error instanceof Error && error.message === "CARD_LOCK_FAILED") return null;
    throw error;
  });

  if (!assignment) return { ok: false as const, error: "card is already busy" };
  return { ok: true as const, assignment };
}

export async function claimCareAssignment(userId: string, assignmentId: string) {
  await markReadyCareAssignments(userId);
  const assignment = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) return { ok: false as const, error: "care assignment not found" };
  if (!CARE_TYPES.includes(assignment.type as CareQueueType)) return { ok: false as const, error: "not a care assignment" };
  if (assignment.status !== "ready") return { ok: false as const, error: "care assignment is not ready" };
  if (!assignment.cardInstanceId) return { ok: false as const, error: "missing card instance" };

  const rewards = JSON.parse(assignment.rewardsJson || "{}") as { cardXp?: number; recoveredCondition?: string };

  const result = await db.$transaction(async (tx) => {
    const card = await tx.cardInstance.findUnique({ where: { id: assignment.cardInstanceId! } });
    if (!card || card.userId !== userId) throw new Error("CARD_NOT_FOUND");

    await tx.assignment.update({
      where: { id: assignment.id },
      data: { status: "claimed", claimedAt: new Date() },
    });

    if (assignment.type === "training_drill") {
      const xpGain = rewards.cardXp ?? 0;
      const totalXp = card.xp + xpGain;
      const newLevel = Math.max(card.level, 1 + Math.floor(totalXp / 100));
      await tx.cardInstance.update({
        where: { id: card.id },
        data: {
          xp: totalXp,
          level: newLevel,
          location: "collection",
          status: "available",
          condition: "fatigued",
          currentAssignmentId: null,
          metadataJson: "{}",
          lastStateChangeAt: new Date(),
        },
      });
      await syncUserCardMastery(tx, userId, card.defId, totalXp, newLevel);
      return { cardXp: xpGain, level: newLevel, condition: "fatigued" };
    }

    const recoveredCondition = rewards.recoveredCondition ?? "healthy";
    await tx.cardInstance.update({
      where: { id: card.id },
      data: {
        location: "collection",
        status: "available",
        condition: recoveredCondition,
        currentAssignmentId: null,
        metadataJson: "{}",
        lastStateChangeAt: new Date(),
      },
    });
    return { recoveredCondition };
  }).catch((error) => {
    if (error instanceof Error && error.message === "CARD_NOT_FOUND") return null;
    throw error;
  });

  if (!result) return { ok: false as const, error: "card not found" };
  return { ok: true as const, rewards: result };
}

async function markReadyCareAssignments(userId: string) {
  await db.assignment.updateMany({
    where: {
      userId,
      type: { in: CARE_TYPES },
      status: "active",
      completesAt: { lte: new Date() },
    },
    data: { status: "ready" },
  });
}

async function syncUserCardMastery(
  tx: Prisma.TransactionClient,
  userId: string,
  defId: string,
  totalXp: number,
  level: number
) {
  const existing = await tx.userCard.findUnique({ where: { userId_defId: { userId, defId } } });
  if (!existing) return;
  await tx.userCard.update({
    where: { id: existing.id },
    data: {
      xp: Math.max(existing.xp, totalXp),
      level: Math.max(existing.level, level),
    },
  });
}

function getRecoveryMinutes(condition: string, infirmaryLevel: number) {
  const base: Record<string, number> = {
    fatigued: 10,
    restoring: 15,
    damaged: 20,
    injured: 30,
    critical: 60,
    fallen: 120,
  };
  return Math.max(5, (base[condition] ?? 30) - infirmaryLevel * 5);
}

function getTrainingMinutes(trainingLevel: number, cardLevel: number) {
  return Math.max(10, 45 + cardLevel * 5 - trainingLevel * 5);
}

function getTrainingXp(trainingLevel: number, cardLevel: number) {
  return Math.max(15, 25 + trainingLevel * 8 - Math.max(0, cardLevel - 1) * 3);
}

function toCareCard(card: {
  id: string;
  defId: string;
  displayName: string | null;
  rarity?: string;
  level: number;
  xp: number;
  condition: string;
  location: string;
}) {
  return {
    id: card.id,
    defId: card.defId,
    name: getCardName(card.defId, card.displayName),
    rarity: getCardRarity(card.defId),
    level: card.level,
    xp: card.xp,
    condition: card.condition,
    location: card.location,
  } satisfies CareCard;
}

function getCardName(defId: string, displayName?: string | null) {
  return displayName ?? getWorldCardDef(defId)?.name ?? CARD_DEFS.find((card) => card.defId === defId)?.name ?? defId;
}

function getCardRarity(defId: string) {
  return getWorldCardDef(defId)?.rarity ?? CARD_DEFS.find((card) => card.defId === defId)?.rarity ?? "Common";
}
