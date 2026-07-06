"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import MatchBoard from "@/components/cosmic/match-board";
import MatchHand from "@/components/cosmic/match-hand";
import MatchEffects from "@/components/cosmic/match-effects";
import MatchResultScene from "@/components/cosmic/match-result-scene";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

export default function MatchView() {
  const match = useGame((s) => s.match);
  const commander = useGame((s) => s.commander);
  const playMatch = useGame((s) => s.playMatch);
  const exitToHub = useGame((s) => s.exitToHub);
  const logout = useGame((s) => s.logout);
  const endPlayerTurn = useGame((s) => s.endPlayerTurn);
  const replay = useGame((s) => s.replay);
  const lastRewards = useGame((s) => s.lastRewards);
  const isCampaign = useGame((s) => !!s.campaignChapterId);

  // auto-start a match when entering game view with no match
  useEffect(() => {
    if (commander && !match) playMatch();
  }, [commander, match, playMatch]);

  if (!commander) return null;

  if (!match) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-5xl">✦</div>
        <h2 className="mt-4 text-3xl font-black">Preparing the battlefield…</h2>
      </div>
    );
  }

  const { player, enemy, log, active, phase, turn, aiThinking, winner, convergence, winCondition } = match;
  const pColor = FACTION_COLOR[player.factionId];
  const eColor = FACTION_COLOR[enemy.factionId];
  const playerTurn = active === "player" && phase !== "over";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pb-5 sm:pt-[max(1.25rem,env(safe-area-inset-top))]">
      <MatchEffects />
      {/* top bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          onClick={exitToHub}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Hub
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px]">
            Conquest · Turn {turn}
          </p>
          <p className="truncate text-xs font-bold sm:text-sm">
            {playerTurn ? (
              <span className="text-emerald-300">Your move</span>
            ) : aiThinking ? (
              <span className="animate-pulse text-fuchsia-300">Enemy plotting…</span>
            ) : phase === "over" ? (
              <span>{winner === "player" ? "Victory" : "Defeat"}</span>
            ) : (
              <span className="text-muted-foreground">Waiting…</span>
            )}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          Exit
        </button>
      </div>

      {/* convergence event banner */}
      {convergence && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs">
          <span className="text-base">{convergence.glyph}</span>
          <span className="font-bold text-amber-300">CONVERGENCE: {convergence.name}</span>
          <span className="text-amber-200/70">{convergence.desc}</span>
        </div>
      )}

      {/* main play area: board+hand (left) | log (right on lg) */}
      <div className="grid flex-1 gap-3 lg:grid-cols-[1fr_300px] lg:gap-4">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {/* enemy commander (compact) */}
          <CommanderBar
            name={enemy.name}
            factionId={enemy.factionId}
            color={eColor}
            hp={enemy.hp}
            maxHp={enemy.maxHp}
            resonance={enemy.resonance}
            maxResonance={enemy.maxResonance}
            influence={enemy.influence}
            handCount={enemy.hand.length}
            side="enemy"
            active={!playerTurn && phase !== "over"}
          />

          {/* the board */}
          <MatchBoard />

          {/* player commander (compact) */}
          <CommanderBar
            name={player.name}
            factionId={player.factionId}
            color={pColor}
            hp={player.hp}
            maxHp={player.maxHp}
            resonance={player.resonance}
            maxResonance={player.maxResonance}
            influence={player.influence}
            handCount={player.hand.length}
            side="player"
            active={playerTurn}
          />

          {/* hand + end turn */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                Hand
              </span>
              <Button
                onClick={endPlayerTurn}
                disabled={!playerTurn}
                size="sm"
                className={cn(
                  "h-8 px-4 text-xs font-bold transition",
                  playerTurn
                    ? "bg-amber-400 text-amber-950 hover:bg-amber-300"
                    : "bg-white/5 text-muted-foreground"
                )}
              >
                End Turn →
              </Button>
            </div>
            <MatchHand />
          </div>
        </div>

        {/* battle log: sidebar on lg, drawer on mobile */}
        <div className="hidden lg:block">
          <BattleLogPanel log={log} className="h-full max-h-[640px]" />
        </div>
      </div>

      {/* mobile floating log button + drawer */}
      <div className="lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-card/90 text-lg shadow-lg backdrop-blur-xl transition hover:scale-105 active:scale-95"
              aria-label="Open battle log"
            >
              <span className="relative">
                📜
                {log.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-bold text-emerald-950">
                    {Math.min(log.length, 9)}
                  </span>
                )}
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="border-white/10 bg-card/95 backdrop-blur-xl">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Battle Log
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <BattleLogPanel log={log} className="max-h-[50vh]" />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* victory / defeat overlay */}
      {phase === "over" && (
        <MatchResultScene
          winner={winner}
          winCondition={winCondition}
          rewards={lastRewards}
          isCampaign={isCampaign}
          playerName={player.name}
          enemyName={enemy.name}
          playerFactionId={player.factionId}
          enemyFactionId={enemy.factionId}
          turns={turn}
          playerHpLeft={player.hp}
          enemyHpLeft={enemy.hp}
          onReplay={replay}
          onExit={exitToHub}
        />
      )}
    </div>
  );
}

