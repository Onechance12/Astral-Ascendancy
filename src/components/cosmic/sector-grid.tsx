"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Cell = { faction: string | null; power: number | null; kind: "ally" | "enemy" | null };

const COLS = 3;
const ROWS = 3;

// default demo layout
const INITIAL: Cell[] = [
  { faction: "voidborn", power: 4, kind: "enemy" },
  { faction: null, power: null, kind: null },
  { faction: "voidborn", power: 2, kind: "enemy" },
  { faction: null, power: null, kind: null },
  { faction: "solari", power: 5, kind: "ally" },
  { faction: null, power: null, kind: null },
  { faction: "reavers", power: 4, kind: "ally" },
  { faction: null, power: null, kind: null },
  { faction: "crystalline", power: 3, kind: "ally" },
];

const COLORS: Record<string, string> = {
  solari: "#fbbf24",
  voidborn: "#e879f9",
  crystalline: "#22d3ee",
  reavers: "#fb923c",
  quantum: "#34d399",
};

const ADJ = [
  [1, 3, 4],
  [0, 2, 4],
  [1, 4, 5],
  [0, 4, 6],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [2, 4, 8],
  [3, 4, 7],
  [4, 6, 8],
  [4, 5, 7],
];

export default function SectorGrid() {
  const [cells, setCells] = useState<Cell[]>(INITIAL);
  const [selected, setSelected] = useState<number | null>(4);

  const click = (i: number) => {
    setSelected(i);
    // demo action: if empty cell adjacent to selected ally, move selected ally here
    if (selected !== null && cells[selected]?.kind === "ally" && cells[i].kind === null) {
      if (ADJ[selected].includes(i)) {
        const next = [...cells];
        next[i] = next[selected];
        next[selected] = { faction: null, power: null, kind: null };
        setCells(next);
        setSelected(i);
      }
    }
  };

  const reset = () => {
    setCells(INITIAL);
    setSelected(4);
  };

  const allies = cells.filter((c) => c.kind === "ally").length;
  const enemies = cells.filter((c) => c.kind === "enemy").length;
  const sel = selected !== null ? cells[selected] : null;
  const adjAllies =
    selected !== null && sel?.kind === "ally"
      ? ADJ[selected].filter((j) => cells[j].kind === "ally").length
      : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      {/* the grid */}
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-muted-foreground">
            Sector Grid · 3×3
          </span>
          <button
            onClick={reset}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-foreground/70 transition hover:bg-white/10"
          >
            Reset
          </button>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="grid-pattern absolute inset-0 rounded-2xl opacity-40" />
          <div className="relative grid grid-cols-3 gap-2">
            {cells.map((c, i) => {
              const isSel = i === selected;
              const isAdj =
                selected !== null &&
                ADJ[selected].includes(i) &&
                cells[selected]?.kind === "ally";
              const isMoveTarget = isAdj && c.kind === null;
              const color = c.faction ? COLORS[c.faction] : "#ffffff";
              return (
                <button
                  key={i}
                  onClick={() => click(i)}
                  className={cn(
                    "preserve-3d relative aspect-square rounded-lg border transition-all duration-200",
                    c.kind === "ally" && "bg-white/[0.06]",
                    c.kind === "enemy" && "bg-white/[0.04]",
                    c.kind === null && "bg-white/[0.015]",
                    isSel ? "scale-[1.03]" : "hover:scale-[1.02]"
                  )}
                  style={{
                    borderColor: isSel
                      ? color
                      : isMoveTarget
                      ? "rgba(110,231,183,0.7)"
                      : "rgba(255,255,255,0.08)",
                    boxShadow: isSel ? `0 0 22px ${color}66` : undefined,
                  }}
                  aria-label={`Sector ${i + 1}`}
                >
                  {c.kind && (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-bold"
                        style={{
                          background: `${color}22`,
                          color,
                          boxShadow: `0 0 14px ${color}55`,
                        }}
                      >
                        {c.kind === "ally" ? "♞" : "▣"}
                      </span>
                      <span
                        className="rounded px-1 text-[10px] font-bold tabular-nums text-black"
                        style={{ background: color }}
                      >
                        {c.power}
                      </span>
                    </div>
                  )}
                  {isMoveTarget && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl text-emerald-300/70">
                      ✛
                    </span>
                  )}
                  <span className="absolute left-1 top-0.5 text-[9px] font-bold text-white/20">
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> You ({allies})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400" /> Enemy ({enemies})
          </span>
        </div>
      </div>

      {/* inspector */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Sector Inspector
        </h4>
        {sel?.kind ? (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{
                  background: `${COLORS[sel.faction!]}22`,
                  color: COLORS[sel.faction!],
                }}
              >
                {sel.kind === "ally" ? "♞" : "▣"}
              </span>
              <div>
                <p className="text-sm font-bold capitalize" style={{ color: COLORS[sel.faction!] }}>
                  {sel.faction} Entity
                </p>
                <p className="text-xs text-muted-foreground">
                  Power {sel.power} · {sel.kind === "ally" ? "Allied" : "Hostile"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                <p className="text-muted-foreground">Adjacent allies</p>
                <p className="text-lg font-bold text-foreground">{adjAllies}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                <p className="text-muted-foreground">Adjacency buff</p>
                <p className="text-lg font-bold text-emerald-300">+{adjAllies}/+{adjAllies}</p>
              </div>
            </div>
            <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2.5 text-xs text-emerald-200/80">
              {sel.kind === "ally"
                ? "Click an adjacent empty sector to move. Adjacency grants +1/+1 per neighboring ally — positioning is power."
                : "Hostile entity. Surround it with allies to flank and neutralize its sector buff."}
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-muted-foreground">
            Empty sector. Select an allied entity to plan a move.
          </div>
        )}
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground/80">Tactical identity:</span> Every sector
            changes the battle. Flanking, adjacency buffs, sector-locking anomalies, and orbital
            strikes turn each deployment into a spatial puzzle.
          </p>
        </div>
      </div>
    </div>
  );
}
