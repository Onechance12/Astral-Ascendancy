import type {
  BoardEntity,
  BoardStructure,
  CreatureClass,
  DamageSchool,
  DefenseProfile,
  FactionId,
  WorldType,
} from "./types";

type MultiplierKey = `${DamageSchool}:${DefenseProfile}`;
type TerrainKey = `${WorldType}:${FactionId | "any"}:${CreatureClass | "Structure"}`;

export type DamageCalculationInput = {
  baseAttack: number;
  damageSchool: DamageSchool;
  attackerFaction: FactionId;
  attackerCreatureClass: CreatureClass;
  defenderDefenseProfile: DefenseProfile;
  defenderWorld: WorldType;
  cardAttackBonuses?: number;
  attachmentAttackBonuses?: number;
  temporaryAttackBonuses?: number;
  flatArmor?: number;
  flatResistance?: number;
  percentResistance?: number;
  shieldValue?: number;
  minimumDamage?: number;
  maximumDamage?: number;
};

export type DamageCalculationResult = {
  rawDamage: number;
  damageTypeMultiplier: number;
  typedDamage: number;
  terrainAttackMultiplier: number;
  terrainDamage: number;
  reducedDamage: number;
  percentageReducedDamage: number;
  shieldDamage: number;
  hpDamage: number;
  finalDamage: number;
  remainingShield: number;
};

const DAMAGE_TYPE_MULTIPLIER: Partial<Record<MultiplierKey, number>> = {
  "Radiant:Lightform": 0.85,
  "Radiant:Chitin": 1.15,
  "Radiant:BloodMetal": 0.95,
  "Radiant:Crystal": 0.85,
  "Radiant:Unarmored": 1.1,
  "Void:Lightform": 1.25,
  "Void:Flesh": 1.15,
  "Void:Machine": 0.85,
  "Void:Phase": 1.15,
  "Void:Unarmored": 1.1,
  "Tech:Machine": 0.85,
  "Tech:LivingArmor": 1.15,
  "Tech:Structure": 1.15,
  "Bio:Flesh": 1.1,
  "Bio:Machine": 0.75,
  "Bio:LivingArmor": 1.15,
  "Bio:Unarmored": 1.1,
  "Ember:Flesh": 1.15,
  "Ember:Chitin": 1.1,
  "Ember:LivingArmor": 1.25,
  "Ember:BloodMetal": 0.85,
  "Astral:Phase": 0.85,
  "Astral:Crystal": 1.15,
  "Astral:Structure": 1.1,
  "Kinetic:Lightform": 0.85,
  "Kinetic:Machine": 1.1,
  "Kinetic:BloodMetal": 0.9,
  "Kinetic:Structure": 1.05,
};

const TERRAIN_ATTACK_MULTIPLIER: Partial<Record<TerrainKey, number>> = {
  "star:solari:Infantry": 1.1,
  "star:solari:Caster": 1.1,
  "star:voidborn:Swarm": 0.95,
  "star:crimson:Infantry": 1.05,
  "organic:voidborn:Swarm": 1.1,
  "organic:verdant:Beast": 1.1,
  "organic:synthari:Drone": 0.95,
  "organic:any:Structure": 0.95,
  "machine:synthari:Drone": 1.15,
  "machine:synthari:Construct": 1.1,
  "machine:voidborn:Swarm": 0.9,
  "verdant:verdant:Beast": 1.1,
  "verdant:verdant:Caster": 1.05,
  "verdant:synthari:Drone": 0.95,
  "crucible:crimson:Infantry": 1.1,
  "crucible:crimson:Construct": 1.05,
  "astral:astral:Caster": 1.1,
  "astral:astral:Flyer": 1.05,
  "mineral:neutral:Construct": 1.05,
  "gas:neutral:Flyer": 1.1,
  "corrupted:voidborn:Swarm": 1.15,
};

