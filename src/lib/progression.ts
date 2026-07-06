// Astral Ascendancy — Progression Engine
// Card drops, currency, quest progress, season XP, collection level, pity.

import { db } from "./db";
import { CARD_DEFS } from "./match-engine";
import { ALL_WORLD_CARDS } from "./world-cards";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Holo" | "Mythic" | "Singularity";

export const SHARD_COST: Record<Rarity, number> = {
  Common: 20,
  Uncommon: 40,
  Rare: 80,
  Holo: 160,
  Mythic: 320,
  Singularity: 640,
};

export const SHARD_DUST: Record<Rarity, number> = {
  Common: 5,
  Uncommon: 10,
  Rare: 20,
  Holo: 40,
  Mythic: 80,
  Singularity: 160,
};

// Drop weights by rarity (out of 1000)
const DROP_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: "Common", weight: 600 },
  { rarity: "Uncommon", weight: 250 },
  { rarity: "Rare", weight: 100 },
  { rarity: "Holo", weight: 40 },
  { rarity: "Mythic", weight: 9 },
  { rarity: "Singularity", weight: 1 },
];

const PITY_THRESHOLD = 10; // guaranteed Rare+ after 10 wins without one
const CARD_XP_WIN = 18;
const CARD_XP_LOSS = 8;
const CARD_XP_REPEAT_PLAY = 4;

export type DropResult = {
  defId: string;
  rarity: Rarity;
  isNew: boolean;
};

export type CardMasteryResult = {
  defId: string;
  xpGained: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  isNew: boolean;
};

export type CardConditionResult = {
  cardInstanceId: string;
  defId: string;
  previousCondition: string;
  condition: string;
  reason: "battle_fatigue" | "battle_injury";
  needsRecovery: boolean;
};

export type PackProgress = {
  pityCounter: number;
  nextRarePlusAt: number;
  winsUntilRarePlus: number;
};

function rollRarity(forceRarePlus = false): Rarity {
  if (forceRarePlus) {
    const rarePlus = DROP_WEIGHTS.filter((d) =>
      ["Rare", "Holo", "Mythic", "Singularity"].includes(d.rarity)
    );
    const total = rarePlus.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * total;
    for (const d of rarePlus) {
      r -= d.weight;
      if (r <= 0) return d.rarity;
    }
    return "Rare";
  }
  const total = DROP_WEIGHTS.reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const d of DROP_WEIGHTS) {
    r -= d.weight;
    if (r <= 0) return d.rarity;
  }
  return "Common";
}

function pickCardOfRarity(rarity: Rarity, factionId?: string): string {
  // Include world cards (planet/development/crew) in the drop pool
  let battlePool = CARD_DEFS.filter((c) => c.rarity === rarity);
  if (factionId) battlePool = battlePool.filter((c) => c.faction === factionId || c.faction === "quantum");
  if (battlePool.length === 0) battlePool = CARD_DEFS.filter((c) => c.rarity === rarity);
  const worldPool = ALL_WORLD_CARDS.filter((c) => c.rarity === rarity);
  const pool = [...battlePool, ...worldPool];
  if (pool.length === 0) return CARD_DEFS[0].defId;
  return pool[Math.floor(Math.random() * pool.length)].defId;
}

// Grant a card to a user. Returns defId + isNew.
export async function grantCard(
  userId: string,
  defId: string,
  source: string
): Promise<{ defId: string; isNew: boolean }> {
  const existing = await db.userCard.findUnique({
    where: { userId_defId: { userId, defId } },
  });
  if (existing) {
    await db.userCard.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });
    await db.cardInstance.create({
      data: {
        userId,
        defId,
        source,
        xp: existing.xp,
        level: existing.level,
      },
    });
    return { defId, isNew: false };
  }
  const card = await db.userCard.create({
    data: { userId, defId, count: 1, source },
  });
  await db.cardInstance.create({
    data: {
      userId,
      defId,
      source,
      xp: card.xp,
      level: card.level,
      acquiredAt: card.acquiredAt,
    },
  });
  // bump collection level for new unique
  await db.commander.update({
    where: { userId },
    data: { collectionLevel: { increment: 1 } },
  });
  return { defId, isNew: true };
}

