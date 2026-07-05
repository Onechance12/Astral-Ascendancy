"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/store/game-store";
import { colOf, rowOf } from "@/lib/match-engine";

type Effect = {
  id: number;
  type: "damage" | "clash" | "deploy" | "death" | "evolve" | "commander-hit";
  sectorIdx?: number; // for board-positioned effects
  side?: "player" | "enemy"; // which commander for commander-hit
  amount?: number; // damage amount
  text?: string; // text to show
};

let effectId = 0;

export default function MatchEffects() {
  const match = useGame((s) => s.match);
  const [effects, setEffects] = useState<Effect[]>([]);
  const lastLogLen = useRef(0);

  // Watch the battle log for new entries and spawn effects
  useEffect(() => {
    if (!match) return;
    const newEntries = match.log.slice(lastLogLen.current);
    lastLogLen.current = match.log.length;

    const newEffects: Effect[] = [];
    for (const entry of newEntries) {
      const text = entry.text;
      // detect "clashes" — extract damage numbers
      const clashMatch = text.match(/(\d+)\) clashes/);
      if (clashMatch) {
        // find which sector — we can't know exactly from log, so show on center
        newEffects.push({
          id: effectId++,
          type: "clash",
          text: "⚔",
        });
        // also show damage numbers
        const dmg = parseInt(clashMatch[1]);
        newEffects.push({
          id: effectId++,
          type: "damage",
          amount: dmg,
          side: "enemy",
        });
      }
      // detect "strikes ... for N"
      const strikeMatch = text.match(/strikes .* for (\d+)/);
      if (strikeMatch) {
        const dmg = parseInt(strikeMatch[1]);
        const side = entry.side === "player" ? "enemy" : "player";
        newEffects.push({
          id: effectId++,
          type: "commander-hit",
          side,
          amount: dmg,
        });
      }
      // detect "hits ... for N" (enemy attacks player)
      const hitMatch = text.match(/hits .* for (\d+)/);
      if (hitMatch) {
        const dmg = parseInt(hitMatch[1]);
        newEffects.push({
          id: effectId++,
          type: "commander-hit",
          side: "player",
          amount: dmg,
        });
      }
      // detect "ascends into" — evolution burst
      if (text.includes("ascends into")) {
        newEffects.push({
          id: effectId++,
          type: "evolve",
          text: "↟ EVOLVE",
        });
      }
      // detect "is destroyed" — death dissolve
      if (text.includes("is destroyed")) {
        newEffects.push({
          id: effectId++,
          type: "death",
        });
      }
    }

    if (newEffects.length > 0) {
      const effectIds = new Set(newEffects.map((effect) => effect.id));
      let removeTimer: ReturnType<typeof setTimeout> | undefined;
      const addTimer = setTimeout(() => {
        setEffects((prev) => [...prev, ...newEffects]);
        removeTimer = setTimeout(() => {
          setEffects((prev) => prev.filter((effect) => !effectIds.has(effect.id)));
        }, 1300);
      }, 0);

      return () => {
        clearTimeout(addTimer);
        if (removeTimer) clearTimeout(removeTimer);
      };
    }
  }, [match?.log]);

  if (!match) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {effects.map((eff) => {
        if (eff.type === "commander-hit" && eff.side) {
          // position near the top (enemy) or bottom (player) center
          const top = eff.side === "enemy" ? "12%" : "72%";
          return (
            <div
              key={eff.id}
              className="animate-damage-float absolute left-1/2 -translate-x-1/2 text-center"
              style={{ top }}
            >
              <span className="text-4xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                -{eff.amount}
              </span>
            </div>
          );
        }
        if (eff.type === "clash") {
          // center of the board
          return (
            <div
              key={eff.id}
              className="animate-clash-flash absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
            >
              <span className="drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">⚡</span>
            </div>
          );
        }
        if (eff.type === "evolve") {
          return (
            <div
              key={eff.id}
              className="animate-evolve-burst absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <span className="text-3xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                ↟ EVOLVE
              </span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
