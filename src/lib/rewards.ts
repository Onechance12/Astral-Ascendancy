import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS } from "@/lib/world-cards";
import { grantCard, grantSeasonXp, grantShards, type Rarity } from "@/lib/progression";
import type { ResourceType } from "@/lib/resources";

export type RewardPayload = {
  shards?: number;
  seasonXp?: number;
  cards?: string[];
  resources?: Partial<Record<ResourceType, number>>;
  packRarity?: Rarity;
};

export type SerializedReward = {
  id: string;
  sourceType: string;
  sourceId: string | null;
  title: string;
  description: string | null;
  reward: RewardPayload;
  revealType: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
};

export type RewardCenter = {
  streak: {
    current: number;
    longest: number;
    lastClaimedAt: string | null;
    canClaimDaily: boolean;
    nextDailyReward: RewardPayload;
    nextDailyDay: number;
  };
  readyRewards: SerializedReward[];
};

type DbReward = Awaited<ReturnType<typeof db.rewardInbox.findFirst>>;

const DAILY_TABLE: Array<{ day: number; shards: number; seasonXp: number; packRarity?: Rarity; revealType: string }> = [
  { day: 1, shards: 40, seasonXp: 20, revealType: "daily" },
  { day: 2, shards: 55, seasonXp: 25, revealType: "daily" },
  { day: 3, shards: 70, seasonXp: 30, revealType: "daily" },
  { day: 4, shards: 85, seasonXp: 35, revealType: "rare" },
  { day: 5, shards: 105, seasonXp: 45, revealType: "rare" },
  { day: 6, shards: 130, seasonXp: 55, revealType: "mythic" },
  { day: 7, shards: 170, seasonXp: 75, packRarity: "Rare", revealType: "singularity" },
];

