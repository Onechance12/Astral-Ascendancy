export type Side = "player" | "enemy";

export type FactionId =
  | "solari"
  | "voidborn"
  | "synthari"
  | "verdant"
  | "crimson"
  | "astral"
  | "neutral"
  | "crystalline"
  | "reavers"
  | "quantum";

export type WorldType =
  | "star"
  | "organic"
  | "machine"
  | "verdant"
  | "crucible"
  | "astral"
  | "mineral"
  | "gas"
  | "barren"
  | "corrupted";

export type DamageSchool =
  | "Radiant"
  | "Void"
  | "Tech"
  | "Bio"
  | "Ember"
  | "Astral"
  | "Kinetic";

export type DefenseProfile =
  | "Lightform"
  | "Flesh"
  | "Chitin"
  | "Machine"
  | "LivingArmor"
  | "BloodMetal"
  | "Phase"
  | "Crystal"
  | "Unarmored"
  | "Structure";

export type CreatureClass =
  | "Infantry"
  | "Beast"
  | "Swarm"
  | "Drone"
  | "Construct"
  | "Titan"
  | "Flyer"
  | "Caster"
  | "Commander";

export type CardKind = "Entity" | "World" | "Structure" | "Attachment" | "Anomaly" | "Science" | "Project";

export type SectorControl = Side | "neutral" | "contested";

export type SectorStatus =
  | "corrupted"
  | "fortified"
  | "sealed"
  | "ruined"
  | "hazard"
  | "portal"
  | "anomalyCore";

export type BoardPosition = {
  row: number;
  col: number;
};

export type SectorId = `${"E" | "F" | "C" | "P" | "D"}${1 | 2 | 3 | 4 | 5}`;

export type FiveByFiveCard = {
  defId: string;
  name: string;
  faction: FactionId;
  kind: CardKind;
  cost: number;
  rarity: string;
  text: string;
};

export type BoardEntity = FiveByFiveCard & {
  uid: string;
  owner: Side;
  kind: "Entity";
  attack: number;
  hp: number;
  maxHp: number;
  damageSchool: DamageSchool;
  defenseProfile: DefenseProfile;
  creatureClass: CreatureClass;
  keywords: string[];
  shield: number;
  flatArmor: number;
  percentResistance: Partial<Record<DamageSchool, number>>;
  canMove: boolean;
  canAttack: boolean;
  exhausted: boolean;
  attachments: BoardAttachment[];
};

export type BoardStructure = FiveByFiveCard & {
  uid: string;
  owner: Side;
  kind: "Structure";
  hp: number;
  maxHp: number;
  structureClass: string;
  flatArmor: number;
  keywords: string[];
};

export type BoardAttachment = FiveByFiveCard & {
  uid: string;
  owner: Side;
  kind: "Attachment";
  slot: "Armor" | "Weapon" | "Skill" | "Relic" | "Other";
  attackBonus: number;
  hpBonus: number;
  shieldBonus: number;
};

export type SectorState = {
  id: SectorId;
  index: number;
  row: number;
  col: number;
  control: SectorControl;
  world: WorldType;
  statuses: SectorStatus[];
  entity: BoardEntity | null;
  structure: BoardStructure | null;
  worldAttachment: BoardAttachment | null;
};

export type CommanderState = {
  side: Side;
  name: string;
  faction: FactionId;
  hp: number;
  maxHp: number;
  resonance: number;
  maxResonance: number;
  influence: number;
};

export type FiveByFiveMatchState = {
  turn: number;
  active: Side;
  phase: "start" | "main" | "combat" | "end" | "over";
  board: SectorState[];
  player: CommanderState;
  enemy: CommanderState;
  winner: Side | null;
  winCondition: "conquest" | "ascendancy" | "genesis" | null;
  log: string[];
};