function CommanderBar({
  name,
  factionId,
  color,
  hp,
  maxHp,
  resonance,
  maxResonance,
  influence,
  handCount,
  side,
  active,
}: {
  name: string;
  factionId: string;
  color: string;
  hp: number;
  maxHp: number;
  resonance: number;
  maxResonance: number;
  influence: number;
  handCount: number;
  side: "player" | "enemy";
  active: boolean;
}) {
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border bg-white/[0.03] p-2 transition-all sm:gap-3 sm:p-2.5",
        active ? "border-white/20" : "border-white/10"
      )}
      style={active ? { boxShadow: `0 0 0 1px ${color}55, 0 0 20px ${color}22` } : undefined}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg sm:h-11 sm:w-11 sm:text-xl"
        style={{ background: `${color}22`, color, boxShadow: active ? `0 0 16px ${color}55` : undefined }}
      >
        {FACTION_GLYPH[factionId]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-bold sm:text-sm" style={{ color }}>
            {name}
          </p>
          <span className="shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground sm:text-[10px]">
            {side === "player" ? "You" : "Enemy"}
          </span>
        </div>
        {/* HP bar */}
        <div className="mt-1 flex items-center gap-1.5">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                side === "player" ? "bg-emerald-400" : "bg-rose-400"
              )}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-[10px] font-bold tabular-nums sm:w-12 sm:text-xs">
            {hp}/{maxHp}
          </span>
        </div>
        {/* resonance + influence + hand */}
        <div className="mt-1 flex items-center gap-2.5 text-[9px] text-muted-foreground sm:text-[10px]">
          <span className="flex items-center gap-0.5">
            <span className="text-cyan-300">◈</span>
            <span className="font-bold tabular-nums text-foreground">
              {resonance}/{maxResonance}
            </span>
          </span>
          <span className="flex items-center gap-0.5" title="Cosmic Influence — reach 20 to Ascend">
            <span className="text-amber-300">✦</span>
            <span className="font-bold tabular-nums text-foreground">{influence}</span>
            <span className="opacity-50">/20</span>
          </span>
          <span className="flex items-center gap-0.5">
            <span>🂠</span>
            <span className="font-bold tabular-nums text-foreground">{handCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function BattleLogPanel({
  log,
  className,
}: {
  log: { id: number; side: string; text: string }[];
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30",
        className
      )}
    >
      <div className="border-b border-white/10 px-3 py-2 lg:hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Battle Log
        </p>
      </div>
      <div
        ref={scrollRef}
        className="scroll-cosmic flex-1 space-y-1.5 overflow-y-auto p-3 text-xs"
      >
        {log.map((e) => (
          <p
            key={e.id}
            className={cn(
              "leading-snug",
              e.side === "player" && "text-emerald-200/90",
              e.side === "enemy" && "text-fuchsia-200/90",
              e.side === "system" && "text-muted-foreground italic"
            )}
          >
            {e.side === "system" ? "· " : e.side === "player" ? "▸ " : "◂ "}
            {e.text}
          </p>
        ))}
      </div>
    </div>
  );
}
