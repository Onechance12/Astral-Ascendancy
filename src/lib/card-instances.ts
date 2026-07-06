import { db } from "@/lib/db";

export type CardLocation =
  | "collection"
  | "deck"
  | "assignment"
  | "headquarters"
  | "world"
  | "structure"
  | "ship"
  | "recovery"
  | "training"
  | "medical"
  | "repair"
  | "captured"
  | "missing";

export type CardStatus = "available" | "busy" | "unavailable";

export type CardCondition =
  | "healthy"
  | "fatigued"
  | "injured"
  | "critical"
  | "fallen"
  | "damaged"
  | "restoring";

const ASSIGNABLE_CONDITIONS = new Set<CardCondition>(["healthy", "fatigued"]);

export async function ensureCardInstancesForUser(userId: string) {
  const [summaryCards, existingInstances] = await Promise.all([
    db.userCard.findMany({ where: { userId }, orderBy: { acquiredAt: "asc" } }),
    db.cardInstance.findMany({ where: { userId }, select: { defId: true } }),
  ]);

  const existingCounts = new Map<string, number>();
  for (const instance of existingInstances) {
    existingCounts.set(instance.defId, (existingCounts.get(instance.defId) ?? 0) + 1);
  }

  const creates: Array<{
    userId: string;
    defId: string;
    source: string;
    xp: number;
    level: number;
    acquiredAt: Date;
    updatedAt: Date;
  }> = [];

  for (const card of summaryCards) {
    const missing = Math.max(0, card.count - (existingCounts.get(card.defId) ?? 0));
    for (let index = 0; index < missing; index++) {
      const now = new Date();
      creates.push({
        userId,
        defId: card.defId,
        source: card.source,
        xp: card.xp,
        level: card.level,
        acquiredAt: card.acquiredAt,
        updatedAt: now,
      });
    }
  }

  if (creates.length > 0) {
    await db.cardInstance.createMany({ data: creates });
  }

  return creates.length;
}

export async function getCardInstanceOverview(userId: string) {
  await ensureCardInstancesForUser(userId);
  const instances = await db.cardInstance.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { location: "asc" }, { acquiredAt: "asc" }],
  });

  const summary = {
    total: instances.length,
    available: 0,
    busy: 0,
    unavailable: 0,
    injured: 0,
    recovering: 0,
    assigned: 0,
    byLocation: {} as Record<string, number>,
    byCondition: {} as Record<string, number>,
  };

  for (const instance of instances) {
    if (instance.status === "available") summary.available += 1;
    if (instance.status === "busy") summary.busy += 1;
    if (instance.status === "unavailable") summary.unavailable += 1;
    if (["injured", "critical", "fallen"].includes(instance.condition)) summary.injured += 1;
    if (["recovery", "medical", "repair"].includes(instance.location)) summary.recovering += 1;
    if (instance.location === "assignment") summary.assigned += 1;
    summary.byLocation[instance.location] = (summary.byLocation[instance.location] ?? 0) + 1;
    summary.byCondition[instance.condition] = (summary.byCondition[instance.condition] ?? 0) + 1;
  }

  return { instances, summary };
}

export async function findAvailableCardInstance(input: {
  userId: string;
  cardInstanceId?: string;
  defId?: string;
}) {
  await ensureCardInstancesForUser(input.userId);

  const instance = input.cardInstanceId
    ? await db.cardInstance.findUnique({ where: { id: input.cardInstanceId } })
    : input.defId
      ? await db.cardInstance.findFirst({
          where: {
            userId: input.userId,
            defId: input.defId,
            status: "available",
            location: "collection",
            condition: { in: Array.from(ASSIGNABLE_CONDITIONS) },
          },
          orderBy: { acquiredAt: "asc" },
        })
      : null;

  if (!instance || instance.userId !== input.userId) return { ok: false as const, error: "card instance not found" };
  if (instance.status !== "available" || instance.location !== "collection") {
    return { ok: false as const, error: "card is already busy" };
  }
  if (!ASSIGNABLE_CONDITIONS.has(instance.condition as CardCondition)) {
    return { ok: false as const, error: "card is not healthy enough for assignment" };
  }

  return { ok: true as const, instance };
}