export async function getRewardCenter(userId: string): Promise<RewardCenter> {
  const [streak, readyRewards] = await Promise.all([
    db.loginStreak.findUnique({ where: { userId } }),
    db.rewardInbox.findMany({
      where: { userId, status: "ready", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const current = streak?.currentStreak ?? 0;
  const nextDailyDay = nextStreakDay(streak?.lastClaimedAt ?? null, current);

  return {
    streak: {
      current,
      longest: streak?.longestStreak ?? 0,
      lastClaimedAt: streak?.lastClaimedAt?.toISOString() ?? null,
      canClaimDaily: !isSameUtcDay(streak?.lastClaimedAt ?? null, new Date()),
      nextDailyReward: dailyRewardForDay(nextDailyDay),
      nextDailyDay,
    },
    readyRewards: readyRewards.map(serializeReward),
  };
}

export async function createDailyLoginReward(userId: string): Promise<SerializedReward | null> {
  const now = new Date();
  const todayKey = utcDayKey(now);
  const existing = await db.rewardInbox.findUnique({
    where: { userId_sourceType_sourceId: { userId, sourceType: "daily_login", sourceId: todayKey } },
  });
  if (existing) return serializeReward(existing);

  const streak = await db.loginStreak.findUnique({ where: { userId } });
  if (isSameUtcDay(streak?.lastClaimedAt ?? null, now)) return null;

  const newStreak = isYesterdayUtc(streak?.lastClaimedAt ?? null, now)
    ? (streak?.currentStreak ?? 0) + 1
    : 1;
  const longestStreak = Math.max(streak?.longestStreak ?? 0, newStreak);
  const reward = dailyRewardForDay(newStreak);
  const revealType = dailyRevealTypeForDay(newStreak);

  await db.loginStreak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: newStreak,
      longestStreak,
      lastClaimedAt: now,
    },
    update: {
      currentStreak: newStreak,
      longestStreak,
      lastClaimedAt: now,
    },
  });

  const row = await db.rewardInbox.create({
    data: {
      userId,
      sourceType: "daily_login",
      sourceId: todayKey,
      title: `Day ${newStreak} Command Signal`,
      description: describeDailyReward(newStreak, reward),
      rewardJson: JSON.stringify(reward),
      revealType,
    },
  });

  return serializeReward(row);
}

export async function claimReward(userId: string, rewardId: string) {
  const reward = await db.rewardInbox.findUnique({ where: { id: rewardId } });
  if (!reward || reward.userId !== userId || reward.status !== "ready") {
    return { ok: false as const, error: "reward unavailable" };
  }
  if (reward.expiresAt && reward.expiresAt <= new Date()) {
    await db.rewardInbox.update({ where: { id: reward.id }, data: { status: "expired" } });
    return { ok: false as const, error: "reward expired" };
  }

  const payload = parseRewardPayload(reward.rewardJson);
  if (payload.shards && payload.shards > 0) await grantShards(userId, payload.shards);
  if (payload.seasonXp && payload.seasonXp > 0) await grantSeasonXp(userId, payload.seasonXp);
  if (payload.resources) await grantResources(userId, payload.resources);

  const cards: Array<{ defId: string; isNew: boolean; name: string }> = [];
  for (const defId of payload.cards ?? []) {
    const result = await grantCard(userId, defId, reward.sourceType);
    cards.push({ ...result, name: cardName(defId) });
  }

  await db.rewardInbox.update({
    where: { id: reward.id },
    data: { status: "claimed", claimedAt: new Date() },
  });

  return {
    ok: true as const,
    reward: serializeReward(reward),
    granted: {
      shards: payload.shards ?? 0,
      seasonXp: payload.seasonXp ?? 0,
      resources: payload.resources ?? {},
      cards,
      packRarity: payload.packRarity,
    },
  };
}

export function dailyRewardForDay(streakDay: number): RewardPayload {
  const tableRow = DAILY_TABLE[(Math.max(1, streakDay) - 1) % DAILY_TABLE.length];
  const cycle = Math.floor((Math.max(1, streakDay) - 1) / DAILY_TABLE.length);
  return {
    shards: tableRow.shards + cycle * 20,
    seasonXp: tableRow.seasonXp + cycle * 10,
    packRarity: tableRow.packRarity,
  };
}

function dailyRevealTypeForDay(streakDay: number) {
  return DAILY_TABLE[(Math.max(1, streakDay) - 1) % DAILY_TABLE.length].revealType;
}

function nextStreakDay(lastClaimedAt: Date | null, currentStreak: number) {
  if (isYesterdayUtc(lastClaimedAt, new Date())) return currentStreak + 1;
  if (isSameUtcDay(lastClaimedAt, new Date())) return Math.max(1, currentStreak);
  return 1;
}

function serializeReward(reward: NonNullable<DbReward>): SerializedReward {
  return {
    id: reward.id,
    sourceType: reward.sourceType,
    sourceId: reward.sourceId,
    title: reward.title,
    description: reward.description,
    reward: parseRewardPayload(reward.rewardJson),
    revealType: reward.revealType,
    status: reward.status,
    createdAt: reward.createdAt.toISOString(),
    expiresAt: reward.expiresAt?.toISOString() ?? null,
  };
}

function parseRewardPayload(value: string): RewardPayload {
  try {
    const parsed = JSON.parse(value || "{}") as RewardPayload;
    return {
      shards: safePositiveInt(parsed.shards),
      seasonXp: safePositiveInt(parsed.seasonXp),
      packRarity: parsed.packRarity,
      cards: Array.isArray(parsed.cards) ? parsed.cards.filter((card): card is string => typeof card === "string") : undefined,
      resources: normalizeResources(parsed.resources),
    };
  } catch {
    return {};
  }
}

function normalizeResources(resources: RewardPayload["resources"]) {
  if (!resources || typeof resources !== "object") return undefined;
  const normalized: Partial<Record<ResourceType, number>> = {};
  for (const key of ["plasma", "biomass", "crystals", "tritium", "quantumCores"] as const) {
    const value = safePositiveInt(resources[key]);
    if (value) normalized[key] = value;
  }
  return normalized;
}

async function grantResources(userId: string, resources: Partial<Record<ResourceType, number>>) {
  const data: Partial<Record<ResourceType, { increment: number }>> = {};
  for (const key of ["plasma", "biomass", "crystals", "tritium", "quantumCores"] as const) {
    const amount = safePositiveInt(resources[key]);
    if (amount) data[key] = { increment: amount };
  }
  if (Object.keys(data).length === 0) return;
  await db.commander.update({ where: { userId }, data });
}

function safePositiveInt(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function describeDailyReward(streakDay: number, reward: RewardPayload) {
  const parts: string[] = [];
  if (reward.shards) parts.push(`${reward.shards} shards`);
  if (reward.seasonXp) parts.push(`${reward.seasonXp} season XP`);
  if (reward.packRarity) parts.push(`${reward.packRarity}+ pack signal`);
  return `Login streak day ${streakDay}: ${parts.join(", ")}.`;
}

function cardName(defId: string) {
  return CARD_DEFS.find((card) => card.defId === defId)?.name ?? ALL_WORLD_CARDS.find((card) => card.defId === defId)?.name ?? defId;
}

function utcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isSameUtcDay(a: Date | null, b: Date) {
  if (!a) return false;
  return utcDayKey(a) === utcDayKey(b);
}

function isYesterdayUtc(a: Date | null, b: Date) {
  if (!a) return false;
  const yesterday = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate() - 1));
  return utcDayKey(a) === utcDayKey(yesterday);
}
