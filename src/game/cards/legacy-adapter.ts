import type { CardDef } from "@/lib/match-engine";
import type { WorldCardDef } from "@/lib/world-cards";
import type {
  CardEffectTemplate,
  CardRarity,
  CardSetId,
  CardTemplate,
  EquipmentSlot,
  GameplayReadiness,
  PlacementRule,
} from "./card-template";
import { RARITY_ECONOMY } from "./card-template";
import type {
  CardKind,
  CreatureClass,
  DamageSchool,
  DefenseProfile,
  FactionId,
  WorldType,
} from "@/game/five-by-five";

const FACTIONS: FactionId[] = [
  "solari",
  "voidborn",
  "synthari",
  "verdant",
  "crimson",
  "astral",
  "neutral",
  "crystalline",
  "reavers",
  "quantum",
];

const RARITIES: CardRarity[] = ["Common", "Uncommon", "Rare", "Holo", "Mythic", "Singularity"];
const SETS: CardSetId[] = ["prototype", "set001", "set002", "set003", "set004", "domain"];

function normalizeFaction(faction?: string): FactionId {
  const lower = (faction || "neutral").toLowerCase();
  return FACTIONS.includes(lower as FactionId) ? (lower as FactionId) : "neutral";
}

function normalizeRarity(rarity?: string): CardRarity {
  const direct = RARITIES.find((item) => item.toLowerCase() === (rarity || "").toLowerCase());
  return direct || "Common";
}

function normalizeSet(set?: string): CardSetId {
  return SETS.includes(set as CardSetId) ? (set as CardSetId) : "prototype";
}

function normalizeWorld(world?: string): WorldType {
  const lower = (world || "").toLowerCase();
  if (lower === "anomaly") return "astral";
  if (lower === "machine") return "machine";
  if (lower === "verdant") return "verdant";
  if (lower === "crucible") return "crucible";
  if (lower === "corrupted") return "corrupted";
  if (lower === "star" || lower === "organic" || lower === "mineral" || lower === "gas" || lower === "barren" || lower === "astral") {
    return lower;
  }
  return "barren";
}

function inferWorldAffinity(text: string, explicit?: string): WorldType {
  if (explicit) return normalizeWorld(explicit);
  const lower = text.toLowerCase();
  if (lower.includes("star") || lower.includes("solar") || lower.includes("dawn")) return "star";
  if (lower.includes("organic") || lower.includes("biomass")) return "organic";
  if (lower.includes("machine") || lower.includes("drone") || lower.includes("circuit")) return "machine";
  if (lower.includes("verdant") || lower.includes("spore") || lower.includes("root")) return "verdant";
  if (lower.includes("crucible") || lower.includes("forge") || lower.includes("ember")) return "crucible";
  if (lower.includes("astral") || lower.includes("rift") || lower.includes("blink")) return "astral";
  if (lower.includes("mineral") || lower.includes("crystal")) return "mineral";
  if (lower.includes("gas") || lower.includes("storm")) return "gas";
  if (lower.includes("corrupt") || lower.includes("void")) return "corrupted";
  return "barren";
}

function normalizeDamageSchool(attackType?: string): DamageSchool {
  switch ((attackType || "").toLowerCase()) {
    case "energy":
    case "radiant":
      return "Radiant";
    case "void":
      return "Void";
    case "tech":
      return "Tech";
    case "biological":
    case "bio":
      return "Bio";
    case "ember":
      return "Ember";
    case "psychic":
    case "quantum":
    case "astral":
      return "Astral";
    case "physical":
    case "kinetic":
    default:
      return "Kinetic";
  }
}

function inferDefenseProfile(faction: FactionId, kind: CardKind): DefenseProfile {
  if (kind === "Structure") return "Structure";
  if (faction === "solari") return "Lightform";
  if (faction === "voidborn") return "Chitin";
  if (faction === "synthari" || faction === "quantum") return "Machine";
  if (faction === "verdant") return "LivingArmor";
  if (faction === "crimson" || faction === "reavers") return "BloodMetal";
  if (faction === "astral") return "Phase";
  if (faction === "crystalline") return "Crystal";
  return "Unarmored";
}