// Roll a post-match drop. Returns null if no drop this match.
export async function rollMatchDrop(
  userId: string,
  won: boolean
): Promise<DropResult | null> {
  // win = 70% drop chance, loss = 30%
  const chance = won ? 0.7 : 0.3;
  if (Math.random() > chance) return null;

  // check pity
  const commander = await db.commander.findUnique({ where: { userId } });
  if (!commander) return null;

  const pityTriggered = won && commander.pityCounter >= PITY_THRESHOLD - 1;
  const rarity = rollRarity(pityTriggered);
  const defId = pickCardOfRarity(rarity);

  // update pity counter: reset on Rare+, else increment on win
  const isRarePlus = ["Rare", "Holo", "Mythic", "Singularity"].includes(rarity);
  if (won) {
    await db.commander.update({
      where: { userId },
      data: {
        pityCounter: isRarePlus ? 0 : { increment: 1 },
      },
    });
  }

  const result = await grantCard(userId, defId, "drop");
  return { defId, rarity, isNew: result.isNew };
}

// Grant Aether Shards
export async function grantShards(userId: string, amount: number): Promise<void> {
  await db.commander.update({
    where: { userId },
    data: { shards: { increment: amount } },
  });
}

// Grant season XP + auto-tier-up (every 100 XP = 1 tier)
export async function grantSeasonXp(userId: string, amount: number): Promise<void> {
  const cmdr = await db.commander.findUnique({ where: { userId } });
  if (!cmdr) return;
  const newXp = cmdr.seasonXp + amount;
  const newTier = Math.floor(newXp / 100);
  await db.commander.update({
    where: { userId },
    data: { seasonXp: newXp, seasonTier: Math.max(cmdr.seasonTier, newTier) },
  });
}

export function cardLevelForXp(xp: number): number {
  if (xp < 40) return 1;
  if (xp < 100) return 2;
  if (xp < 180) return 3;
  if (xp < 300) return 4;
  if (xp < 460) return 5;
  return 6 + Math.floor((xp - 460) / 220);
}

export async function grantCardMasteryXp(
  userId: string,
  cardsPlayed: string[],
  won: boolean
): Promise<CardMasteryResult[]> {
  const validDefs = new Set([...CARD_DEFS.map((card) => card.defId), ...ALL_WORLD_CARDS.map((card) => card.defId)]);
  const playCounts = new Map<string, number>();
  for (const defId of cardsPlayed.slice(0, 30)) {
    if (typeof defId !== "string" || !validDefs.has(defId)) continue;
    playCounts.set(defId, (playCounts.get(defId) ?? 0) + 1);
  }

  const results: CardMasteryResult[] = [];
  for (const [defId, count] of playCounts) {
    let card = await db.userCard.findUnique({
      where: { userId_defId: { userId, defId } },
    });
    let isNew = false;
    if (!card) {
      await grantCard(userId, defId, "battle_mastery");
      card = await db.userCard.findUnique({
        where: { userId_defId: { userId, defId } },
      });
      isNew = true;
    }
    if (!card) continue;

    const xpGained = (won ? CARD_XP_WIN : CARD_XP_LOSS) + Math.min(12, Math.max(0, count - 1) * CARD_XP_REPEAT_PLAY);
    const totalXp = card.xp + xpGained;
    const level = cardLevelForXp(totalXp);
    const updated = await db.userCard.update({
      where: { id: card.id },
      data: {
        xp: totalXp,
        level,
        matchesPlayed: { increment: 1 },
        lastPlayedAt: new Date(),
      },
    });
    results.push({
      defId,
      xpGained,
      totalXp: updated.xp,
      level: updated.level,
      leveledUp: updated.level > card.level,
      isNew,
    });
  }

  return results;
}

// ---------- Quest progress ----------
export type QuestTrigger = {
  type: string; // win | deploy | cast | faction_win | capture | campaign
  factionId?: string;
  count?: number;
};

// Progress all active (uncompleted) quests for a user matching a trigger.
export async function progressQuests(userId: string, trigger: QuestTrigger): Promise<void> {
  const userQuests = await db.userQuest.findMany({
    where: { userId, completed: false, claimed: false },
    include: { quest: true },
  });
  for (const uq of userQuests) {
    const q = uq.quest;
    if (q.type !== trigger.type) continue;
    if (q.factionId && trigger.factionId && q.factionId !== trigger.factionId) continue;
    const inc = trigger.count ?? 1;
    const newProgress = Math.min(uq.progress + inc, q.target);
    const completed = newProgress >= q.target;
    await db.userQuest.update({
      where: { id: uq.id },
      data: { progress: newProgress, completed },
    });
  }
}

// Claim a completed quest's rewards
export async function claimQuest(userId: string, userQuestId: string): Promise<boolean> {
  const uq = await db.userQuest.findUnique({
    where: { id: userQuestId },
    include: { quest: true },
  });
  if (!uq || uq.userId !== userId || !uq.completed || uq.claimed) return false;
  if (uq.quest.rewardShards > 0) await grantShards(userId, uq.quest.rewardShards);
  if (uq.quest.rewardCardDefId) await grantCard(userId, uq.quest.rewardCardDefId, "quest");
  await db.userQuest.update({
    where: { id: userQuestId },
    data: { claimed: true },
  });
  return true;
}

