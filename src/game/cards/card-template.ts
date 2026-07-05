import type {
  CardKind,
  CreatureClass,
  DamageSchool,
  DefenseProfile,
  FactionId,
  WorldType,
} from "@/game/five-by-five";

export type CardSetId = "prototype" | "set001" | "set002" | "set003" | "set004" | "domain";
export type CardRarity = "Common" | "Uncommon" | "Rare" | "Holo" | "Mythic" | "Singularity";
export type CardScope = "battle" | "domain" | "commander" | "collection" | "cosmetic";
export type GameplayReadiness = "playable" | "rules_partial" | "design_only";
export type EquipmentSlot = "Armor" | "Weapon" | "Skill" | "Relic" | "Skin" | "WorldMod";
export type TriggerHook =
  | "onDeploy"
  | "onMove"
  | "onAttack"
  | "onDamaged"
  | "onDeath"
  | "onTurnStart"
  | "onTurnEnd"
  | "onWorldChanged"
  | "passive";

export type PlacementRule =
  | "player_back_row"
  | "controlled_sector"
  | "matching_world"
  | "friendly_entity"
  | "enemy_entity"
  | "commander"
  | "domain_planet"
  | "collection_only";

export type CardEffectTemplate = {
  hook: TriggerHook;
  label: string;
  rulesText: string;
  implemented: boolean;
  needsTarget?: boolean;
  affectedStats?: Array<"attack" | "hp" | "shield" | "armor" | "resonance" | "influence" | "resources" | "movement">;
};

export type CardTemplate = {
  identity: {
    id: string;
    name: string;
    faction: FactionId;
    set: CardSetId;
    rarity: CardRarity;
    scopes: CardScope[];
    lore?: string;
    tags: string[];
  };
  gameplay: {
    kind: CardKind;
    readiness: GameplayReadiness;
    cost: {
      resonance: number;
      affinity?: Partial<Record<FactionId, number>>;
      materials?: Partial<Record<"Plasma" | "Biomass" | "Data" | "Verdance" | "Ember" | "Aether" | "Alloy" | "Crystal" | "Tritium", number>>;
    };
    stats: {
      attack: number;
      hp: number;
      shield?: number;
      flatArmor?: number;
    };
    combat: {
      damageSchool: DamageSchool;
      defenseProfile: DefenseProfile;
      creatureClass: CreatureClass;
      worldAffinity: WorldType;
      keywords: string[];
    };
    board: {
      placement: PlacementRule[];
      occupiesSector: boolean;
      canMove: boolean;
      canAttack: boolean;
      modifiesWorld: boolean;
      modifiesStructure: boolean;
    };
    equipment: {
      slotsProvided: EquipmentSlot[];
      slotsRequired: EquipmentSlot[];
      modifiesSlots: EquipmentSlot[];
    };
    effects: CardEffectTemplate[];
  };
  progression: {
    combineFamily: string;
    masteryTrack?: string;
    evolutionFamily?: string;
    maxLevel: number;
    xpTriggers: string[];
  };
  economy: {
    craftShards: number;
    duplicateShards: number;
    packWeight: number;
    maxDeckCopies: number;
    powerTier: "starter" | "skirmish" | "veteran" | "ascendant" | "mythic" | "open_war";
    statBudget: number;
  };
  presentation: {
    art?: string;
    iconGlyph: string;
    animationKey: string;
    vfxProfile: string;
    soundProfile: string;
    revealTier: "standard" | "rare" | "holo" | "mythic" | "singularity";
  };
  authoring: {
    source: "legacy_card_def" | "world_card_def" | "manual_template";
    rulesNotes: string[];
    missingImplementation: string[];
    counterplay: string[];
  };
};

export type CardTemplateAudit = {
  total: number;
  byReadiness: Record<GameplayReadiness, number>;
  byScope: Record<CardScope, number>;
  byKind: Partial<Record<CardKind, number>>;
  issues: CardTemplateIssue[];
};

export type CardTemplateIssue = {
  cardId: string;
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
};

export const RARITY_ECONOMY: Record<CardRarity, {
  craftShards: number;
  duplicateShards: number;
  packWeight: number;
  maxDeckCopies: number;
  revealTier: CardTemplate["presentation"]["revealTier"];
}> = {
  Common: { craftShards: 20, duplicateShards: 5, packWeight: 600, maxDeckCopies: 3, revealTier: "standard" },
  Uncommon: { craftShards: 40, duplicateShards: 10, packWeight: 250, maxDeckCopies: 3, revealTier: "standard" },
  Rare: { craftShards: 80, duplicateShards: 20, packWeight: 100, maxDeckCopies: 2, revealTier: "rare" },
  Holo: { craftShards: 160, duplicateShards: 40, packWeight: 40, maxDeckCopies: 2, revealTier: "holo" },
  Mythic: { craftShards: 320, duplicateShards: 80, packWeight: 9, maxDeckCopies: 1, revealTier: "mythic" },
  Singularity: { craftShards: 640, duplicateShards: 160, packWeight: 1, maxDeckCopies: 1, revealTier: "singularity" },
};
