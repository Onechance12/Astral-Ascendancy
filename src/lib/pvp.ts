import { CARD_DEFS, type CardDef, type CardType } from "@/lib/match-engine";

export type PvpQueueType = "ranked" | "unranked" | "friendly" | "training" | "event";
export type PvpDeckTier = "starter" | "skirmish" | "veteran" | "ascendant" | "mythic" | "open_war";

export type DeckPowerBreakdown = {
  score: number;
  tier: PvpDeckTier;
  tierName: string;
  version: "pvp-v1";
  cardCount: number;
  averageCardScore: number;
  reasons: string[];
  illegalFor: PvpDeckTier[];
  cards: Array<{
    defId: string;
    name: string;
    rarity: string;
    type: CardType;
    score: number;
  }>;
};

export type QueueValidation = {
  ok: boolean;
  queueType: PvpQueueType;
  requestedTier: PvpDeckTier;
  actualTier: PvpDeckTier;
  score: number;
  errors: string[];
  warnings: string[];
};

export const PVP_DECK_TIERS: Array<{
  id: PvpDeckTier;
  name: string;
  min: number;
  max: number;
  description: string;
}> = [
  { id: "starter", name: "Starter", min: 0, max: 599, description: "New-player safe decks with no serious progression pressure." },
  { id: "skirmish", name: "Skirmish", min: 600, max: 1199, description: "Early constructed decks with simple synergies." },
  { id: "veteran", name: "Veteran", min: 1200, max: 2199, description: "Evolved cards, relics, and faction skills start to matter." },
  { id: "ascendant", name: "Ascendant", min: 2200, max: 3599, description: "Advanced armor, skills, worlds, and high-synergy decks." },
  { id: "mythic", name: "Mythic", min: 3600, max: 5399, description: "Elite progression decks with strict matchmaking." },
  { id: "open_war", name: "Open War", min: 5400, max: Number.MAX_SAFE_INTEGER, description: "No cap. Anything goes by explicit opt-in." },
];

const RARITY_SCORE: Record<string, number> = {
  Common: 22,
  Uncommon: 34,
  Rare: 52,
  Holo: 78,
  Mythic: 118,
  Singularity: 170,
};

const TYPE_SCORE: Record<CardType, number> = {
  Entity: 18,
  Anomaly: 15,
  World: 24,
  Structure: 24,
  Attachment: 20,
  Science: 22,
  Project: 24,
  Skill: 34,
  Relic: 42,
  Evolution: 46,
};

const PROGRESSION_WORDS = [
  "evolve",
  "evolution",
  "mastery",
  "relic",
  "skill",
  "ascendant",
  "masterwork",
  "sidegrade",
  "field-test",
  "xp",
  "memory",
];

const TIER_ORDER: PvpDeckTier[] = ["starter", "skirmish", "veteran", "ascendant", "mythic", "open_war"];

export function analyzeDeckPower(cardDefIds: string[]): DeckPowerBreakdown {
  const cards = cardDefIds
    .map((defId) => CARD_DEFS.find((card) => card.defId === defId))
    .filter((card): card is CardDef => Boolean(card));

  const scoredCards = cards.map((card) => {
    const statScore = card.type === "Entity" ? card.attack * 7 + card.hp * 5 : 0;
    const costScore = Math.max(0, card.cost) * 8;
    const rarityScore = RARITY_SCORE[card.rarity] ?? 40;
    const typeScore = TYPE_SCORE[card.type] ?? 20;
    const text = `${card.name} ${card.text} ${card.lore ?? ""}`.toLowerCase();
    const progressionScore = PROGRESSION_WORDS.reduce((sum, word) => sum + (text.includes(word) ? 11 : 0), 0);
    const setPressure = card.catalogSet === "set004" ? 35 : card.catalogSet === "set003" ? 18 : card.catalogSet === "set002" ? 10 : 0;
    const score = rarityScore + typeScore + statScore + costScore + progressionScore + setPressure;

    return {
      defId: card.defId,
      name: card.name,
      rarity: card.rarity,
      type: card.type,
      score,
    };
  });

  const duplicatePressure = duplicatePowerPressure(cardDefIds);
  const synergyPressure = synergyPowerPressure(cards);
  const score = Math.round(scoredCards.reduce((sum, card) => sum + card.score, 0) + duplicatePressure + synergyPressure);
  const tier = getDeckTier(score);
  const illegalFor = TIER_ORDER.filter((candidate) => tierIndex(candidate) < tierIndex(tier));
  const reasons = buildDeckPowerReasons(cards, duplicatePressure, synergyPressure, tier);

  return {
    score,
    tier,
    tierName: tierDisplayName(tier),
    version: "pvp-v1",
    cardCount: cardDefIds.length,
    averageCardScore: scoredCards.length ? Math.round(score / scoredCards.length) : 0,
    reasons,
    illegalFor,
    cards: scoredCards,
  };
}

