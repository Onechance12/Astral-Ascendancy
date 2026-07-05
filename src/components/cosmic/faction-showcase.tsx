"use client";

import { useState } from "react";
import { FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

export default function FactionShowcase() {
  const [active, setActive] = useState(0);
  const f = FACTIONS[active];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
      {/* LEFT: selector list */}
      <div className="flex flex-col gap-2">
        {FACTIONS.map((fac, i) => {
          const isActive = i === active;
          return (
            <button
              key={fac.id}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300",
                isActive
                  ? "border-white/20 bg-white/[0.06]"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              )}
              style={
                isActive
                  ? { boxShadow: `0 0 0 1px ${fac.accent}66, 0 12px 40px -16px ${fac.glow}` }
                  : undefined
              }
              aria-pressed={isActive}
            >
              {/* accent bar */}
              <span
                className="absolute left-0 top-0 h-full w-1 transition-all duration-300"
                style={{
                  background: fac.accent,
                  opacity: isActive ? 1 : 0.25,
                  transform: isActive ? "scaleY(1)" : "scaleY(0.4)",
                  transformOrigin: "center",
                }}
              />
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: fac.accentSoft,
                  color: fac.accent,
                  boxShadow: isActive ? `0 0 24px ${fac.glow}` : "none",
                }}
              >
                {fac.glyph}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "truncate text-sm font-bold transition-colors",
                      isActive ? "text-foreground" : "text-foreground/70"
                    )}
                  >
                    {fac.name}
                  </h3>
                  {isActive && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: fac.accentSoft, color: fac.accent }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{fac.tagline}</p>
                {/* difficulty meter */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Skill
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, d) => (
                      <span
                        key={d}
                        className="h-1.5 w-4 rounded-full transition-colors"
                        style={{
                          background: d < fac.difficulty ? fac.accent : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT: detail panel */}
      <div
        key={f.id}
        className="animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden rounded-2xl border border-white/10 p-6"
        style={{
          background: `linear-gradient(150deg, ${f.accentSoft}, rgba(255,255,255,0.02) 60%)`,
        }}
      >
        {/* big glyph watermark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 select-none text-[12rem] font-bold leading-none opacity-[0.08]"
          style={{ color: f.accent }}
        >
          {f.glyph}
        </span>

        <div className="relative">
          <div className="flex items-center gap-3">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
              style={{ background: f.accentSoft, color: f.accent, boxShadow: `0 0 30px ${f.glow}` }}
            >
              {f.glyph}
            </span>
            <div>
              <h3 className="text-xl font-extrabold" style={{ color: f.accent }}>
                {f.name}
              </h3>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {f.trait}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground/85">{f.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span
              className="rounded-full border px-3 py-1 font-medium"
              style={{ borderColor: `${f.accent}55`, color: f.accent, background: f.accentSoft }}
            >
              {f.playstyle}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-foreground/70">
              Resource: {f.resonance}
            </span>
          </div>

          <div className="mt-5">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Signature Abilities
            </h4>
            <ul className="space-y-2">
              {f.abilities.map((a) => (
                <li
                  key={a.name}
                  className="rounded-lg border border-white/10 bg-black/20 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: f.accent }}
                    />
                    <span className="text-sm font-bold" style={{ color: f.accent }}>
                      {a.name}
                    </span>
                  </div>
                  <p className="mt-1 pl-3.5 text-xs leading-snug text-foreground/75">{a.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