// Ensure a user has 3 daily quests assigned (regenerate if none active today)
export async function ensureDailyQuests(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const active = await db.userQuest.findMany({
    where: {
      userId,
      expiresAt: { gte: today },
      claimed: false,
    },
    include: { quest: true },
  });
  const activeDailies = active.filter((uq) => uq.quest.kind === "daily");
  if (activeDailies.length >= 3) return;

  // pick 3 random daily quests not already assigned
  const allDailies = await db.quest.findMany({ where: { kind: "daily" } });
  const existingIds = new Set(activeDailies.map((uq) => uq.questId));
  const available = allDailies.filter((q) => !existingIds.has(q.id));
  // shuffle + take 3
  const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3 - activeDailies.length);
  for (const q of shuffled) {
    await db.userQuest.create({
      data: {
        userId,
        questId: q.id,
        expiresAt: tomorrow,
      },
    });
  }
}

// ---------- Operation progress ----------
export async function progressOperation(userId: string, type: string, count = 1): Promise<void> {
  const ops = await db.operation.findMany({
    where: { active: true, type, endsAt: { gt: new Date() } },
  });
  for (const op of ops) {
    let prog = await db.operationProgress.findUnique({
      where: { userId_operationId: { userId, operationId: op.id } },
    });
    if (!prog) {
      prog = await db.operationProgress.create({
        data: { userId, operationId: op.id },
      });
    }
    if (prog.completed) continue;
    const newProgress = Math.min(prog.progress + count, op.target);
    const completed = newProgress >= op.target;
    await db.operationProgress.update({
      where: { id: prog.id },
      data: { progress: newProgress, completed },
    });
  }
}

export async function claimOperation(userId: string, operationId: string): Promise<boolean> {
  const prog = await db.operationProgress.findUnique({
    where: { userId_operationId: { userId, operationId } },
    include: { operation: true },
  });
  if (!prog || !prog.completed || prog.claimed || prog.operation.type !== "rescue") return false;
  const rewardIds: string[] = JSON.parse(prog.operation.rewardCardDefIds);
  for (const defId of rewardIds) await grantCard(userId, defId, "operation");
  if (prog.operation.rewardShards > 0) await grantShards(userId, prog.operation.rewardShards);
  await db.operationProgress.update({
    where: { id: prog.id },
    data: { claimed: true },
  });
  return true;
}

// ---------- The big one: process a finished match's rewards ----------
export type MatchOutcome = {
  userId: string;
  won: boolean;
  factionId: string;
  mode: string; // conquest | campaign | multiplayer
  deployedCount: number; // for "deploy" quests
  castCount: number; // for "cast" quests
  cardsPlayed?: string[];
};

export async function processMatchRewards(outcome: MatchOutcome): Promise<{
  drop: DropResult | null;
  shards: number;
  seasonXp: number;
  dailyBonus: boolean;
  cardMastery: CardMasteryResult[];
  cardConditions: CardConditionResult[];
  packProgress: PackProgress;
}> {
  // Check for daily login bonus (first match of the day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMatches = await db.matchRecord.findFirst({
    where: { userId: outcome.userId, playedAt: { gte: today } },
  });
  const isFirstOfDay = !todayMatches;
  const dailyBonus = isFirstOfDay ? 100 : 0;

  // 1. Shards: win=50, loss=20 (campaign halves to avoid farming) + daily bonus
  const shardBase = outcome.won ? 50 : 20;
  const shards = (outcome.mode === "campaign" ? Math.floor(shardBase / 2) : shardBase) + dailyBonus;
  await grantShards(outcome.userId, shards);

  // 2. Season XP: win=100, loss=40 (campaign win = 60) + daily bonus
  const xpBase = outcome.won ? 100 : 40;
  const seasonXp = (outcome.mode === "campaign" ? Math.floor(xpBase * 0.6) : xpBase) + (isFirstOfDay ? 50 : 0);
  await grantSeasonXp(outcome.userId, seasonXp);

  // 2b. Faction resources: a small amount of the player's faction resource on wins
  const factionResourceMap: Record<string, string> = {
    solari: "plasma",
    voidborn: "biomass",
    crystalline: "crystals",
    reavers: "tritium",
    quantum: "quantumCores",
  };
  const resType = factionResourceMap[outcome.factionId];
  if (resType && outcome.won) {
    const resAmount = outcome.mode === "campaign" ? 3 : 5;
    await db.commander.update({
      where: { userId: outcome.userId },
      data: { [resType]: { increment: resAmount } } as any,
    });
  }

  // 3. Card drop
  const drop = await rollMatchDrop(outcome.userId, outcome.won);

  // 3b. Card mastery: played cards gain persistent XP.
  const cardMastery = await grantCardMasteryXp(outcome.userId, outcome.cardsPlayed ?? [], outcome.won);

  // 3c. Living-card condition: results should feed recovery/training loops.
  const cardConditions = await applyPostMatchCardConditions(outcome.userId, outcome.cardsPlayed ?? [], outcome.won);

  // 4. Quest progress (skip for campaign mode — campaigns have their own rewards)
  if (outcome.mode !== "campaign") {
    await progressQuests(outcome.userId, {
      type: "win",
      factionId: outcome.factionId,
      count: outcome.won ? 1 : 0,
    });
    if (outcome.won) {
      await progressQuests(outcome.userId, {
        type: "faction_win",
        factionId: outcome.factionId,
      });
    }
    await progressQuests(outcome.userId, { type: "deploy", count: outcome.deployedCount });
    await progressQuests(outcome.userId, { type: "cast", count: outcome.castCount });

    // 5. Operation progress: a win progresses "rescue"-type ops
    if (outcome.won) {
      await progressOperation(outcome.userId, "rescue", 1);
    }
  }

  const commander = await db.commander.findUnique({ where: { userId: outcome.userId } });
  const pityCounter = commander?.pityCounter ?? 0;

  return {
    drop,
    shards,
    seasonXp,
    dailyBonus: isFirstOfDay,
    cardMastery,
    cardConditions,
    packProgress: {
      pityCounter,
      nextRarePlusAt: PITY_THRESHOLD,
      winsUntilRarePlus: Math.max(0, PITY_THRESHOLD - pityCounter),
    },
  };
}

