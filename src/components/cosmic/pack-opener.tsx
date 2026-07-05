"use client";

import { useState } from "react";
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
  const [phase, setPhase] = useState<"idle" | "shaking" | "revealing" | "done">("idle");
  const [cards, setCards] = useState<RevealedCard[]>([]);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [shardsLeft, setShardsLeft] = useState(commander?.shards || 0);

  const PACK_COST = 100;

  const openPack = async () => {
    if (!commander || commander.shards < PACK_COST) {
      toast.error("Need 100 shards");
      return;
    }
    setPhase("shaking");
    // wait for shake animation
    await new Promise((r) => setTimeout(r, 1500));
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
      await new Promise((r) => setTimeout(r, 500));
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg">
        {/* IDLE: pack preview + open button */}
        {phase === "idle" && (
          <div className="text-center">
            <button onClick={onClose} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg text-foreground/60 hover:bg-white/10">
              ✕
            </button>
            <h2 className="mb-1 text-2xl font-black">Signal Pack</h2>
            <p className="mb-6 text-sm text-muted-foreground">5 cards · 1 guaranteed Uncommon+</p>
            {/* pack visual */}
            <div className="relative mx-auto mb-6 h-56 w-40">
              <div
                className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 via-fuchsia-400/10 to-cyan-400/20 shadow-[0_0_60px_rgba(52,211,153,0.3)]"
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

        {/* SHAKING: pack shakes then bursts */}
        {phase === "shaking" && (
          <div className="flex flex-col items-center">
            <div className="animate-pack-shake relative mx-auto h-56 w-40">
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-400/30 via-fuchsia-400/20 to-cyan-400/30 shadow-[0_0_80px_rgba(52,211,153,0.5)]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">✦</span>
                </div>
              </div>
            </div>
            <p className="mt-6 animate-pulse text-lg font-bold text-emerald-300">Opening…</p>
          </div>
        )}

        {/* REVEALING / DONE: cards flip in one by one */}
        {(phase === "revealing" || phase === "done") && (
          <div>
            <h2 className="mb-4 text-center text-xl font-black text-emerald-300">Pack Opened!</h2>
            <div className="grid grid-cols-5 gap-2">
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
                      "relative aspect-[3/4] overflow-hidden rounded-lg border-2",
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
