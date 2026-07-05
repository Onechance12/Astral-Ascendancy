"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS } from "@/lib/world-cards";
import { SHARD_COST, SHARD_DUST, type Rarity } from "@/lib/progression";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCardDetail, CardDetailDialog } from "@/components/cosmic/card-detail";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

const RARITY_COLOR: Record<string, string> = {
  Common: "#94a3b8",
  Uncommon: "#34d399",
  Rare: "#22d3ee",
  Holo: "#a78bfa",
  Mythic: "#fb923c",
  Singularity: "#e879f9",
};

type OwnedCard = {
  defId: string;
  count: number;
  name: string;
  faction: string;
  type: string;
  category: string;
  cost: number;
  attack: number;
  hp: number;
  rarity: string;
  art?: string;
  evolvesTo: boolean;
  description?: string;
};

export default function CollectionView() {
  const commander = useGame((s) => s.commander);
  const exitToHub = useGame((s) => s.exitToHub);
  const lastMatches = useGame((s) => s.stats.matches);
  const [cards, setCards] = useState<OwnedCard[]>([]);
  const [shards, setShards] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [uniqueCards, setUniqueCards] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false); // toggle owned vs full catalog
  const { selected: detailCard, showCard: showCardDetail, close: closeDetail } = useCardDetail();
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/collection")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setCards(d.cards);
        setShards(d.shards);
        setTotalCards(d.totalCards);
        setUniqueCards(d.uniqueCards);
        setCatalogTotal(d.catalogTotal);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [lastMatches]);

  if (!commander) return null;

  const ownedMap = new Map(cards.map((c) => [c.defId, c]));
  const displayCards = showAll
    ? [
        ...CARD_DEFS.map((d) => ({
          defId: d.defId,
          count: ownedMap.get(d.defId)?.count || 0,
          name: d.name,
          faction: d.faction,
          type: d.type,
          category: d.type === "Anomaly" ? "anomaly" : "entity",
          cost: d.cost,
          attack: d.attack,
          hp: d.hp,
          rarity: d.rarity,
          art: d.art,
          evolvesTo: !!d.evolvesTo,
          description: d.text,
        })),
        ...ALL_WORLD_CARDS.map((d: any) => ({
          defId: d.defId,
          count: ownedMap.get(d.defId)?.count || 0,
          name: d.name,
          faction: "world",
          type: "World",
          category: d.category,
          cost: 0,
          attack: 0,
          hp: 0,
          rarity: d.rarity,
          art: d.art,
          evolvesTo: false,
          description: d.description,
        })),
      ]
    : cards;

  // filter: "all" shows everything; faction filters show that faction + world cards always
  const filtered = filter === "all"
    ? displayCards
    : displayCards.filter((c) => c.faction === filter || c.faction === "world");

  const craft = async (defId: string) => {
    const res = await fetch("/api/craft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "craft", defId }),
    });
    if (res.ok) {
      toast.success("Card crafted");
      load();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Not enough shards");
    }
  };
  const dismantle = async (defId: string, count: number) => {
    const res = await fetch("/api/craft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismantle", defId, count }),
    });
    if (res.ok) {
      const d = await res.json();
      toast.success(`Dismantled for ${d.dusted} shards`);
      load();
    } else {
      toast.error("Could not dismantle");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={exitToHub} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Collection</p>
        <div className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-xs">
          <span className="text-cyan-300">◈</span>
          <span className="font-bold tabular-nums">{shards}</span>
        </div>
      </div>

      {/* stats */}
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center">
          <p className="text-xl font-black text-emerald-300">{uniqueCards}</p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Unique</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center">
          <p className="text-xl font-black text-cyan-300">{totalCards}</p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Total Cards</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center">
          <p className="text-xl font-black text-amber-300">{Math.round((uniqueCards / catalogTotal) * 100)}%</p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Catalog</p>
        </div>
      </div>

      {/* owned/all toggle + faction filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5 text-xs">
          <button onClick={() => setShowAll(false)} className={cn("rounded-md px-3 py-1 font-bold", !showAll ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>Owned ({uniqueCards})</button>
          <button onClick={() => setShowAll(true)} className={cn("rounded-md px-3 py-1 font-bold", showAll ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>All ({catalogTotal})</button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-cosmic">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {FACTIONS.map((f) => (
            <FilterChip key={f.id} label={`${f.glyph} ${f.short}`} active={filter === f.id} onClick={() => setFilter(f.id)} />
          ))}
        </div>
      </div>

      {/* card grid */}
      {loading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-muted-foreground">
          No cards here yet. Win matches to earn drops, or complete campaigns & quests!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {filtered.map((c) => {
            const color = FACTION_COLOR[c.faction] || "#94a3b8";
            const glyph = FACTION_GLYPH[c.faction] || "?";
            const rarityColor = RARITY_COLOR[c.rarity] || "#94a3b8";
            const owned = c.count > 0;
            const canCraft = !owned || showAll;
            const craftCost = SHARD_COST[c.rarity as Rarity];
            const dustValue = SHARD_DUST[c.rarity as Rarity];
            return (
              <div
                key={c.defId}
                onClick={() => showCardDetail(c.defId)}
                className={cn(
                  "relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border bg-card/60 transition hover:scale-[1.03] hover:border-white/30",
                  owned ? "border-white/15" : "border-white/5 opacity-70"
                )}
                style={{ boxShadow: owned ? `inset 0 0 16px ${rarityColor}15` : undefined }}
              >
                <div className="aspect-[4/3] w-full bg-cover bg-center" style={{ backgroundImage: c.art ? `url(${c.art})` : undefined, backgroundColor: `${color}1a` }}>
                  {!c.art && <div className="flex h-full w-full items-center justify-center text-xl" style={{ color }}>{glyph}</div>}
                  {!owned && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl">🔒</div>}
                </div>
                <div className="flex items-center justify-between gap-1 px-1 py-0.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-black" style={{ background: color }}>{c.cost}</span>
                  <span className="min-w-0 truncate text-[8px] font-bold" style={{ color }}>{c.name}</span>
                </div>
                {c.type === "Entity" ? (
                  <div className="flex items-center justify-between px-1 pb-1 text-[8px] font-bold tabular-nums">
                    <span style={{ color }}>⚔{c.attack}</span>
                    <span className="text-rose-300">♥{c.hp}</span>
                  </div>
                ) : c.category === "anomaly" ? (
                  <div className="px-1 pb-1 text-right text-[8px] font-bold text-violet-300">✺ Spell</div>
                ) : (
                  <div className="px-1 pb-1 text-right text-[8px] font-bold text-amber-300">
                    {c.category === "planet" ? "🪐 Planet" : c.category === "development" ? "⚡ Tech" : "👥 Crew"}
                  </div>
                )}
                {/* rarity bar */}
                <div className="h-0.5 w-full" style={{ background: rarityColor }} />
                {/* count + actions */}
                <div className="flex items-center justify-between px-1 py-1">
                  {owned ? (
                    <>
                      <span className="rounded bg-emerald-400/20 px-1 text-[9px] font-bold text-emerald-300">×{c.count}</span>
                      {c.count > 1 && (
                        <button onClick={() => dismantle(c.defId, 1)} className="text-[9px] text-rose-300/70 hover:text-rose-300" title={`Dismantle 1 for ${dustValue} shards`}>
                          ✕{dustValue}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => craft(c.defId)}
                      disabled={shards < craftCost}
                      className={cn("w-full rounded px-1 py-0.5 text-[9px] font-bold", shards >= craftCost ? "bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30" : "bg-white/5 text-muted-foreground")}
                    >
                      ◈{craftCost}
                    </button>
                  )}
                </div>
                {c.evolvesTo && <span className="absolute right-0.5 top-0.5 rounded bg-amber-400/90 px-1 text-[7px] font-bold text-amber-950">↟</span>}
              </div>
            );
          })}
        </div>
      )}

      <CardDetailDialog card={detailCard} onClose={closeDetail} />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
        active ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}
