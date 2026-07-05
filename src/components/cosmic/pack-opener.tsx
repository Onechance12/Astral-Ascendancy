"use client";

import { useState, type ReactNode } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

const RARITY_COLOR: Record<string, string> = {
  Common: "rgba(148,163,184,0.5)",
  Uncommon: "rgba(52,211,153,0.6)",
  Rare: "rgba(34,211,238,0.7)",
  Holo: "rgba(167,139,250,0.8)",
  Mythic: "rgba(251,146,60,0.9)",
  Singularity: "rgba(232,121,249,1)",
};

type RevealedCard = {
  defId: string;
  name: string;
  category: string;
  faction?: string;
  rarity: string;
  art?: string;
  isNew: boolean;
};

export default function PackOpener({ onClose }: { onClose: () => void }) {
  const commander = useGame((s) => s.commander);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const [phase, setPhase] = useState<"idle" | "charging" | "shaking" | "burst" | "revealing" | "done">("idle");
  const [cards, setCards] = useState<RevealedCard[]>([]);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [shardsLeft, setShardsLeft] = useState(commander?.shards || 0);

  const PACK_COST = 100;

  const openPack = async () => {
    if (!commander || commander.shards < PACK_COST) {
      toast.error("Need 100 shards");
      return;
    }
    setPhase("charging");
    await new Promise((r) => setTimeout(r, 650));
    setPhase("shaking");
    await new Promise((r) => setTimeout(r, 1200));
    setPhase("burst");
    await new Promise((r) => setTimeout(r, 500));
    // call API
    const res = await fetch("/api/packs/open", { method: "POST" });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Could not open pack");
      setPhase("idle");
      return;
    }
    const data = await res.json();
    setCards(data.cards);
    setShardsLeft(data.shardsLeft);
    setPhase("revealing");
    setRevealIdx(0);
    // reveal one by one
    for (let i = 0; i < data.cards.length; i++) {
      setRevealIdx(i);
      const card = data.cards[i];
      const delay = ["Mythic", "Singularity"].includes(card?.rarity) ? 900 : ["Holo", "Rare"].includes(card?.rarity) ? 700 : 480;
      await new Promise((r) => setTimeout(r, delay));
    }
    setPhase("done");
    // refresh shards in store
    hydrateSession();
  };

  const reset = () => {
    setPhase("idle");
    setCards([]);
    setRevealIdx(-1);
  };

  const canAfford = (commander?.shards || 0) >= PACK_COST;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black/85 p-4 backdrop-blur-md">
      <div className="nebula-radial absolute inset-0 opacity-60" />
      <div className="grid-pattern absolute inset-0 opacity-20" />
      <div className={cn("pack-starfield absolute inset-0 opacity-70", (phase === "charging" || phase === "shaking" || phase === "burst") && "pack-starfield-warp")} />
      <div className="relative w-full max-w-2xl">
        {/* IDLE: pack preview + open button */}
        {phase === "idle" && (
          <div className="text-center">
            <button onClick={onClose} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg text-foreground/60 hover:bg-white/10">
              ✕
            </button>
            <h2 className="mb-1 text-2xl font-black">Signal Pack</h2>
            <p className="mb-6 text-sm text-muted-foreground">5 cards · 1 guaranteed Uncommon+</p>
            {/* pack visual */}
            <div className="relative mx-auto mb-6 h-64 w-44">
              <div className="pack-orbit-ring absolute -inset-10 rounded-full border border-emerald-300/20" />
              <div className="pack-orbit-ring absolute -inset-6 rounded-full border border-cyan-300/15 [animation-delay:-1.1s]" />
              <div
                className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 via-fuchsia-400/10 to-cyan-400/20 shadow-[0_0_60px_rgba(52,211,153,0.3)] transition hover:scale-[1.03] hover:shadow-[0_0_90px_rgba(52,211,153,0.45)]"
                style={{
                  backgroundImage: "url(/hero-bg.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/30">
                  <span className="text-5xl">✦</span>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">Signal</p>
                  <p className="text-[10px] text-muted-foreground">5 cards</p>
                </div>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-center gap-2 text-sm">
              <span className="text-cyan-300">◈</span>
              <span className="font-bold tabular-nums">{commander?.shards || 0}</span>
              <span className="text-muted-foreground">/ {PACK_COST} shards</span>
            </div>
            <Button
              onClick={openPack}
              disabled={!canAfford}
              className={cn(
                "px-8 py-3 text-sm font-bold",
                canAfford ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300" : "bg-white/10 text-muted-foreground"
              )}
            >
              {canAfford ? "✦ Open Pack (100 ◈)" : "Need more shards"}
            </Button>
          </div>
        )}

        {phase === "charging" && (
          <PackRitualStage label="Linking command signal" tone="text-cyan-300">
            <div className="animate-pack-charge relative mx-auto h-64 w-44">
              <PackVisual />
              <div className="absolute -inset-12 rounded-full border border-cyan-300/20 shadow-[0_0_80px_rgba(34,211,238,0.35)]" />
              <div className="absolute -inset-4 rounded-full border border-fuchsia-300/20" />
            </div>
          </PackRitualStage>
        )}

        {/* SHAKING: pack shakes then bursts */}
        {phase === "shaking" && (
          <PackRitualStage label="Containment failing" tone="text-emerald-300">
            <div className="animate-pack-shake relative mx-auto h-64 w-44">
              <PackVisual hot />
            </div>
          </PackRitualStage>
        )}

        {phase === "burst" && (
          <PackRitualStage label="Signal breach" tone="text-fuchsia-300">
            <div className="pack-burst-flash absolute inset-0" />
            <div className="animate-pack-burst relative mx-auto h-64 w-44">
              <PackVisual hot />
            </div>
          </PackRitualStage>
        )}

        {/* REVEALING / DONE: cards flip in one by one */}
        {(phase === "revealing" || phase === "done") && (
          <div>
            <h2 className="mb-4 text-center text-xl font-black text-emerald-300">Pack Opened!</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {cards.map((card, i) => {
                const revealed = i <= revealIdx;
                const isWorldCard = ["planet", "development", "crew", "world", "structure", "attachment", "science", "project", "skill", "relic", "evolution"].includes(card.category);
                const color = isWorldCard
                  ? (card.category === "planet" ? "#fbbf24" : card.category === "development" ? "#22d3ee" : card.category === "world" ? "#67e8f9" : card.category === "structure" ? "#a78bfa" : card.category === "attachment" ? "#fb923c" : card.category === "science" ? "#38bdf8" : card.category === "project" ? "#34d399" : card.category === "skill" ? "#facc15" : card.category === "relic" ? "#c084fc" : card.category === "evolution" ? "#4ade80" : "#34d399")
                  : (FACTION_COLOR[card.faction || ""] || "#94a3b8");
                const glyph = isWorldCard
                  ? (card.category === "planet" ? "🪐" : card.category === "development" ? "⚡" : card.category === "world" ? "⬢" : card.category === "structure" ? "▣" : card.category === "attachment" ? "⚙" : card.category === "science" ? "⌬" : card.category === "project" ? "▤" : card.category === "skill" ? "✦" : card.category === "relic" ? "◆" : card.category === "evolution" ? "↟" : "👥")
                  : (FACTION_GLYPH[card.faction || ""] || "?");
                const rarityColor = RARITY_COLOR[card.rarity] || "rgba(148,163,184,0.5)";
                const isHighRarity = ["Holo", "Mythic", "Singularity"].includes(card.rarity);
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden rounded-lg border-2 bg-black/40",
                      revealed ? "animate-card-reveal" : "opacity-30"
                    )}
                    style={{
                      borderColor: revealed ? rarityColor : "rgba(255,255,255,0.1)",
                      ["--rarity-color" as string]: rarityColor,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    {revealed ? (
                      <div
                        className={cn(
                          "flex h-full w-full flex-col items-center justify-center bg-card/90",
                          isHighRarity && "animate-rarity-glow"
                        )}
                        style={{ boxShadow: `inset 0 0 20px ${rarityColor}` }}
                      >
                        <div
                          className="h-10 w-10 rounded-md bg-cover bg-center"
                          style={{
                            backgroundImage: card.art ? `url(${card.art})` : undefined,
                            backgroundColor: `${color}22`,
                          }}
                        >
                          {!card.art && (
                            <div className="flex h-full w-full items-center justify-center text-lg" style={{ color }}>
                              {glyph}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 px-1 text-center text-[8px] font-bold leading-tight" style={{ color }}>
                          {card.name}
                        </p>
                        <p className="text-[7px] uppercase tracking-wide" style={{ color: rarityColor }}>
                          {card.rarity}
                        </p>
                        {card.isNew && (
                          <span className="absolute -right-0.5 -top-0.5 rounded bg-emerald-400 px-1 text-[7px] font-black text-emerald-950">
                            NEW
                          </span>
                        )}
                        {isHighRarity && (
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,var(--rarity-color),transparent_58%)] opacity-35" />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card/50">
                        <span className="text-2xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {phase === "done" && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={reset} disabled={!canAfford || shardsLeft < PACK_COST} className={cn("px-6 py-2.5 text-sm font-bold", canAfford && shardsLeft >= PACK_COST ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300" : "bg-white/10 text-muted-foreground")}>
                  Open Another (100 ◈)
                </Button>
                <Button onClick={onClose} variant="outline" className="border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold">
                  Done
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PackRitualStage({
  children,
  label,
  tone,
}: {
  children: ReactNode;
  label: string;
  tone: string;
}) {
  return (
    <div className="relative flex min-h-[360px] flex-col items-center justify-center">
      {children}
      <p className={cn("mt-7 animate-pulse text-lg font-black uppercase tracking-[0.24em]", tone)}>
        {label}
      </p>
    </div>
  );
}

function PackVisual({ hot }: { hot?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-emerald-400/30 via-fuchsia-400/20 to-cyan-400/30",
        hot ? "border-fuchsia-300/60 shadow-[0_0_110px_rgba(217,70,239,0.75)]" : "border-emerald-400/40 shadow-[0_0_80px_rgba(52,211,153,0.5)]"
      )}
      style={{
        backgroundImage: "url(/hero-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-7xl drop-shadow-[0_0_18px_rgba(52,211,153,0.9)]">✦</span>
      </div>
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-emerald-200">Astral Signal</p>
      </div>
    </div>
  );
}
