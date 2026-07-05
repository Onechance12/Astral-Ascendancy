"use client";

import { useRef, useState } from "react";
import type { SampleCard } from "@/lib/game-data";
import { FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const RARITY_STYLE: Record<
  SampleCard["rarity"],
  { ring: string; label: string; holo: boolean; chip: string }
> = {
  Common: { ring: "rgba(148,163,184,0.5)", label: "Common", holo: false, chip: "bg-slate-500/20 text-slate-200 border-slate-400/30" },
  Uncommon: { ring: "rgba(52,211,153,0.6)", label: "Uncommon", holo: false, chip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" },
  Rare: { ring: "rgba(34,211,238,0.7)", label: "Rare", holo: false, chip: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30" },
  Holo: { ring: "rgba(167,139,250,0.8)", label: "Holo", holo: true, chip: "bg-violet-500/20 text-violet-200 border-violet-400/40" },
  Mythic: { ring: "rgba(251,146,60,0.9)", label: "Mythic", holo: true, chip: "bg-orange-500/25 text-orange-200 border-orange-400/40" },
  Singularity: { ring: "rgba(232,121,249,1)", label: "Singularity", holo: true, chip: "bg-fuchsia-500/25 text-fuchsia-100 border-fuchsia-300/50" },
};

export default function GameCard({
  card,
  className,
  index = 0,
}: {
  card: SampleCard;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [hover, setHover] = useState(false);

  const faction = FACTIONS.find((f) => f.id === card.faction)!;
  const rar = RARITY_STYLE[card.rarity];

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 18; // rotateY
    const rx = -(py - 0.5) * 18; // rotateX
    setTilt({ rx, ry, mx: px * 100, my: py * 100 });
  };

  const reset = () => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
    setHover(false);
  };

  return (
    <div
      className={cn("perspective-1000 select-none", className)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={reset}
        className="preserve-3d relative aspect-[3/4.2] w-full transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hover ? 1.04 : 1})`,
        }}
      >
        {/* glow */}
        <div
          className="absolute -inset-3 rounded-[1.6rem] blur-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(60% 60% at 50% 40%, ${faction.accentSoft}, transparent 70%)`,
            opacity: hover ? 0.9 : 0.4,
          }}
          aria-hidden="true"
        />

        {/* card body */}
        <div
          className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-2xl"
          style={{ borderColor: rar.ring, boxShadow: `0 18px 50px -20px ${faction.glow}` }}
        >
          {/* top cost + faction bar */}
          <div
            className="relative flex items-center justify-between px-3 py-2 text-xs font-semibold"
            style={{
              background: `linear-gradient(90deg, ${faction.accentSoft}, transparent)`,
            }}
          >
            <span
              className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold"
              style={{ background: faction.accent, color: "#0b0a14" }}
            >
              {card.cost}
            </span>
            <span className="flex items-center gap-1 text-foreground/80">
              <span style={{ color: faction.accent }}>{faction.glyph}</span>
              {faction.short}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                rar.chip
              )}
            >
              {rar.label}
            </span>
          </div>

          {/* art frame */}
          <div className="relative mx-3 overflow-hidden rounded-lg border border-white/10">
            <div
              className="aspect-[4/3] w-full bg-cover bg-center"
              style={{
                backgroundImage: card.art ? `url(${card.art})` : undefined,
                backgroundColor: faction.accentSoft,
              }}
            >
              {!card.art && (
                <div className="flex h-full w-full items-center justify-center text-5xl" style={{ color: faction.accent }}>
                  {faction.glyph}
                </div>
              )}
            </div>
            {/* holo overlay */}
            {rar.holo && (
              <div
                className="card-holo pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hover ? 0.85 : 0.4,
                  background: `linear-gradient(${tilt.mx + tilt.my}deg, ${faction.accent}22, transparent 30%, ${faction.accent}33 50%, transparent 70%, ${faction.accent}22)`,
                }}
              />
            )}
            {/* type chip */}
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
              {card.type}
            </span>
            {card.power !== "—" && card.power !== "30 HP" && (
              <span
                className="absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-black"
                style={{ background: faction.accent }}
              >
                {card.power}
              </span>
            )}
            {card.power === "30 HP" && (
              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-amber-400 px-1.5 py-0.5 text-[11px] font-extrabold text-black">
                30 HP
              </span>
            )}
          </div>

          {/* name */}
          <div className="px-3 pt-2.5">
            <h4
              className="text-[15px] font-bold leading-tight"
              style={{ color: faction.accent }}
            >
              {card.name}
            </h4>
          </div>

          {/* text box */}
          <div className="mx-3 mt-2 flex-1 overflow-hidden rounded-md border border-white/10 bg-black/30 p-2.5">
            <p className="text-[11px] leading-snug text-foreground/85">
              {card.text}
            </p>
          </div>

          {/* flavor */}
          <div className="px-3 pb-2 pt-1.5">
            <p className="line-clamp-2 text-[10px] italic leading-tight text-muted-foreground">
              {card.flavor}
            </p>
          </div>

          {/* bottom faction strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${faction.accent}, transparent, ${faction.accent})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
