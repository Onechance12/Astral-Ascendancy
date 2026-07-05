"use client";

import { useGame } from "@/store/game-store";
import {
  deployTargetFor,
  playerAttackTarget,
  rowOf,
  colOf,
  type Sector,
} from "@/lib/match-engine";
import { FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

export default function MatchBoard() {
  const match = useGame((s) => s.match);
  const selectHand = useGame((s) => s.selectHand);
  const selectAttacker = useGame((s) => s.selectAttacker);
  const playSelected = useGame((s) => s.playSelected);
  const attack = useGame((s) => s.attack);

  if (!match) return null;

  const { sectors, selectedHandIdx, selectedAttacker, active, phase } = match;

  // deployable sector indices when a hand entity is selected
  const deployable = new Set<number>();
  if (selectedHandIdx !== null && match.player.hand[selectedHandIdx]?.type === "Entity") {
    for (let col = 0; col < 3; col++) {
      const t = deployTargetFor("player", col, sectors);
      if (t !== null) deployable.add(t);
    }
  }

  // attack target sector when an attacker is selected
  let attackTarget: number | "commander" | null = null;
  if (selectedAttacker !== null) {
    attackTarget = playerAttackTarget(selectedAttacker, sectors);
  }

  const onSectorClick = (i: number) => {
    if (phase === "over" || active !== "player") return;
    // 1. deploying a selected hand card
    if (selectedHandIdx !== null && deployable.has(i)) {
      playSelected(colOf(i));
      return;
    }
    const cell = sectors[i];
    // 2. execute attack by clicking the highlighted enemy target sector
    if (
      selectedAttacker !== null &&
      attackTarget !== null &&
      attackTarget !== "commander" &&
      attackTarget === i
    ) {
      attack(selectedAttacker);
      return;
    }
    // 3. select own attacker; if already selected, execute the attack
    if (cell && cell.ownerSide === "player" && cell.canAttack) {
      if (selectedAttacker === i) {
        attack(i);
      } else {
        selectAttacker(i);
      }
      return;
    }
    // 4. clicking elsewhere clears selection
    if (selectedHandIdx !== null) selectHand(null);
    if (selectedAttacker !== null) selectAttacker(null);
  };

  return (
    <div className="relative">
      {/* lane labels + enemy commander target indicator */}
      <div className="mb-2 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>Sector Grid · 3 lanes</span>
        {attackTarget === "commander" && (
          <span className="animate-pulse rounded-full bg-rose-500/20 px-2 py-0.5 text-rose-300">
            ⚠ Strike the enemy Commander
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-4">
        <div className="grid-pattern absolute inset-0 rounded-2xl opacity-30" />

        {/* the 3x3 grid */}
        <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
          {sectors.map((cell, i) => (
            <SectorCell
              key={i}
              index={i}
              cell={cell}
              isDeployable={deployable.has(i)}
              isAttacker={selectedAttacker === i}
              isAttackTarget={attackTarget === i}
              dimmed={
                selectedHandIdx !== null &&
                !deployable.has(i) &&
                (!cell || cell.ownerSide !== "player")
              }
              onClick={() => onSectorClick(i)}
            />
          ))}
        </div>

        {/* enemy commander strike zone (top) */}
        {attackTarget === "commander" && selectedAttacker !== null && (
          <button
            onClick={() => attack(selectedAttacker)}
            className="absolute left-1/2 top-1 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-rose-400/60 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.5)] backdrop-blur animate-pulse"
          >
            ⚔ Strike Commander
          </button>
        )}
      </div>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Your Entity
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-fuchsia-400" /> Enemy Entity
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400/40 ring-1 ring-emerald-400" /> Deployable
        </span>
        <span>· Tap a ⚔ unit, then tap it again (or its target) to strike</span>
      </div>
    </div>
  );
}

function SectorCell({
  index,
  cell,
  isDeployable,
  isAttacker,
  isAttackTarget,
  dimmed,
  onClick,
}: {
  index: number;
  cell: Sector;
  isDeployable: boolean;
  isAttacker: boolean;
  isAttackTarget: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  const isPlayer = cell?.ownerSide === "player";
  const color = cell ? FACTION_COLOR[cell.faction] : "#ffffff";
  const glyph = cell ? FACTION_GLYPH[cell.faction] : "";
  const row = rowOf(index);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-lg border p-1 transition-all duration-200 sm:aspect-[4/5]",
        cell ? "bg-white/[0.06]" : "bg-white/[0.015]",
        isDeployable && "bg-emerald-400/10 hover:bg-emerald-400/20",
        isAttacker && "scale-[1.04]",
        dimmed && "opacity-40",
        isAttackTarget && "ring-2 ring-rose-400"
      )}
      style={{
        borderColor: isAttacker
          ? color
          : isDeployable
          ? "rgba(52,211,153,0.6)"
          : isAttackTarget
          ? "rgba(244,63,94,0.7)"
          : "rgba(255,255,255,0.08)",
        boxShadow: isAttacker ? `0 0 22px ${color}66` : undefined,
      }}
      aria-label={`Lane ${colOfLabel(index)}, row ${row + 1}`}
    >
      {/* sector number */}
      <span className="absolute left-1 top-0.5 text-[8px] font-bold text-white/20">
        {row === 0 ? "▲" : row === 2 ? "▼" : "·"}
      </span>

      {cell ? (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-0.5",
            cell.justDeployed && (cell.ownerSide === "player" ? "animate-deploy-in" : "animate-deploy-in-enemy"),
            cell.evolved && cell.justDeployed === false && "animate-evolve-burst"
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-base sm:h-9 sm:w-9 sm:text-xl",
              isAttacker && "animate-attack-lunge"
            )}
            style={{
              background: `${color}22`,
              color,
              boxShadow: `0 0 12px ${color}55`,
            }}
          >
            {glyph}
          </div>
          <div
            className="flex items-center gap-1 rounded px-1 text-[9px] font-bold tabular-nums text-black sm:text-[10px]"
            style={{ background: color }}
          >
            <span>{cell.attack}</span>
            <span className="opacity-60">/</span>
            <span>{cell.hp}</span>
          </div>
          {/* status flags */}
          <div className="flex h-3 items-center gap-0.5">
            {cell.evolved && (
              <span className="text-[8px] font-bold text-amber-300" title="Evolved">↟</span>
            )}
            {cell.canAttack && cell.ownerSide === "player" && (
              <span className="text-[8px] text-emerald-300">⚔</span>
            )}
            {cell.justDeployed && (
              <span className="text-[8px] text-amber-300">✦</span>
            )}
            {cell.keyword === "Guardian" && (
              <span className="text-[8px] text-cyan-300">◆</span>
            )}
            {cell.keyword === "Trample" && (
              <span className="text-[8px] text-fuchsia-300">⚣</span>
            )}
          </div>
          {/* damage tint if wounded */}
          {cell.hp < cell.maxHp && (
            <span className="absolute inset-0 rounded-lg bg-rose-500/10" />
          )}
          {/* strike hint on selected attacker */}
          {isAttacker && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-1.5 text-[8px] font-bold text-emerald-950 shadow">
              TAP TO STRIKE
            </span>
          )}
        </div>
      ) : isDeployable ? (
        <span className="text-2xl text-emerald-300/70">+</span>
      ) : null}

      {/* strike hint on attack target */}
      {isAttackTarget && (
        <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 text-[8px] font-bold text-white shadow">
          ⚔ TARGET
        </span>
      )}
    </button>
  );
}

function colOfLabel(i: number) {
  return colOf(i) + 1;
}
