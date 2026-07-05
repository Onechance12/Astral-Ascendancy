"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type WorldType = "Star" | "Corrupted" | "Machine" | "Verdant" | "Crucible" | "Astral" | "Barren" | null;
type Cell = {
  faction: string | null;
  power: number | null;
  kind: "ally" | "enemy" | "structure" | null;
  world: WorldType;
};

const COLS = 5;
const ROWS = 5;

// default demo layout
const INITIAL: Cell[] = [
  { faction: "voidborn", power: 2, kind: "enemy", world: "Corrupted" },
  { faction: null, power: null, kind: null, world: null },
  { faction: null, power: null, kind: null, world: "Astral" },
  { faction: "synthari", power: 1, kind: "enemy", world: "Machine" },
  { faction: null, power: null, kind: null, world: null },
  { faction: null, power: null, kind: null, world: null },
  { faction: "voidborn", power: 4, kind: "enemy", world: null },
  { faction: null, power: null, kind: null, world: "Barren" },
  { faction: null, power: null, kind: null, world: null },
  { faction: null, power: null, kind: null, world: "Machine" },
  { faction: null, power: null, kind: null, world: "Star" },
  { faction: null, power: null, kind: null, world: null },
  { faction: null, power: null, kind: null, world: "Barren" },
  { faction: null, power: null, kind: null, world: null },
  { faction: null, power: null, kind: null, world: "Crucible" },
  { faction: "solari", power: 3, kind: "structure", world: "Star" },
  { faction: null, power: null, kind: null, world: null },
  { faction: "verdant", power: 2, kind: "ally", world: "Verdant" },
  { faction: null, power: null, kind: null, world: null },
  { faction: "crimson", power: 3, kind: "ally", world: "Crucible" },
  { faction: null, power: null, kind: null, world: null },
  { faction: "solari", power: 5, kind: "ally", world: null },
  { faction: null, power: null, kind: null, world: "Astral" },
  { faction: "astral", power: 2, kind: "ally", world: null },
  { faction: null, power: null, kind: null, world: null },
];

const COLORS: Record<string, string> = {
  solari: "#fbbf24",
  voidborn: "#e879f9",
  synthari: "#22d3ee",
  verdant: "#34d399",
  crimson: "#fb7185",
  astral: "#93c5fd",
};

const WORLD_COLORS: Record<Exclude<WorldType, null>, string> = {
  Star: "#fbbf24",
  Corrupted: "#e879f9",
  Machine: "#22d3ee",
  Verdant: "#34d399",
  Crucible: "#fb7185",
  Astral: "#93c5fd",
  Barren: "#94a3b8",
};

const adjacentTo = (i: number) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  return [
    row > 0 ? i - COLS : null,
    row < ROWS - 1 ? i + COLS : null,
    col > 0 ? i - 1 : null,
    col < COLS - 1 ? i + 1 : null,
  ].filter((n): n is number => n !== null);
};

