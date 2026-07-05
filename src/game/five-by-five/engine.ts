import type { CardDef } from "@/lib/match-engine";
import {
  buildStructure,
  checkVictory,
  influenceGainFor,
  attachToEntity,
  legalAttackIndexes,
  legalMoveIndexes,
  moveEntity,
  placeEntity,
  resolveSectorControl,
  terraformSector,
} from "./board";
import {
  applyDamageToEntity,
  applyDamageToStructure,
  calculateEntityAttackDamage,
} from "./combat";
import {
  createBoardAttachment,
  createBoardEntity,
  createBoardStructure,
} from "./content";
import type { FiveByFiveMatchState, Side, WorldType } from "./types";

export function startTurn(state: FiveByFiveMatchState, side: Side): FiveByFiveMatchState {
  const commander = side === "player" ? state.player : state.enemy;
  const refreshedCommander = {
    ...commander,
    maxResonance: Math.min(10, commander.maxResonance + 1),
    resonance: Math.min(10, commander.maxResonance + 1),
  };

  const board = state.board.map((sector) => {
    if (sector.entity?.owner !== side) return sector;
    return {
      ...sector,
      entity: {
        ...sector.entity,
        canMove: true,
        canAttack: true,
        exhausted: false,
      },
    };
  });

  return {
    ...state,
    active: side,
    phase: "main",
    board,
    player: side === "player" ? refreshedCommander : state.player,
    enemy: side === "enemy" ? refreshedCommander : state.enemy,
    turn: side === "player" ? state.turn + 1 : state.turn,
    log: [...state.log, `${side} starts turn with ${refreshedCommander.resonance} Resonance.`],
  };
}

export function endStep(state: FiveByFiveMatchState): FiveByFiveMatchState {
  const board = resolveSectorControl(state.board);
  const playerInfluence = influenceGainFor(board, "player");
  const enemyInfluence = influenceGainFor(board, "enemy");
  const next = {
    ...state,
    phase: "end" as const,
    board,
    player: { ...state.player, influence: state.player.influence + playerInfluence },
    enemy: { ...state.enemy, influence: state.enemy.influence + enemyInfluence },
    log: [
      ...state.log,
      `Influence pulse: player +${playerInfluence}, enemy +${enemyInfluence}.`,
    ],
  };
  return checkVictory(next);
}

export function deployEntityCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Entity" || commander.resonance < def.cost) return state;

  const entity = createBoardEntity(def, owner);
  const board = placeEntity(state.board, entity, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} deploys ${def.name} to ${state.board[targetIndex].id}.`],
    },
    owner,
    def.cost
  );
}

export function playWorldCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "World" || commander.resonance < def.cost) return state;

  const world = inferWorldType(def);
  const board = terraformSector(state.board, owner, targetIndex, world);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} terraforms ${state.board[targetIndex].id} into ${world}.`],
    },
    owner,
    def.cost
  );
}

export function buildStructureCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Structure" || commander.resonance < def.cost) return state;

  const structure = createBoardStructure(def, owner);
  const board = buildStructure(state.board, structure, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} builds ${def.name} on ${state.board[targetIndex].id}.`],
    },
    owner,
    def.cost
  );
}

export function attachCardToEntity(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Attachment" || commander.resonance < def.cost) return state;

  const attachment = createBoardAttachment(def, owner);
  const board = attachToEntity(state.board, attachment, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} attaches ${def.name} to ${state.board[targetIndex].id}.`],
    },
    owner,
    def.cost
  );
}

export function moveEntityInMatch(
  state: FiveByFiveMatchState,
  fromIndex: number,
  toIndex: number
): FiveByFiveMatchState {
  if (!legalMoveIndexes(state.board, fromIndex).includes(toIndex)) return state;
  const board = moveEntity(state.board, fromIndex, toIndex);
  return {
    ...state,
    board,
    log: [...state.log, `${state.board[fromIndex].entity?.name ?? "Entity"} moves to ${state.board[toIndex].id}.`],
  };
}

export function attackInMatch(
  state: FiveByFiveMatchState,
  attackerIndex: number,
  targetIndex: number
): FiveByFiveMatchState {
  if (!legalAttackIndexes(state.board, attackerIndex).includes(targetIndex)) return state;
  const attackerSector = state.board[attackerIndex];
  const targetSector = state.board[targetIndex];
  const attacker = attackerSector.entity;
  const target = targetSector.entity ?? targetSector.structure;
  if (!attacker || !target) return state;

  const attackResult = calculateEntityAttackDamage({
    attacker,
    defender: target,
    defenderWorld: targetSector.world,
  });

  const board = state.board.map((sector) => {
    if (sector.index === attackerIndex) {
      return {
        ...sector,
        entity: {
          ...attacker,
          canAttack: false,
          exhausted: true,
        },
      };
    }
    if (sector.index !== targetIndex) return sector;
    if (sector.entity) {
      const damaged = applyDamageToEntity(sector.entity, attackResult);
      return { ...sector, entity: damaged.hp > 0 ? damaged : null };
    }
    if (sector.structure) {
      const damaged = applyDamageToStructure(sector.structure, attackResult);
      return { ...sector, structure: damaged.hp > 0 ? damaged : null };
    }
    return sector;
  });

  const next = {
    ...state,
    board,
    log: [
      ...state.log,
      `${attacker.name} hits ${target.name} for ${attackResult.hpDamage} damage.`,
    ],
  };
  return checkVictory(next);
}

function spendResonance(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number
): FiveByFiveMatchState {
  if (side === "player") {
    return {
      ...state,
      player: { ...state.player, resonance: state.player.resonance - amount },
    };
  }
  return {
    ...state,
    enemy: { ...state.enemy, resonance: state.enemy.resonance - amount },
  };
}

function inferWorldType(def: CardDef): WorldType {
  const text = `${def.name} ${def.text}`.toLowerCase();
  if (text.includes("star")) return "star";
  if (text.includes("organic")) return "organic";
  if (text.includes("machine")) return "machine";
  if (text.includes("verdant")) return "verdant";
  if (text.includes("crucible")) return "crucible";
  if (text.includes("astral")) return "astral";
  if (text.includes("mineral")) return "mineral";
  if (text.includes("gas")) return "gas";
  if (text.includes("corrupted")) return "corrupted";
  return "barren";
}
