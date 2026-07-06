import { db } from "@/lib/db";
import { findAvailableCardInstance } from "@/lib/card-instances";

export type AssignmentType = "resource" | "study" | "rescue" | "training" | "defense" | "expedition" | "project";

export type AssignmentReward = {
  shards?: number;
  plasma?: number;
  biomass?: number;
  crystals?: number;
  tritium?: number;
  quantumCores?: number;
  licenseProgress?: { licenseId: string; amount: number };
};

export const ASSIGNMENT_DEFS: Record<
  "resource" | "study" | "rescue",
  {
    title: string;
    assetType: "crew" | "card" | "deck";
    durationMinutes: number;
    description: string;
    rewards: AssignmentReward;
  }
> = {
  resource: {
    title: "Resource Gathering",
    assetType: "crew",
    durationMinutes: 30,
    description: "Commit a crew or specialist card to gather resources from a claimed world.",
    rewards: { shards: 15, plasma: 20, licenseProgress: { licenseId: "skirmish", amount: 1 } },
  },
  study: {
    title: "World Study",
    assetType: "card",
    durationMinutes: 45,
    description: "Send a science or study card to survey world traits and build research progress.",
    rewards: { shards: 20, quantumCores: 10, licenseProgress: { licenseId: "skirmish", amount: 1 } },
  },
  rescue: {
    title: "Rescue Operation",
    assetType: "deck",
    durationMinutes: 60,
    description: "Deploy a battle deck to recover crew and relic fragments. The deck is unavailable until it returns.",
    rewards: { shards: 50, tritium: 15, licenseProgress: { licenseId: "veteran", amount: 1 } },
  },
};

export const DECK_LICENSE_DEFS = [
  {
    licenseId: "starter",
    deckTier: "starter",
    displayName: "Starter License",
    target: 1,
    unlockedByDefault: true,
    reward: "Starter Faction Pack",
  },
  {
    licenseId: "skirmish",
    deckTier: "skirmish",
    displayName: "Skirmish License",
    target: 2,
    unlockedByDefault: false,
    reward: "Skirmish Pack",
  },
  {
    licenseId: "veteran",
    deckTier: "veteran",
    displayName: "Veteran License",
    target: 3,
    unlockedByDefault: false,
    reward: "Veteran Pack",
  },
  {
    licenseId: "ascendant",
    deckTier: "ascendant",
    displayName: "Ascendant License",
    target: 5,
    unlockedByDefault: false,
    reward: "Ascendant Pack",
  },
  {
    licenseId: "mythic",
    deckTier: "mythic",
    displayName: "Mythic License",
    target: 8,
    unlockedByDefault: false,
    reward: "Mythic Pack",
  },
  {
    licenseId: "open_war",
    deckTier: "open_war",
    displayName: "Open War License",
    target: 10,
    unlockedByDefault: false,
    reward: "Open War Cache",
  },
];

export async function ensureDeckLicenses(userId: string) {
  await Promise.all(
    DECK_LICENSE_DEFS.map((def) =>
      db.deckLicense.upsert({
        where: { userId_licenseId: { userId, licenseId: def.licenseId } },
        update: {},
        create: {
          userId,
          licenseId: def.licenseId,
          deckTier: def.deckTier,
          target: def.target,
          unlocked: def.unlockedByDefault,
          progress: def.unlockedByDefault ? def.target : 0,
          unlockedAt: def.unlockedByDefault ? new Date() : null,
        },
      })
    )
  );
}

export async function listDeckLicenses(userId: string) {
  await ensureDeckLicenses(userId);
  const rows = await db.deckLicense.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return DECK_LICENSE_DEFS.map((def) => {
    const row = rows.find((license) => license.licenseId === def.licenseId);
    return {
      ...def,
      unlocked: row?.unlocked ?? false,
      progress: row?.progress ?? 0,
      target: row?.target ?? def.target,
      unlockedAt: row?.unlockedAt ?? null,
      rewardClaimed: row?.rewardClaimed ?? false,
    };
  });
}

export async function isDeckBusy(userId: string, deckId: string) {
  const assignment = await db.assignment.findFirst({
    where: {
      userId,
      deckId,
      status: { in: ["active", "ready"] },
    },
    orderBy: { completesAt: "asc" },
  });
  return assignment;
}

export async function listAssignments(userId: string) {
  await markReadyAssignments(userId);
  return db.assignment.findMany({
    where: { userId, status: { in: ["active", "ready"] } },
    orderBy: [{ status: "asc" }, { completesAt: "asc" }],
  });
}