export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  const minimumDamage = input.minimumDamage ?? 1;
  const maximumDamage = input.maximumDamage ?? Number.POSITIVE_INFINITY;
  const rawDamage =
    input.baseAttack +
    (input.cardAttackBonuses ?? 0) +
    (input.attachmentAttackBonuses ?? 0) +
    (input.temporaryAttackBonuses ?? 0);
  const damageTypeMultiplier = getDamageTypeMultiplier(input.damageSchool, input.defenderDefenseProfile);
  const typedDamage = rawDamage * damageTypeMultiplier;
  const terrainAttackMultiplier = getTerrainAttackMultiplier(
    input.defenderWorld,
    input.attackerFaction,
    input.attackerCreatureClass
  );
  const terrainDamage = typedDamage * terrainAttackMultiplier;
  const reducedDamage = Math.max(0, terrainDamage - (input.flatArmor ?? 0) - (input.flatResistance ?? 0));
  const percentageReducedDamage = reducedDamage * (1 - (input.percentResistance ?? 0));
  const roundedBeforeShield = roundHalfUp(percentageReducedDamage);
  const shieldDamage = Math.min(input.shieldValue ?? 0, roundedBeforeShield);
  const unshieldedDamage = Math.max(0, roundedBeforeShield - shieldDamage);
  const finalDamage = clamp(unshieldedDamage, minimumDamage, maximumDamage);

  return {
    rawDamage,
    damageTypeMultiplier,
    typedDamage,
    terrainAttackMultiplier,
    terrainDamage,
    reducedDamage,
    percentageReducedDamage,
    shieldDamage,
    hpDamage: finalDamage,
    finalDamage,
    remainingShield: Math.max(0, (input.shieldValue ?? 0) - shieldDamage),
  };
}

export function calculateEntityAttackDamage({
  attacker,
  defender,
  defenderWorld,
  temporaryAttackBonuses = 0,
}: {
  attacker: BoardEntity;
  defender: BoardEntity | BoardStructure;
  defenderWorld: WorldType;
  temporaryAttackBonuses?: number;
}): DamageCalculationResult {
  const defenderShield = "shield" in defender ? defender.shield : 0;
  const defenderPercentResistance = "percentResistance" in defender
    ? defender.percentResistance[attacker.damageSchool] ?? 0
    : 0;
  const defenderProfile: DefenseProfile = "defenseProfile" in defender ? defender.defenseProfile : "Structure";

  return calculateDamage({
    baseAttack: attacker.attack,
    damageSchool: attacker.damageSchool,
    attackerFaction: attacker.faction,
    attackerCreatureClass: attacker.creatureClass,
    defenderDefenseProfile: defenderProfile,
    defenderWorld,
    flatArmor: defender.flatArmor,
    percentResistance: defenderPercentResistance,
    shieldValue: defenderShield,
    temporaryAttackBonuses,
  });
}

export function applyDamageToEntity(entity: BoardEntity, result: DamageCalculationResult): BoardEntity {
  return {
    ...entity,
    hp: Math.max(0, entity.hp - result.hpDamage),
    shield: result.remainingShield,
  };
}

export function applyDamageToStructure(
  structure: BoardStructure,
  result: DamageCalculationResult
): BoardStructure {
  return {
    ...structure,
    hp: Math.max(0, structure.hp - result.hpDamage),
  };
}

export function getDamageTypeMultiplier(school: DamageSchool, profile: DefenseProfile): number {
  return DAMAGE_TYPE_MULTIPLIER[`${school}:${profile}`] ?? 1;
}

export function getTerrainAttackMultiplier(
  world: WorldType,
  faction: FactionId,
  creatureClass: CreatureClass | "Structure"
): number {
  return (
    TERRAIN_ATTACK_MULTIPLIER[`${world}:${faction}:${creatureClass}`] ??
    TERRAIN_ATTACK_MULTIPLIER[`${world}:any:${creatureClass}`] ??
    1
  );
}

function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