export default function SectorGrid() {
  const [cells, setCells] = useState<Cell[]>(INITIAL);
  const [selected, setSelected] = useState<number | null>(17);

  const click = (i: number) => {
    setSelected(i);
    // demo action: if empty cell adjacent to selected ally, move selected ally here
    if (selected !== null && cells[selected]?.kind === "ally" && cells[i].kind === null) {
      if (adjacentTo(selected).includes(i)) {
        const next = [...cells];
        const source = next[selected];
        const targetWorld = next[i].world;
        next[i] = { ...source, world: targetWorld };
        next[selected] = { faction: null, power: null, kind: null, world: source.world };
        setCells(next);
        setSelected(i);
      }
    }
  };

  const reset = () => {
    setCells(INITIAL);
    setSelected(17);
  };

  const allies = cells.filter((c) => c.kind === "ally").length;
  const enemies = cells.filter((c) => c.kind === "enemy").length;
  const sel = selected !== null ? cells[selected] : null;
  const adjAllies =
    selected !== null && sel?.kind === "ally"
      ? adjacentTo(selected).filter((j) => cells[j].kind === "ally").length
      : 0;
  const controlledWorlds = cells.filter((c) => c.world && (c.kind === "ally" || c.kind === "structure")).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      {/* the grid */}
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-muted-foreground">
            Living Board · 5x5
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
          <div className="relative grid grid-cols-5 gap-1.5 sm:gap-2">
            {cells.map((c, i) => {
              const isSel = i === selected;
              const isAdj =
                selected !== null &&
                adjacentTo(selected).includes(i) &&
                cells[selected]?.kind === "ally";
              const isMoveTarget = isAdj && c.kind === null;
              const color = c.faction ? COLORS[c.faction] : "#ffffff";
              const worldColor = c.world ? WORLD_COLORS[c.world] : "rgba(255,255,255,0.08)";
              return (
                <button
                  key={i}
                  onClick={() => click(i)}
                  className={cn(
                    "preserve-3d relative aspect-square rounded-lg border transition-all duration-200",
                    c.kind === "ally" && "bg-white/[0.06]",
                    c.kind === "enemy" && "bg-white/[0.04]",
                    c.kind === "structure" && "bg-white/[0.05]",
                    c.kind === null && "bg-white/[0.015]",
                    isSel ? "scale-[1.03]" : "hover:scale-[1.02]"
                  )}
                  style={{
                    background: c.world
                      ? `radial-gradient(circle at 50% 50%, ${worldColor}24, rgba(255,255,255,0.015) 68%)`
                      : undefined,
                    borderColor: isSel
                      ? color
                      : isMoveTarget
                      ? "rgba(110,231,183,0.7)"
                      : "rgba(255,255,255,0.08)",
                    boxShadow: isSel ? `0 0 22px ${color}66` : undefined,
                  }}
                  aria-label={`Sector ${i + 1}`}
                >
                  {c.world && (
                    <span
                      className="absolute inset-1 rounded-md opacity-40"
                      style={{ boxShadow: `inset 0 0 18px ${worldColor}88` }}
                    />
                  )}
                  {c.kind && (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold sm:h-8 sm:w-8 sm:text-lg"
                        style={{
                          background: `${color}22`,
                          color,
                          boxShadow: `0 0 14px ${color}55`,
                        }}
                      >
                        {c.kind === "structure" ? "▣" : c.kind === "ally" ? "♞" : "◆"}
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
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl text-emerald-300/70 sm:text-2xl">
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
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-300" /> Held worlds ({controlledWorlds})
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
                {sel.kind === "structure" ? "▣" : sel.kind === "ally" ? "♞" : "◆"}
              </span>
              <div>
                <p className="text-sm font-bold capitalize" style={{ color: COLORS[sel.faction!] }}>
                  {sel.faction} Entity
                </p>
                <p className="text-xs text-muted-foreground">
                  Power {sel.power} · {sel.kind === "ally" || sel.kind === "structure" ? "Allied" : "Hostile"}
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
              <div className="col-span-2 rounded-lg border border-white/10 bg-black/20 p-2.5">
                <p className="text-muted-foreground">World sector</p>
                <p className="text-lg font-bold" style={{ color: sel.world ? WORLD_COLORS[sel.world] : undefined }}>
                  {sel.world ?? "Empty space"}
                </p>
              </div>
            </div>
            <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2.5 text-xs text-emerald-200/80">
              {sel.kind === "ally"
                ? "Click an orthogonally adjacent empty sector to move. Worlds change resource pressure, movement value, and future structure placement."
                : sel.kind === "structure"
                ? "Structure online. Protected structures turn controlled worlds into resources, shields, drones, portals, or pressure."
                : "Hostile entity. Contest its world, cut off adjacent support, or force it away from valuable terrain."}
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-muted-foreground">
            {sel?.world
              ? `${sel.world} world. Empty worlds can be claimed, built on, corrupted, purified, or used to complete objectives.`
              : "Empty sector. Select an allied entity to plan a move."}
          </div>
        )}
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground/80">Tactical identity:</span> Every sector
            changes the battle. Worlds, structures, movement, Affinity, and Influence turn the
            board into a living map instead of a row of card slots.
          </p>
        </div>
      </div>
    </div>
  );
}
