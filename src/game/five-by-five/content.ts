import type { CardDef } from "@/lib/match-engine";
import type {
  BoardAttachment,
  BoardEntity,
  BoardStructure,
  CreatureClass,
  DamageSchool,
  DefenseProfile,
  FactionId,
  FiveByFiveCard,
  Side,
} from "./types";

let uidCounter = 0;

export function resetFiveByFiveUidCounter(): void {
  uidCounter = 0;
}

export function toFiveByFiveCard(def: CardDef): FiveByFiveCard {
  return {
    defId: def.defId,
    name: def.name,
    faction: normalizeFaction(def.faction),
    kind: def.type,
    cost: def.cost,
    rarity: def.rarity,
    text: def.text,
  };
}

export function createBoardEntity(def: CardDef, owner: Side): BoardEntity {
  if (def.type !== "Entity") {
    throw new Error(`${def.defId} is not an Entity card`);
  }

  const hp = Math.max(1, def.hp);
  return {
    ...toFiveByFiveCard(def),
    uid: nextUid(def.defId),
    owner,
    kind: "Entity",
    attack: def.attack,
    hp,
    maxHp: hp,
    damageSchool: normalizeDamageSchool(def.attackType),
    defenseProfile: inferDefenseProfile(def.faction),
    creatureClass: inferCreatureClass(def),
    keywords: collectKeywords(def),
    shield: def.shieldValue ?? 0,
    flatArmor: inferFlatArmor(def),
    percentResistance: {},
    canMove: true,
    canAttack: false,
    exhausted: true,
    attachments: [],
  };
}

export function createBoardStructure(def: CardDef, owner: Side): BoardStructure {
  if (def.type !== "Structure") {
    throw new Error(`${def.defId} is not a Structure card`);
  }

  const hp = Math.max(1, def.hp);
  return {
    ...toFiveByFiveCard(def),
    uid: nextUid(def.defId),
    owner,
    kind: "Structure",
    hp,
    maxHp: hp,
    structureClass: inferStructureClass(def),
    flatArmor: inferStructureClass(def) === "Bastion" ? 1 : 0,
    keywords: collectStructureKeywords(def),
  };
}

export function createBoardAttachment(def: CardDef, owner: Side): BoardAttachment {
  if (def.type !== "Attachment") {
    throw new Error(`${def.defId} is not an Attachment card`);
  }

  const text = def.text.toLowerCase();
  return {
    ...toFiveByFiveCard(def),
    uid: nextUid(def.defId),
    owner,
    kind: "Attachment",
    slot: text.includes("armor") || text.includes("shell") ? "Armor" : text.includes("weapon") || def.attack > 0 ? "Weapon" : "Other",
    attackBonus: parseSignedBonus(def.text, "attack"),
    hpBonus: parseSignedBonus(def.text, "hp"),
    shieldBonus: text.includes("shield") ? 1 : 0,
  };
}

export function normalizeDamageSchool(attackType: string | undefined): DamageSchool {
  switch (attackType) {
    case "Energy":
      return "Radiant";
    case "Biological":
      return "Bio";
    case "Quantum":
    case "Psychic":
      return "Astral";
    case "Physical":
      return "Kinetic";
    case "Radiant":
    case "Void":
    case "Tech":
    case "Bio":
    case "Ember":
    case "Astral":
    case "Kinetic":
      return attackType;
    default:
      return "Kinetic";
  }
}

export function normalizeFaction(faction: string): FactionId {
  switch (faction) {
    case "solari":
    case "voidborn":
    case "synthari":
    case "verdant":
    case "crimson":
    case "astral":
    case "neutral":
    case "crystalline":
    case "reavers":
    case "quantum":
      return faction;
    default:
      return "neutral";
  }
}

function inferDefenseProfile(faction: string): DefenseProfile {
  switch (faction) {
    case "solari":
      return "Lightform";
    case "voidborn":
      return "Chitin";
    case "synthari":
    case "quantum":
      return "Machine";
    case "verdant":
      return "LivingArmor";
    case "crimson":
    case "reavers":
      return "BloodMetal";
    case "astral":
      return "Phase";
    case "crystalline":
      return "Crystal";
    default:
      return "Unarmored";
  }
}

function inferCreatureClass(def: CardDef): CreatureClass {
  const text = `${def.name} ${def.text}`.toLowerCase();
  if (text.includes("brood") || text.includes("swarm")) return "Swarm";
  if (text.includes("drone") || def.faction === "synthari") return "Drone";
  if (text.includes("beast") || def.faction === "verdant") return "Beast";
  if (text.includes("titan") || text.includes("leviathan")) return "Titan";
  if (text.includes("flying") || text.includes("skiff") || text.includes("avatar")) return "Flyer";
  if (text.includes("priest") || text.includes("apostle") || text.includes("cartographer")) return "Caster";
  if (text.includes("construct") || text.includes("engine")) return "Construct";
  return "Infantry";
}

function inferFlatArmor(def: CardDef): number {
  const text = def.text.toLowerCase();
  if (text.includes("armor") || text.includes("bastion")) return 1;
  return 0;
}

function inferStructureClass(def: CardDef): string {
  const name = def.name.toLowerCase();
  if (name.includes("reactor")) return "Reactor";
  if (name.includes("bastion") || name.includes("bulkhead")) return "Bastion";
  if (name.includes("beacon") || name.includes("spire")) return "Spire";
  if (name.includes("bridge") || name.includes("gate")) return "Gate";
  if (name.includes("crucible")) return "Cannon";
  return "Structure";
}

function collectKeywords(def: CardDef): string[] {
  const keywords = new Set<string>();
  if (def.keyword) keywords.add(def.keyword);
  for (const candidate of ["Scout", "Flying", "Blink", "Reach", "Ranged2", "StrikeFirst", "Guardian"]) {
    if (def.text.includes(candidate) || def.name.includes(candidate)) keywords.add(candidate);
  }
  return [...keywords];
}

function collectStructureKeywords(def: CardDef): string[] {
  const keywords = new Set<string>();
  const text = def.text.toLowerCase();
  if (text.includes("deploy")) keywords.add("DeployBeacon");
  if (text.includes("adjacent")) keywords.add("ProjectControl");
  return [...keywords];
}

function parseSignedBonus(text: string, stat: "attack" | "hp"): number {
  const compact = text.match(/\+(\d+)\/\+?(\d+)/);
  if (compact) return Number(stat === "attack" ? compact[1] : compact[2]);
  const pattern = stat === "attack" ? /\+(\d+)\s+attack/i : /\+(\d+)\s+hp/i;
  const match = text.match(pattern);
  return match ? Number(match[1]) : 0;
}

function nextUid(defId: string): string {
  uidCounter += 1;
  return `${defId}-${uidCounter}`;
}