async function applyPostMatchCardConditions(
  userId: string,
  cardsPlayed: string[],
  won: boolean
): Promise<CardConditionResult[]> {
  const playCounts = new Map<string, number>();
  for (const defId of cardsPlayed.slice(0, 30)) {
    if (typeof defId !== "string") continue;
    playCounts.set(defId, (playCounts.get(defId) ?? 0) + 1);
  }

  const results: CardConditionResult[] = [];
  let injuryAssigned = won;

  for (const [defId, count] of playCounts) {
    const candidates = await db.cardInstance.findMany({
      where: {
        userId,
        defId,
        location: "collection",
        status: "available",
        condition: { in: ["healthy", "fatigued"] },
      },
      orderBy: [{ condition: "asc" }, { level: "desc" }, { acquiredAt: "asc" }],
      take: Math.max(1, count),
    });

    for (const card of candidates) {
      const nextCondition = !injuryAssigned && !won ? "injured" : "fatigued";
      const reason: CardConditionResult["reason"] = nextCondition === "injured" ? "battle_injury" : "battle_fatigue";
      injuryAssigned = injuryAssigned || nextCondition === "injured";
      if (card.condition === nextCondition) continue;

      const updated = await db.cardInstance.update({
        where: { id: card.id },
        data: {
          condition: nextCondition,
          lastStateChangeAt: new Date(),
          metadataJson: JSON.stringify({
            ...(safeJson(card.metadataJson) as Record<string, unknown>),
            lastBattleCondition: reason,
          }),
        },
      });

      results.push({
        cardInstanceId: updated.id,
        defId: updated.defId,
        previousCondition: card.condition,
        condition: updated.condition,
        reason,
        needsRecovery: ["injured", "critical", "fallen", "damaged", "restoring"].includes(updated.condition),
      });
    }
  }

  return results;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

// ---------- Crafting ----------
export async function craftCard(userId: string, defId: string): Promise<boolean> {
  const def = CARD_DEFS.find((c) => c.defId === defId);
  if (!def) return false;
  const cost = SHARD_COST[def.rarity as Rarity];
  const cmdr = await db.commander.findUnique({ where: { userId } });
  if (!cmdr || cmdr.shards < cost) return false;
  await db.commander.update({
    where: { userId },
    data: { shards: { decrement: cost } },
  });
  await grantCard(userId, defId, "craft");
  return true;
}

export async function dismantleCard(userId: string, defId: string, count: number): Promise<number> {
  const def = CARD_DEFS.find((c) => c.defId === defId);
  if (!def) return 0;
  const card = await db.userCard.findUnique({
    where: { userId_defId: { userId, defId } },
  });
  if (!card || card.count < count) return 0;
  const dust = SHARD_DUST[def.rarity as Rarity] * count;
  const newCount = card.count - count;
  if (newCount <= 0) {
    await db.userCard.delete({ where: { id: card.id } });
  } else {
    await db.userCard.update({
      where: { id: card.id },
      data: { count: newCount },
    });
  }
  await grantShards(userId, dust);
  return dust;
}