function inferCreatureClass(card: Pick<CardDef, "name" | "text" | "keyword">, faction: FactionId): CreatureClass {
  const lower = `${card.name} ${card.text} ${card.keyword || ""}`.toLowerCase();
  if (lower.includes("commander")) return "Commander";
  if (lower.includes("titan") || lower.includes("leviathan") || lower.includes("avatar")) return "Titan";
  if (lower.includes("flying") || lower.includes("wing") || lower.includes("moth")) return "Flyer";
  if (lower.includes("drone") || lower.includes("probe")) return "Drone";
  if (lower.includes("construct") || lower.includes("engine")) return "Construct";
  if (lower.includes("swarm") || lower.includes("brood") || faction === "voidborn") return "Swarm";
  if (lower.includes("beast") || lower.includes("larva")) return "Beast";
  if (lower.includes("priest") || lower.includes("cartographer") || lower.includes("warden")) return "Caster";
  return "Infantry";
}

function placementForKind(kind: CardKind): PlacementRule[] {
  switch (kind) {
    case "Entity":
      return ["player_back_row", "controlled_sector"];
    case "World":
      return ["controlled_sector"];
    case "Structure":
      return ["matching_world"];
    case "Attachment":
      return ["friendly_entity"];
    case "Anomaly":
      return ["friendly_entity", "enemy_entity", "commander"];
    case "Skill":
    case "Relic":
      return ["commander"];
    case "Science":
    case "Project":
    case "Evolution":
      return ["collection_only"];
  }
}

function iconForKind(kind: CardKind): string {
  switch (kind) {
    case "Entity":
      return "E";
    case "World":
      return "W";
    case "Structure":
      return "S";
    case "Attachment":
      return "A";
    case "Anomaly":
      return "!";
    case "Science":
      return "Sc";
    case "Project":
      return "P";
    case "Skill":
      return "Sk";
    case "Relic":
      return "R";
    case "Evolution":
      return "Ev";
  }
}

function readinessFor(card: CardDef): GameplayReadiness {
  if (card.battleReady === true) return "playable";
  if (card.battleReady === false) return "rules_partial";
  if (card.type === "Entity" || card.type === "Anomaly") return "playable";
  return "rules_partial";
}

function powerTier(rarity: CardRarity): CardTemplate["economy"]["powerTier"] {
  if (rarity === "Common" || rarity === "Uncommon") return "starter";
  if (rarity === "Rare") return "skirmish";
  if (rarity === "Holo") return "veteran";
  if (rarity === "Mythic") return "ascendant";
  return "mythic";
}

function statBudget(cost: number, attack: number, hp: number, rarity: CardRarity, effects: CardEffectTemplate[]): number {
  const rarityPressure = RARITIES.indexOf(rarity) * 3;
  const effectPressure = effects.reduce((sum, effect) => sum + (effect.implemented ? 2 : 4), 0);
  return Math.max(1, cost * 3 + attack * 2 + hp + rarityPressure + effectPressure);
}

function inferEffectHooks(text: string, kind: CardKind, implementedBase: boolean): CardEffectTemplate[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  const hook =
    lower.includes("when deployed") || lower.includes("terraform") || lower.includes("build on") || lower.includes("attached")
      ? "onDeploy"
      : lower.includes("when destroyed") || lower.includes("when it dies")
        ? "onDeath"
        : lower.includes("when this attacks") || lower.includes("after it attacks")
          ? "onAttack"
          : lower.includes("start of turn")
            ? "onTurnStart"
            : lower.includes("end step") || lower.includes("end of turn")
              ? "onTurnEnd"
              : "passive";

  const affectedStats: CardEffectTemplate["affectedStats"] = [];
  if (lower.includes("attack")) affectedStats.push("attack");
  if (lower.includes("hp") || lower.includes("heal")) affectedStats.push("hp");
  if (lower.includes("shield")) affectedStats.push("shield");
  if (lower.includes("armor")) affectedStats.push("armor");
  if (lower.includes("resonance") || lower.includes("cost")) affectedStats.push("resonance");
  if (lower.includes("influence")) affectedStats.push("influence");
  if (lower.includes("resource") || lower.includes("biomass") || lower.includes("plasma") || lower.includes("crystal")) {
    affectedStats.push("resources");
  }
  if (lower.includes("move") || lower.includes("blink") || lower.includes("slow")) affectedStats.push("movement");

  const implemented =
    implementedBase &&
    (kind === "Entity" || kind === "World" || kind === "Structure" || kind === "Attachment") &&
    !lower.includes("choose") &&
    !lower.includes("whenever");

  return [{
    hook,
    label: kind === "World" ? "World rule" : kind === "Attachment" ? "Attachment rule" : "Card rule",
    rulesText: trimmed,
    implemented,
    needsTarget: lower.includes("target") || kind === "Anomaly" || kind === "Attachment",
    affectedStats,
  }];
}