export function getDeckTier(score: number): PvpDeckTier {
  return PVP_DECK_TIERS.find((tier) => score >= tier.min && score <= tier.max)?.id ?? "open_war";
}

export function tierDisplayName(tier: PvpDeckTier): string {
  return PVP_DECK_TIERS.find((entry) => entry.id === tier)?.name ?? "Open War";
}

export function tierIndex(tier: PvpDeckTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function validateDeckForQueue(
  cardDefIds: string[],
  queueType: PvpQueueType,
  requestedTier?: PvpDeckTier
): QueueValidation {
  const analysis = analyzeDeckPower(cardDefIds);
  const targetTier = requestedTier ?? analysis.tier;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cardDefIds.length < 10) errors.push("Deck needs at least 10 cards.");
  if (cardDefIds.length > 30) errors.push("Deck is above the long-term PvP cap of 30 cards.");
  if (queueType === "ranked" && tierIndex(analysis.tier) > tierIndex(targetTier)) {
    errors.push(`This deck is ${analysis.tierName}, which is above the selected ${tierDisplayName(targetTier)} queue.`);
  }
  if (queueType === "ranked" && analysis.tier === "open_war" && targetTier !== "open_war") {
    errors.push("Open War decks must queue into Open War.");
  }
  if (queueType === "unranked" && Math.abs(tierIndex(analysis.tier) - tierIndex(targetTier)) > 1) {
    warnings.push("Casual matchmaking may be slow because this deck is far from the selected tier.");
  }

  return {
    ok: errors.length === 0,
    queueType,
    requestedTier: targetTier,
    actualTier: analysis.tier,
    score: analysis.score,
    errors,
    warnings,
  };
}

function duplicatePowerPressure(cardDefIds: string[]) {
  const counts = new Map<string, number>();
  for (const id of cardDefIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  let pressure = 0;
  for (const count of counts.values()) {
    if (count > 1) pressure += (count - 1) * 12;
    if (count > 3) pressure += (count - 3) * 25;
  }
  return pressure;
}

function synergyPowerPressure(cards: CardDef[]) {
  const factions = new Set(cards.map((card) => card.faction));
  const worlds = cards.filter((card) => card.type === "World").length;
  const structures = cards.filter((card) => card.type === "Structure").length;
  const attachments = cards.filter((card) => card.type === "Attachment").length;
  const rpgCards = cards.filter((card) => ["Skill", "Relic", "Evolution"].includes(card.type)).length;
  let pressure = 0;

  if (factions.size <= 2) pressure += 45;
  if (worlds >= 3 && structures >= 2) pressure += 70;
  if (attachments >= 3) pressure += 35;
  if (rpgCards >= 2) pressure += rpgCards * 45;

  return pressure;
}

function buildDeckPowerReasons(cards: CardDef[], duplicatePressure: number, synergyPressure: number, tier: PvpDeckTier) {
  const reasons: string[] = [`Tier: ${tierDisplayName(tier)}`];
  const rarePlus = cards.filter((card) => ["Rare", "Holo", "Mythic", "Singularity"].includes(card.rarity)).length;
  const rpgCards = cards.filter((card) => ["Skill", "Relic", "Evolution"].includes(card.type)).length;
  const worlds = cards.filter((card) => card.type === "World").length;
  const structures = cards.filter((card) => card.type === "Structure").length;

  if (rarePlus) reasons.push(`${rarePlus} Rare+ cards`);
  if (rpgCards) reasons.push(`${rpgCards} progression cards`);
  if (worlds || structures) reasons.push(`${worlds} worlds / ${structures} structures`);
  if (duplicatePressure) reasons.push("duplicate consistency pressure");
  if (synergyPressure) reasons.push("synergy pressure");

  return reasons;
}

