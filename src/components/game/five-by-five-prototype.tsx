"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Swords, Volume2, Zap } from "lucide-react";
import { CARD_DEFS, type CardDef } from "@/lib/match-engine";
import {
  attackInMatch,
  BOARD_COLS,
  createBoardEntity,
  createFiveByFiveMatch,
  deployEntityCard,
  endStep,
  indexOf,
  legalAttackIndexes,
  legalDeployIndexes,
  legalMoveIndexes,
  legalStructureIndexes,
  legalWorldIndexes,
  moveEntityInMatch,
  playWorldCard,
  buildStructureCard,
  attachCardToEntity,
  startTurn,
  type FiveByFiveMatchState,
} from "@/game/five-by-five";
import { cn } from "@/lib/utils";

const STARTING_HAND = [
  "sector_surveyor",
  "carrion_bloom",
  "concord_arbiter",
  "helios_reactor",
  "hardlight_exoshell",
];

const WORLD_COLOR: Record<string, string> = {
  barren: "#64748b",
  astral: "#93c5fd",
  organic: "#34d399",
  star: "#fbbf24",
  machine: "#22d3ee",
  verdant: "#4ade80",
  crucible: "#fb7185",
  corrupted: "#d946ef",
  mineral: "#a78bfa",
  gas: "#38bdf8",
};

function getCard(defId: string): CardDef {
  const def = CARD_DEFS.find((card) => card.defId === defId);
  if (!def) throw new Error(`Missing card definition: ${defId}`);
  return def;
}

function createInitialPrototypeState(): FiveByFiveMatchState {
  const initial = createFiveByFiveMatch({
    playerName: "Ascendant",
    playerFaction: "solari",
    enemyName: "Brood Tyrant Vzaal",
    enemyFaction: "voidborn",
  });
  const enemy = createBoardEntity(getCard("broodling"), "enemy");
  const board = initial.board;
  board[indexOf(0, 2)] = {
    ...board[indexOf(0, 2)],
    entity: enemy,
    control: "enemy",
  };
  return {
    ...initial,
    board,
    player: { ...initial.player, resonance: 6, maxResonance: 6 },
    enemy: { ...initial.enemy, resonance: 4, maxResonance: 4 },
    log: ["Prototype board initialized."],
  };
}

