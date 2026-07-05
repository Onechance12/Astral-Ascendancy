import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS } from "@/lib/world-cards";
import { fromLegacyCardDef, fromWorldCardDef } from "./legacy-adapter";
import type { CardRarity, CardScope, CardTemplate, GameplayReadiness } from "./card-template";
import type { CardKind, FactionId } from "@/game/five-by-five";

export const BATTLE_CARD_TEMPLATES: CardTemplate[] = CARD_DEFS.map(fromLegacyCardDef);
export const DOMAIN_CARD_TEMPLATES: CardTemplate[] = ALL_WORLD_CARDS.map(fromWorldCardDef);
export const CARD_TEMPLATES: CardTemplate[] = [...BATTLE_CARD_TEMPLATES, ...DOMAIN_CARD_TEMPLATES];

export function getCardTemplate(id: string): CardTemplate | undefined {
  return CARD_TEMPLATES.find((card) => card.identity.id === id);
}

function increment<K extends string>(record: Partial<Record<K, number>>, key: K): void {
  record[key] = (record[key] || 0) + 1;
}

export function cardTemplateSummary() {
  const bySet: Record<string, number> = {};
  const byFaction: Partial<Record<FactionId, number>> = {};
  const byRarity: Partial<Record<CardRarity, number>> = {};
  const byKind: Partial<Record<CardKind, number>> = {};
  const byReadiness: Partial<Record<GameplayReadiness, number>> = {};
  const byScope: Partial<Record<CardScope, number>> = {};

  for (const card of CARD_TEMPLATES) {
    increment(bySet, card.identity.set);
    increment(byFaction, card.identity.faction);
    increment(byRarity, card.identity.rarity);
    increment(byKind, card.gameplay.kind);
    increment(byReadiness, card.gameplay.readiness);
    for (const scope of card.identity.scopes) {
      increment(byScope, scope);
    }
  }

  return {
    total: CARD_TEMPLATES.length,
    battleCards: BATTLE_CARD_TEMPLATES.length,
    domainCards: DOMAIN_CARD_TEMPLATES.length,
    bySet,
    byFaction,
    byRarity,
    byKind,
    byReadiness,
    byScope,
  };
}
