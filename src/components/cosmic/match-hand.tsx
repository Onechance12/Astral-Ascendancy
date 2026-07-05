"use client";

import { useGame } from "@/store/game-store";
import { canPlay } from "@/lib/match-engine";
import { FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

export default function MatchHand() {
  const match = useGame((s) => s.match);
  const selectHand = useGame((s) => s.selectHand);
  const playAnomaly = useGame((s) => s.playAnomaly);
  const selectedIdx = useGame((s) => s.match?.selectedHandIdx ?? null);

  if (!match) return null;
  const { hand } = match.player;

  if (hand.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-muted-foreground">
        Hand empty — draw next turn
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scroll-cosmic sm:gap-2.5">
      {hand.map((card, idx) => {
        const playable = canPlay(match, idx) && match.active === "player" && match.phase === "main";
        const selected = selectedIdx === idx;
        const color = FACTION_COLOR[card.faction];
        const glyph = FACTION_GLYPH[card.faction];
        return (
          <button
            key={card.uid}
            onClick={() => {
              if (match.active !== "player" || match.phase === "over") return;
              if (card.type === "Anomaly") {
                if (playable) playAnomaly(idx);
                return;
              }
              selectHand(selected ? null : idx);
            }}
            className={cn(
              "group relative flex h-28 w-[4rem] shrink-0 flex-col overflow-hidden rounded-lg border bg-card/80 transition-all duration-200 sm:h-36 sm:w-[5.2rem]",
              selected ? "-translate-y-2 border-white/40 shadow-lg" : "border-white/10",
              !playable && "opacity-55",
              playable && !selected && "hover:-translate-y-1"
            )}
            style={{
              borderColor: selected ? color : undefined,
              boxShadow: selected ? `0 0 24px ${color}66` : undefined,
            }}
          >
            {/* cost orb */}
            <span
              className="absolute left-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-black"
              style={{ background: color }}
            >
              {card.cost}
            </span>
            {card.type === "Anomaly" && (
              <span className="absolute right-1 top-1 z-10 rounded bg-violet-500/30 px-1 text-[8px] font-bold uppercase text-violet-200">
                ✺
              </span>
            )}

            {/* art */}
            <div
              className="h-10 w-full bg-cover bg-center sm:h-14"
              style={{
                backgroundImage: card.art ? `url(${card.art})` : undefined,
                backgroundColor: `${color}1a`,
              }}
            >
              {!card.art && (
                <div className="flex h-full w-full items-center justify-center text-lg sm:text-xl" style={{ color }}>
                  {glyph}
                </div>
              )}
            </div>

            {/* name */}
            <div className="px-1 pt-0.5">
              <p className="truncate text-[8px] font-bold leading-tight sm:text-[10px]" style={{ color }}>
                {card.name}
              </p>
            </div>

            {/* stats / text */}
            <div className="mt-auto px-1 pb-1">
              {card.type === "Entity" ? (
                <div className="flex items-center justify-between text-[10px] font-bold tabular-nums">
                  <span style={{ color }}>⚔{card.attack}</span>
                  <span className="text-rose-300">♥{card.hp}</span>
                </div>
              ) : (
                <p className="line-clamp-2 text-[7.5px] leading-tight text-muted-foreground sm:text-[8px]">
                  {card.text}
                </p>
              )}
            </div>

            {/* unplayable tint */}
            {!playable && card.cost > match.player.resonance && (
              <span className="pointer-events-none absolute inset-0 bg-black/40" />
            )}
          </button>
        );
      })}
    </div>
  );
}