export async function createAssignment(input: {
  userId: string;
  type: "resource" | "study" | "rescue";
  cardDefId?: string;
  cardInstanceId?: string;
  deckId?: string;
  planetId?: string;
}) {
  const def = ASSIGNMENT_DEFS[input.type];
  let planetId = input.planetId;
  let cardDefId = input.cardDefId;
  let cardInstanceId = input.cardInstanceId;

  if (input.type === "rescue") {
    if (!input.deckId) return { ok: false as const, error: "deck required" };
    const deck = await db.deck.findUnique({ where: { id: input.deckId } });
    if (!deck || deck.userId !== input.userId) return { ok: false as const, error: "deck not found" };
    const busy = await isDeckBusy(input.userId, input.deckId);
    if (busy) return { ok: false as const, error: "deck is already assigned" };
  }

  if ((input.type === "resource" || input.type === "study") && !planetId) {
    const planet = await db.planet.findFirst({
      where: { userId: input.userId },
      orderBy: { slot: "asc" },
    });
    planetId = planet?.id;
  }

  if ((input.type === "resource" || input.type === "study") && planetId) {
    const planet = await db.planet.findUnique({ where: { id: planetId } });
    if (!planet || planet.userId !== input.userId) return { ok: false as const, error: "world not found" };
  }

  if ((input.type === "resource" || input.type === "study") && (input.cardInstanceId || input.cardDefId)) {
    const cardResult = await findAvailableCardInstance({
      userId: input.userId,
      cardInstanceId: input.cardInstanceId,
      defId: input.cardDefId,
    });
    if (!cardResult.ok) return cardResult;
    cardDefId = cardResult.instance.defId;
    cardInstanceId = cardResult.instance.id;

    const busyCardConditions = cardDefId
      ? [{ cardInstanceId }, { cardDefId, cardInstanceId: null }]
      : [{ cardInstanceId }];
    const busyCard = await db.assignment.findFirst({
      where: {
        userId: input.userId,
        OR: busyCardConditions,
        status: { in: ["active", "ready"] },
      },
    });
    if (busyCard) return { ok: false as const, error: "card is already assigned" };
  }

  const now = new Date();
  const assignment = await db
    .$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: def.title,
          assetType: def.assetType,
          cardDefId,
          cardInstanceId,
          deckId: input.deckId,
          planetId,
          description: def.description,
          rewardsJson: JSON.stringify(def.rewards),
          completesAt: new Date(now.getTime() + def.durationMinutes * 60 * 1000),
        },
      });

      if (cardInstanceId) {
        const moved = await tx.cardInstance.updateMany({
          where: {
            id: cardInstanceId,
            userId: input.userId,
            location: "collection",
            status: "available",
            condition: { in: ["healthy", "fatigued"] },
          },
          data: {
            location: "assignment",
            status: "busy",
            currentAssignmentId: created.id,
            lastStateChangeAt: new Date(),
          },
        });
        if (moved.count !== 1) throw new Error("CARD_INSTANCE_LOCK_FAILED");
      }

      return created;
    })
    .catch((error) => {
      if (error instanceof Error && error.message === "CARD_INSTANCE_LOCK_FAILED") {
        return null;
      }
      throw error;
    });

  if (!assignment) return { ok: false as const, error: "card is already busy" };

  return { ok: true as const, assignment };
}

export async function claimAssignment(userId: string, assignmentId: string) {
  await markReadyAssignments(userId);
  const assignment = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) return { ok: false as const, error: "assignment not found" };
  if (assignment.status !== "ready") return { ok: false as const, error: "assignment is not ready" };

  const rewards = JSON.parse(assignment.rewardsJson || "{}") as AssignmentReward;
  await db.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id: assignment.id },
      data: { status: "claimed", claimedAt: new Date() },
    });

    await tx.commander.update({
      where: { userId },
      data: {
        shards: { increment: rewards.shards ?? 0 },
        plasma: { increment: rewards.plasma ?? 0 },
        biomass: { increment: rewards.biomass ?? 0 },
        crystals: { increment: rewards.crystals ?? 0 },
        tritium: { increment: rewards.tritium ?? 0 },
        quantumCores: { increment: rewards.quantumCores ?? 0 },
      },
    });

    if (rewards.licenseProgress) {
      const def = DECK_LICENSE_DEFS.find((license) => license.licenseId === rewards.licenseProgress?.licenseId);
      if (def) {
        const row = await tx.deckLicense.upsert({
          where: { userId_licenseId: { userId, licenseId: def.licenseId } },
          update: { progress: { increment: rewards.licenseProgress.amount } },
          create: {
            userId,
            licenseId: def.licenseId,
            deckTier: def.deckTier,
            target: def.target,
            progress: rewards.licenseProgress.amount,
            unlocked: false,
          },
        });
        if (!row.unlocked && row.progress >= row.target) {
          await tx.deckLicense.update({
            where: { userId_licenseId: { userId, licenseId: def.licenseId } },
            data: { unlocked: true, unlockedAt: new Date(), progress: row.target },
          });
        }
      }
    }

    await tx.cardInstance.updateMany({
      where: { userId, currentAssignmentId: assignment.id },
      data: {
        location: "collection",
        status: "available",
        currentAssignmentId: null,
        lastStateChangeAt: new Date(),
      },
    });
  });

  return { ok: true as const, rewards };
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