function equipmentForKind(kind: CardKind, text: string): CardTemplate["gameplay"]["equipment"] {
  const lower = text.toLowerCase();
  const modifiesSlots: EquipmentSlot[] = [];
  if (kind === "Attachment" || lower.includes("armor")) modifiesSlots.push("Armor");
  if (lower.includes("weapon") || lower.includes("attack")) modifiesSlots.push("Weapon");
  if (kind === "Skill") modifiesSlots.push("Skill");
  if (kind === "Relic") modifiesSlots.push("Relic");
  if (lower.includes("skin")) modifiesSlots.push("Skin");
  if (kind === "World" || lower.includes("world")) modifiesSlots.push("WorldMod");

  return {
    slotsProvided: kind === "Project" && lower.includes("slot") ? ["Relic"] : [],
    slotsRequired: kind === "Attachment" ? ["Armor"] : [],
    modifiesSlots: Array.from(new Set(modifiesSlots)),
  };
}

function missingImplementation(kind: CardKind, readiness: GameplayReadiness, effects: CardEffectTemplate[]): string[] {
  const missing: string[] = [];
  if (readiness !== "playable") missing.push("Needs full engine hook before ranked play.");
  if (["Science", "Project", "Skill", "Relic", "Evolution"].includes(kind)) {
    missing.push("Needs progression/loadout resolver and UI affordance.");
  }
  if (effects.some((effect) => !effect.implemented)) {
    missing.push("Rules text exists but is not fully executable yet.");
  }
  return Array.from(new Set(missing));
}

export function fromLegacyCardDef(card: CardDef): CardTemplate {
  const faction = normalizeFaction(card.faction);
  const rarity = normalizeRarity(card.rarity);
  const set = normalizeSet(card.catalogSet);
  const kind = card.type as CardKind;
  const readiness = readinessFor(card);
  const worldAffinity = inferWorldAffinity(card.text, card.environmentBonus?.planetType);
  const damageSchool = normalizeDamageSchool(card.attackType);
  const effects = inferEffectHooks(card.text, kind, readiness === "playable");
  const economy = RARITY_ECONOMY[rarity];

  return {
    identity: {
      id: card.defId,
      name: card.name,
      faction,
      set,
      rarity,
      scopes: ["battle", "collection"],
      lore: card.lore,
      tags: [faction, kind, worldAffinity, damageSchool, ...(card.keyword ? [card.keyword] : [])],
    },
    gameplay: {
      kind,
      readiness,
      cost: { resonance: card.cost },
      stats: {
        attack: card.attack,
        hp: card.hp,
        shield: card.shieldValue || 0,
        flatArmor: card.type === "Structure" ? 1 : 0,
      },
      combat: {
        damageSchool,
        defenseProfile: inferDefenseProfile(faction, kind),
        creatureClass: inferCreatureClass(card, faction),
        worldAffinity,
        keywords: card.keyword ? [card.keyword] : [],
      },
      board: {
        placement: placementForKind(kind),
        occupiesSector: kind === "Entity" || kind === "Structure",
        canMove: kind === "Entity",
        canAttack: kind === "Entity",
        modifiesWorld: kind === "World" || card.text.toLowerCase().includes("terraform"),
        modifiesStructure: kind === "Structure" || card.text.toLowerCase().includes("structure"),
      },
      equipment: equipmentForKind(kind, card.text),
      effects,
    },
    progression: {
      combineFamily: card.evolvesTo?.name || card.defId,
      masteryTrack: `${faction}_${kind.toLowerCase()}_mastery`,
      evolutionFamily: card.evolvesTo?.name,
      maxLevel: rarity === "Singularity" ? 10 : rarity === "Mythic" ? 8 : rarity === "Holo" ? 6 : 5,
      xpTriggers: ["played", "survived_turn", "won_match"],
    },
    economy: {
      ...economy,
      powerTier: powerTier(rarity),
      statBudget: statBudget(card.cost, card.attack, card.hp, rarity, effects),
    },
    presentation: {
      art: card.art,
      iconGlyph: iconForKind(kind),
      animationKey: `${kind.toLowerCase()}_${faction}`,
      vfxProfile: `${damageSchool.toLowerCase()}_${worldAffinity}`,
      soundProfile: `${faction}_${kind.toLowerCase()}`,
      revealTier: economy.revealTier,
    },
    authoring: {
      source: "legacy_card_def",
      rulesNotes: [card.text],
      missingImplementation: missingImplementation(kind, readiness, effects),
      counterplay: kind === "Entity" ? ["remove", "block", "outmaneuver"] : ["deny timing", "pressure commander", "contest world"],
    },
  };
}

