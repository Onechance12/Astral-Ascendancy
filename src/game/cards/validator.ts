import type {
  CardScope,
  CardTemplate,
  CardTemplateAudit,
  CardTemplateIssue,
  GameplayReadiness,
} from "./card-template";
import type { CardKind } from "@/game/five-by-five";

function issue(
  card: CardTemplate,
  severity: CardTemplateIssue["severity"],
  field: string,
  message: string
): CardTemplateIssue {
  return { cardId: card.identity.id || "(missing-id)", severity, field, message };
}

function emptyReadiness(): Record<GameplayReadiness, number> {
  return { playable: 0, rules_partial: 0, design_only: 0 };
}

function emptyScope(): Record<CardScope, number> {
  return { battle: 0, domain: 0, commander: 0, collection: 0, cosmetic: 0 };
}

export function validateCardTemplate(card: CardTemplate): CardTemplateIssue[] {
  const issues: CardTemplateIssue[] = [];

  if (!card.identity.id.trim()) issues.push(issue(card, "error", "identity.id", "Card id is required."));
  if (!card.identity.name.trim()) issues.push(issue(card, "error", "identity.name", "Card name is required."));
  if (card.gameplay.cost.resonance < 0) issues.push(issue(card, "error", "gameplay.cost.resonance", "Resonance cost cannot be negative."));

  if (card.gameplay.kind === "Entity") {
    if (card.gameplay.stats.hp <= 0) issues.push(issue(card, "error", "gameplay.stats.hp", "Entity cards need positive HP."));
    if (!card.gameplay.board.canAttack) issues.push(issue(card, "warning", "gameplay.board.canAttack", "Entity card cannot attack."));
  }

  if (card.gameplay.kind !== "Entity" && card.gameplay.kind !== "Structure") {
    if (card.gameplay.stats.attack > 0 || card.gameplay.stats.hp > 0) {
      issues.push(issue(card, "warning", "gameplay.stats", "Non-entity utility cards should express power through effects, not raw stats."));
    }
  }

  if (card.identity.scopes.includes("battle") && card.gameplay.board.placement.length === 0) {
    issues.push(issue(card, "error", "gameplay.board.placement", "Battle card needs at least one placement rule."));
  }

  if (card.gameplay.readiness === "design_only" && card.authoring.missingImplementation.length === 0) {
    issues.push(issue(card, "warning", "authoring.missingImplementation", "Design-only card should explain missing implementation."));
  }

  for (const [index, effect] of card.gameplay.effects.entries()) {
    if (!effect.rulesText.trim()) {
      issues.push(issue(card, "warning", `gameplay.effects.${index}.rulesText`, "Effect has an empty rules text."));
    }
    if (!effect.implemented) {
      issues.push(issue(card, "info", `gameplay.effects.${index}.implemented`, "Effect is documented but not fully engine-backed yet."));
    }
  }

  if (
    ["Attachment", "Relic", "Skill"].includes(card.gameplay.kind) &&
    card.gameplay.equipment.modifiesSlots.length === 0 &&
    card.authoring.missingImplementation.length === 0
  ) {
    issues.push(issue(card, "warning", "gameplay.equipment", "Equipment-style card should define modified slots or missing implementation."));
  }

  if (card.gameplay.kind === "World" && !card.gameplay.board.modifiesWorld) {
    issues.push(issue(card, "warning", "gameplay.board.modifiesWorld", "World card should mark modifiesWorld."));
  }

  if (card.gameplay.kind === "Structure" && !card.gameplay.board.modifiesStructure && !card.gameplay.board.occupiesSector) {
    issues.push(issue(card, "warning", "gameplay.board", "Structure card should modify structures or occupy a sector."));
  }

  if (!card.presentation.animationKey.trim()) {
    issues.push(issue(card, "warning", "presentation.animationKey", "Card needs an animation key for the game client."));
  }
  if (!card.presentation.vfxProfile.trim()) {
    issues.push(issue(card, "warning", "presentation.vfxProfile", "Card needs a VFX profile for battle and reveal scenes."));
  }
  if (!card.presentation.soundProfile.trim()) {
    issues.push(issue(card, "warning", "presentation.soundProfile", "Card needs a sound profile hook."));
  }

  if (card.economy.statBudget <= 0) issues.push(issue(card, "error", "economy.statBudget", "Card stat budget must be positive."));
  if (card.economy.maxDeckCopies <= 0) issues.push(issue(card, "error", "economy.maxDeckCopies", "Card max deck copies must be positive."));

  return issues;
}

export function auditCardTemplates(cards: CardTemplate[]): CardTemplateAudit {
  const byReadiness = emptyReadiness();
  const byScope = emptyScope();
  const byKind: Partial<Record<CardKind, number>> = {};
  const issues: CardTemplateIssue[] = [];
  const ids = new Map<string, number>();

  for (const card of cards) {
    byReadiness[card.gameplay.readiness] += 1;
    byKind[card.gameplay.kind] = (byKind[card.gameplay.kind] || 0) + 1;
    for (const scope of card.identity.scopes) {
      byScope[scope] += 1;
    }
    ids.set(card.identity.id, (ids.get(card.identity.id) || 0) + 1);
    issues.push(...validateCardTemplate(card));
  }

  for (const [id, count] of ids.entries()) {
    if (count > 1) {
      issues.push({
        cardId: id,
        severity: "error",
        field: "identity.id",
        message: `Duplicate card id appears ${count} times.`,
      });
    }
  }

  return {
    total: cards.length,
    byReadiness,
    byScope,
    byKind,
    issues,
  };
}
