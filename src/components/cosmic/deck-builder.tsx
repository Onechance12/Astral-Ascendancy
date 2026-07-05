"use client";

import { useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { CARD_DEFS, PLAYABLE_CARD_DEFS } from "@/lib/match-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

const MIN_CARDS = 10;
const MAX_CARDS = 20;
const MAX_COPIES = 3;

export default function DeckBuilder() {
  const commander = useGame((s) => s.commander);
  const decks = useGame((s) => s.decks);
  const saveDeck = useGame((s) => s.saveDeck);
  const deleteDeck = useGame((s) => s.deleteDeck);
  const setActiveDeck = useGame((s) => s.setActiveDeck);
  const exitToHub = useGame((s) => s.exitToHub);
  const setView = useGame((s) => s.setView);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("My Deck");
  const [factionId, setFactionId] = useState(commander?.factionId || "solari");
  const [selected, setSelected] = useState<string[]>([]);

  if (!commander) return null;

  const availableCards = PLAYABLE_CARD_DEFS.filter((c) => c.faction === factionId || c.faction === "quantum");
  const countOf = (defId: string) => selected.filter((x) => x === defId).length;

  const add = (defId: string) => {
    if (selected.length >= MAX_CARDS) {
      toast.error(`Max ${MAX_CARDS} cards`);
      return;
    }
    if (countOf(defId) >= MAX_COPIES) {
      toast.error(`Max ${MAX_COPIES} copies of a card`);
      return;
    }
    setSelected([...selected, defId]);
  };
  const remove = (defId: string) => {
    const idx = selected.lastIndexOf(defId);
    if (idx >= 0) setSelected(selected.filter((_, i) => i !== idx));
  };

  const save = async () => {
    if (selected.length < MIN_CARDS) {
      toast.error(`Need at least ${MIN_CARDS} cards`);
      return;
    }
    const ok = await saveDeck(name, factionId, selected, editingId || undefined);
    if (ok) {
      toast.success(editingId ? "Deck updated" : "Deck saved");
      setView("hub");
    } else {
      toast.error("Could not save deck");
    }
  };

  const loadDeck = (id: string) => {
    const d = decks.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    setName(d.name);
    setFactionId(d.factionId);
    setSelected(d.cardDefIds);
  };

  const newDeck = () => {
    setEditingId(null);
    setName("New Deck");
    setFactionId(commander.factionId);
    setSelected([]);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={exitToHub}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Deck Builder
        </p>
        <div className="w-[60px]" />
      </div>

      {/* saved decks strip */}
      {decks.length > 0 && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scroll-cosmic">
          <button
            onClick={newDeck}
            className="shrink-0 rounded-lg border border-dashed border-emerald-400/40 bg-emerald-400/5 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-400/10"
          >
            + New
          </button>
          {decks.map((d) => (
            <button
              key={d.id}
              onClick={() => loadDeck(d.id)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition",
                editingId === d.id
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-foreground/70 hover:bg-white/10"
              )}
            >
              {d.name} ({d.cardDefIds.length})
            </button>
          ))}
        </div>
      )}

      {/* deck meta + count */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 w-40 bg-background/60 text-sm"
          placeholder="Deck name"
        />
        <select
          value={factionId}
          onChange={(e) => {
            setFactionId(e.target.value);
            setSelected([]);
          }}
          className="h-9 rounded-lg border border-white/10 bg-background/60 px-2 text-sm"
        >
          {FACTIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.glyph} {f.short}
            </option>
          ))}
        </select>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
            selected.length >= MIN_CARDS && selected.length <= MAX_CARDS
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-amber-400/15 text-amber-300"
          )}
        >
          {selected.length}/{MAX_CARDS} cards (min {MIN_CARDS})
        </span>
        <div className="ml-auto flex gap-1.5">
          {editingId && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-300 hover:bg-rose-500/10"
              onClick={async () => {
                await deleteDeck(editingId);
                newDeck();
                toast.success("Deck deleted");
              }}
            >
              Delete
            </Button>
          )}
          <Button
            size="sm"
            onClick={save}
            disabled={selected.length < MIN_CARDS}
            className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 disabled:opacity-40"
          >
            {editingId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* current deck (selected cards list) */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          In Deck
        </p>
        {selected.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Tap cards below to add them (max {MAX_COPIES} copies each)
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((defId, i) => {
              const c = CARD_DEFS.find((x) => x.defId === defId)!;
              const color = FACTION_COLOR[c.faction];
              return (
                <button
                  key={`${defId}-${i}`}
                  onClick={() => remove(defId)}
                  className="group flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] hover:border-rose-400/40 hover:bg-rose-500/10"
                  title={`Remove ${c.name}`}
                >
                  <span className="font-bold text-black" style={{ background: color, padding: "0 4px", borderRadius: 3 }}>
                    {c.cost}
                  </span>
                  <span style={{ color }}>{c.name}</span>
                  {c.type === "Entity" && (
                    <span className="text-muted-foreground">{c.attack}/{c.hp}</span>
                  )}
                  <span className="text-rose-300 opacity-0 group-hover:opacity-100">✕</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* available card pool */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Available — {FACTIONS.find((f) => f.id === factionId)?.short} + Quantum
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {availableCards.map((c) => {
            const count = countOf(c.defId);
            const maxed = count >= MAX_COPIES;
            const color = FACTION_COLOR[c.faction];
            const glyph = FACTION_GLYPH[c.faction];
            return (
              <button
                key={c.defId}
                onClick={() => add(c.defId)}
                disabled={maxed || selected.length >= MAX_CARDS}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-lg border bg-card/60 text-left transition",
                  maxed ? "border-white/5 opacity-40" : "border-white/10 hover:border-white/25 hover:bg-card/80"
                )}
              >
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center"
                  style={{
                    backgroundImage: c.art ? `url(${c.art})` : undefined,
                    backgroundColor: `${color}1a`,
                  }}
                >
                  {!c.art && (
                    <div className="flex h-full w-full items-center justify-center text-xl" style={{ color }}>
                      {glyph}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold text-black"
                    style={{ background: color }}
                  >
                    {c.cost}
                  </span>
                  <span className="min-w-0 truncate text-[8px] font-bold" style={{ color }}>
                    {c.name}
                  </span>
                </div>
                {c.type === "Entity" ? (
                  <div className="flex items-center justify-between px-1.5 pb-1 text-[8px] font-bold tabular-nums">
                    <span style={{ color }}>⚔{c.attack}</span>
                    <span className="text-rose-300">♥{c.hp}</span>
                  </div>
                ) : (
                  <div className="px-1.5 pb-1 text-right text-[8px] font-bold text-violet-300">✺ Spell</div>
                )}
                {c.evolvesTo && (
                  <span className="absolute right-0.5 top-0.5 rounded bg-amber-400/90 px-1 text-[7px] font-bold text-amber-950">
                    ↟
                  </span>
                )}
                {count > 0 && (
                  <span className="absolute left-0.5 top-0.5 rounded bg-emerald-400 px-1 text-[8px] font-bold text-emerald-950">
                    ×{count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