export function fromWorldCardDef(card: WorldCardDef): CardTemplate {
  const rarity = normalizeRarity(card.rarity);
  const economy = RARITY_ECONOMY[rarity];
  const isPlanet = card.category === "planet";
  const isDevelopment = card.category === "development";
  const kind: CardKind = isPlanet ? "World" : isDevelopment ? "Science" : "Entity";
  const description = card.description;
  const worldAffinity = inferWorldAffinity(description, isPlanet ? card.planetType : undefined);
  const effects = inferEffectHooks(description, kind, false);

  return {
    identity: {
      id: card.defId,
      name: card.name,
      faction: "neutral",
      set: "domain",
      rarity,
      scopes: ["domain", "collection"],
      lore: card.flavor,
      tags: ["domain", card.category, kind, worldAffinity],
    },
    gameplay: {
      kind,
      readiness: "rules_partial",
      cost: { resonance: isPlanet ? 3 : isDevelopment ? 2 : 1 },
      stats: {
        attack: 0,
        hp: isPlanet ? 0 : isDevelopment ? 0 : 1,
        shield: 0,
        flatArmor: 0,
      },
      combat: {
        damageSchool: isDevelopment ? "Tech" : "Kinetic",
        defenseProfile: isDevelopment ? "Machine" : "Unarmored",
        creatureClass: isDevelopment ? "Construct" : "Infantry",
        worldAffinity,
        keywords: [card.category],
      },
      board: {
        placement: isPlanet ? ["domain_planet"] : ["collection_only"],
        occupiesSector: false,
        canMove: false,
        canAttack: false,
        modifiesWorld: isPlanet,
        modifiesStructure: isDevelopment,
      },
      equipment: {
        slotsProvided: [],
        slotsRequired: [],
        modifiesSlots: isDevelopment ? ["WorldMod"] : [],
      },
      effects,
    },
    progression: {
      combineFamily: card.defId,
      masteryTrack: `domain_${card.category}`,
      maxLevel: rarity === "Singularity" ? 10 : rarity === "Mythic" ? 8 : 5,
      xpTriggers: isPlanet ? ["deployed_to_domain", "harvested", "upgraded"] : ["activated", "assignment_completed"],
    },
    economy: {
      ...economy,
      powerTier: powerTier(rarity),
      statBudget: statBudget(isPlanet ? 3 : 2, 0, isPlanet ? 0 : 1, rarity, effects),
    },
    presentation: {
      iconGlyph: isPlanet ? "W" : isDevelopment ? "Sc" : "E",
      animationKey: `domain_${card.category}`,
      vfxProfile: `domain_${worldAffinity}`,
      soundProfile: `domain_${card.category}`,
      revealTier: economy.revealTier,
    },
    authoring: {
      source: "world_card_def",
      rulesNotes: [description],
      missingImplementation: ["Needs domain timer/assignment bridge into daily briefing and battle availability."],
      counterplay: ["assignment cooldown", "resource opportunity cost", "deck availability lock"],
    },
  };
}