export default function FiveByFivePrototype() {
  const [match, setMatch] = useState<FiveByFiveMatchState>(() => createInitialPrototypeState());
  const [hand, setHand] = useState<string[]>(STARTING_HAND);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<number | null>(null);
  const selectedCard = selectedCardId ? getCard(selectedCardId) : null;

  const targetIndexes = useMemo(() => {
    if (selectedCard) {
      if (selectedCard.cost > match.player.resonance) return [];
      switch (selectedCard.type) {
        case "Entity":
          return legalDeployIndexes(match.board, "player");
        case "World":
          return legalWorldIndexes(match.board, "player");
        case "Structure":
          return legalStructureIndexes(match.board, "player");
        case "Attachment":
          return match.board
            .filter((sector) => sector.entity?.owner === "player")
            .map((sector) => sector.index);
        default:
          return [];
      }
    }
    if (selectedActor !== null) {
      return [
        ...legalMoveIndexes(match.board, selectedActor),
        ...legalAttackIndexes(match.board, selectedActor),
      ];
    }
    return [];
  }, [match, selectedActor, selectedCard]);

  const reset = () => {
    setMatch(createInitialPrototypeState());
    setHand(STARTING_HAND);
    setSelectedCardId(null);
    setSelectedActor(null);
  };

  const pulseTurn = () => {
    const ended = endStep(match);
    setMatch(ended.phase === "over" ? ended : startTurn(ended, "player"));
    setSelectedActor(null);
    setSelectedCardId(null);
  };

  const onCardSelect = (defId: string) => {
    setSelectedActor(null);
    setSelectedCardId((current) => (current === defId ? null : defId));
  };

  const onSectorClick = (index: number) => {
    const sector = match.board[index];

    if (!selectedCard && sector.entity?.owner === "player") {
      setSelectedActor((current) => (current === index ? null : index));
      return;
    }

    if (!targetIndexes.includes(index)) return;

    if (selectedCard) {
      const before = match;
      const next = playSelectedCard(before, selectedCard, index);
      if (next !== before) {
        setMatch(next);
        setHand((cards) => cards.filter((id) => id !== selectedCard.defId));
        setSelectedCardId(null);
      }
      return;
    }

    if (selectedActor !== null) {
      const attacks = legalAttackIndexes(match.board, selectedActor);
      const next = attacks.includes(index)
        ? attackInMatch(match, selectedActor, index)
        : moveEntityInMatch(match, selectedActor, index);
      setMatch(next);
      setSelectedActor(null);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#05070f] text-white">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-35" />
      <div className="absolute inset-0 nebula-radial opacity-80" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10 grid min-h-dvh grid-rows-[auto_1fr_auto] gap-3 px-3 py-3 sm:px-5">
        <header className="flex items-center justify-between gap-3">
          <CommanderHud name={match.enemy.name} hp={match.enemy.hp} maxHp={match.enemy.maxHp} influence={match.enemy.influence} side="enemy" />
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/10 text-cyan-200 backdrop-blur" aria-label="Sound">
              <Volume2 className="h-4 w-4" />
            </button>
            <button onClick={reset} className="grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/10 text-amber-200 backdrop-blur" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative flex min-h-0 items-center justify-center">
            <div className="absolute inset-x-8 top-1/2 h-20 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="grid w-full max-w-[min(92dvh,900px)] grid-cols-5 gap-1.5 sm:gap-2">
              {match.board.map((sector) => {
                const entity = sector.entity;
                const structure = sector.structure;
                const occupant = entity ?? structure;
                const isTarget = targetIndexes.includes(sector.index);
                const isActor = selectedActor === sector.index;
                const worldColor = WORLD_COLOR[sector.world] ?? "#94a3b8";
                return (
                  <button
                    key={sector.id}
                    onClick={() => onSectorClick(sector.index)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md border text-left transition",
                      "bg-black/45 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]",
                      isTarget && "scale-[1.02] border-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.35)]",
                      isActor && "border-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.45)]",
                      !isTarget && !isActor && "border-white/10 hover:border-white/25"
                    )}
                    style={{
                      background:
                        `linear-gradient(145deg, ${worldColor}22, rgba(2,6,23,0.82)), radial-gradient(circle at 50% 45%, ${worldColor}22, transparent 62%)`,
                    }}
                  >
                    <div className="absolute left-1.5 top-1 text-[10px] font-bold text-white/55">{sector.id}</div>
                    <div className="absolute right-1.5 top-1 h-2 w-2 rounded-full" style={{ background: worldColor, boxShadow: `0 0 12px ${worldColor}` }} />
                    {sector.statuses.includes("anomalyCore") && (
                      <div className="absolute inset-3 rounded-full border border-cyan-300/30 animate-spin-slow" />
                    )}
                    {occupant && (
                      <div className={cn(
                        "absolute inset-x-1.5 bottom-1.5 rounded-md border bg-black/55 p-1 backdrop-blur",
                        occupant.owner === "player" ? "border-emerald-300/40" : "border-fuchsia-300/40"
                      )}>
                        <p className="truncate text-[10px] font-black text-white">{occupant.name}</p>
                        {"attack" in occupant ? (
                          <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold">
                            <span className="text-orange-200">ATK {occupant.attack}</span>
                            <span className="text-rose-200">HP {occupant.hp}</span>
                          </div>
                        ) : (
                          <div className="mt-0.5 text-[10px] font-bold text-purple-200">STR {occupant.hp}</div>
                        )}
                      </div>
                    )}
                    <div className={cn(
                      "absolute inset-x-0 bottom-0 h-1",
                      sector.control === "player" && "bg-emerald-300",
                      sector.control === "enemy" && "bg-fuchsia-300",
                      sector.control === "contested" && "bg-amber-300",
                      sector.control === "neutral" && "bg-white/15"
                    )} />
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-3 backdrop-blur lg:flex">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Battle Log</p>
              <div className="mt-3 space-y-2 text-xs text-white/70">
                {match.log.slice(-8).map((entry, index) => (
                  <p key={`${entry}-${index}`}>{entry}</p>
                ))}
              </div>
            </div>
            <button onClick={pulseTurn} className="flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-300 px-3 text-sm font-black text-emerald-950">
              <Zap className="h-4 w-4" />
              Pulse Turn
            </button>
          </aside>
        </section>

        <footer className="grid gap-3">
          <CommanderHud name={match.player.name} hp={match.player.hp} maxHp={match.player.maxHp} influence={match.player.influence} side="player" resonance={match.player.resonance} />
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-cosmic">
            {hand.map((defId) => {
              const def = getCard(defId);
              const selected = selectedCardId === defId;
              const disabled = def.cost > match.player.resonance || def.type === "Anomaly";
              return (
                <button
                  key={defId}
                  onClick={() => !disabled && onCardSelect(defId)}
                  className={cn(
                    "relative h-28 w-24 shrink-0 overflow-hidden rounded-md border bg-black/60 text-left transition sm:h-32 sm:w-28",
                    selected ? "translate-y-[-6px] border-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.35)]" : "border-white/15",
                    disabled && "opacity-45"
                  )}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: def.art ? `url(${def.art})` : "url('/cards/faction-solari.png')" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-cyan-300 text-xs font-black text-cyan-950">{def.cost}</div>
                  <div className="absolute inset-x-2 bottom-2">
                    <p className="truncate text-[11px] font-black">{def.name}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-wide text-white/55">{def.type}</p>
                  </div>
                </button>
              );
            })}
            <button onClick={pulseTurn} className="flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-emerald-300/40 bg-emerald-300/15 text-emerald-100 sm:hidden">
              <Zap className="h-5 w-5" />
              <span className="text-xs font-black">Pulse</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

function playSelectedCard(
  match: FiveByFiveMatchState,
  def: CardDef,
  targetIndex: number
): FiveByFiveMatchState {
  switch (def.type) {
    case "Entity":
      return deployEntityCard(match, def, "player", targetIndex);
    case "World":
      return playWorldCard(match, def, "player", targetIndex);
    case "Structure":
      return buildStructureCard(match, def, "player", targetIndex);
    case "Attachment":
      return attachCardToEntity(match, def, "player", targetIndex);
    default:
      return match;
  }
}

function CommanderHud({
  name,
  hp,
  maxHp,
  influence,
  side,
  resonance,
}: {
  name: string;
  hp: number;
  maxHp: number;
  influence: number;
  side: "player" | "enemy";
  resonance?: number;
}) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  return (
    <div className={cn(
      "min-w-0 rounded-md border bg-black/40 px-3 py-2 backdrop-blur",
      side === "player" ? "border-emerald-300/30" : "border-fuchsia-300/30"
    )}>
      <div className="flex items-center gap-2">
        <Swords className={cn("h-4 w-4", side === "player" ? "text-emerald-200" : "text-fuchsia-200")} />
        <p className="truncate text-sm font-black">{name}</p>
        {typeof resonance === "number" && (
          <span className="rounded bg-cyan-300 px-1.5 py-0.5 text-[10px] font-black text-cyan-950">{resonance}R</span>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-rose-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-bold text-white/60">
        <span>{hp}/{maxHp} HP</span>
        <span>{influence}/30 INF</span>
      </div>
    </div>
  );
}
