"use client";

import { useState, useEffect } from "react";
import { CARD_DEFS, type MatchCard } from "@/lib/match-engine";
import { ALL_WORLD_CARDS, getCardCategory } from "@/lib/world-cards";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FACTIONS, LANDING_FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  [...LANDING_FACTIONS, ...FACTIONS].map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  [...LANDING_FACTIONS, ...FACTIONS].map((f) => [f.id, f.glyph])
);
const FACTION_NAME: Record<string, string> = Object.fromEntries(
  [...LANDING_FACTIONS, ...FACTIONS].map((f) => [f.id, f.name])
);

const RARITY_COLOR: Record<string, string> = {
  Common: "#94a3b8",
  Uncommon: "#34d399",
  Rare: "#22d3ee",
  Holo: "#a78bfa",
  Mythic: "#fb923c",
  Singularity: "#e879f9",
};

const ATTACK_TYPE_COLOR: Record<string, string> = {
  Energy: "#fbbf24",
  Physical: "#94a3b8",
  Psychic: "#a78bfa",
  Biological: "#34d399",
  Quantum: "#22d3ee",
  Radiant: "#fbbf24",
  Void: "#e879f9",
  Tech: "#22d3ee",
  Bio: "#34d399",
  Ember: "#fb7185",
  Kinetic: "#fb923c",
  Astral: "#93c5fd",
};

const ATTACK_TYPE_ICON: Record<string, string> = {
  Energy: "⚡",
  Physical: "⚔",
  Psychic: "🧠",
  Biological: "☣",
  Quantum: "⬡",
  Radiant: "☼",
  Void: "☣",
  Tech: "▦",
  Bio: "✦",
  Ember: "✺",
  Kinetic: "⚔",
  Astral: "◌",
};

const KEYWORD_DESC: Record<string, string> = {
  Guardian: "Must be attacked first in its lane. Protects the Commander.",
  StrikeFirst: "Can attack the turn it's deployed. No summoning sickness.",
  Trample: "Excess damage from killing a unit hits the enemy Commander.",
  Overwhelm: "Excess damage carries to the next enemy unit in the lane.",
  Shield: "Absorbs the first N damage each turn. Resets at the start of your turn.",
  Lifedrain: "Heals your Commander for the damage dealt to enemy HP.",
  Pierce: "Ignores Guardian — can target the Commander directly.",
  Flying: "Can only be blocked by other Flying units. Bypasses ground defenders.",
};

const PLANET_TYPE_NAME: Record<string, string> = {
  star: "Star Orbit",
  organic: "Organic World",
  mineral: "Mineral World",
  gas: "Gas Giant",
  anomaly: "Anomaly World",
  barren: "Barren Rock",
};

export type CardDetailData = {
  defId: string;
  name: string;
  faction: string;
  type: string;
  category: string;
  cost: number;
  attack: number;
  hp: number;
  rarity: string;
  art?: string;
  text: string;
  lore?: string;
  attackType?: string;
  environmentBonus?: { planetType: string; attackBonus: number; hpBonus: number };
  keyword?: string;
  shieldValue?: number;
  evolvesTo?: { name: string; attackBonus: number; hpBonus: number; keyword?: string };
  flavor?: string;
  description?: string;
};

export function useCardDetail() {
  const [selected, setSelected] = useState<CardDetailData | null>(null);

  const showCard = (defId: string) => {
    // find in battle cards or world cards
    const battleDef = CARD_DEFS.find((c) => c.defId === defId);
    const worldDef = ALL_WORLD_CARDS.find((c) => c.defId === defId);

    if (battleDef) {
      setSelected({
        defId: battleDef.defId,
        name: battleDef.name,
        faction: battleDef.faction,
        type: battleDef.type,
        category: battleDef.type.toLowerCase(),
        cost: battleDef.cost,
        attack: battleDef.attack,
        hp: battleDef.hp,
        rarity: battleDef.rarity,
        art: battleDef.art,
        text: battleDef.text,
        lore: battleDef.lore,
        attackType: battleDef.attackType,
        environmentBonus: battleDef.environmentBonus as any,
        keyword: battleDef.keyword,
        shieldValue: battleDef.shieldValue,
        evolvesTo: battleDef.evolvesTo as any,
      });
    } else if (worldDef) {
      setSelected({
        defId: worldDef.defId,
        name: worldDef.name,
        faction: "world",
        type: "World",
        category: worldDef.category,
        cost: 0,
        attack: 0,
        hp: 0,
        rarity: worldDef.rarity,
        text: "description" in worldDef ? worldDef.description : "",
        lore: "flavor" in worldDef ? worldDef.flavor : "",
        flavor: "flavor" in worldDef ? worldDef.flavor : "",
        description: "description" in worldDef ? worldDef.description : "",
      });
    }
  };

  const close = () => setSelected(null);

  return { selected, showCard, close };
}

export function CardDetailDialog({
  card,
  onClose,
}: {
  card: CardDetailData | null;
  onClose: () => void;
}) {
  if (!card) return null;

  const isWorldCard = ["planet", "development", "crew", "world", "structure", "attachment", "science", "project", "skill", "relic", "evolution"].includes(card.category);
  const color = isWorldCard
    ? card.category === "planet"
      ? "#fbbf24"
      : card.category === "development"
      ? "#22d3ee"
      : card.category === "world"
      ? FACTION_COLOR[card.faction] || "#22d3ee"
      : card.category === "structure"
      ? "#a78bfa"
      : card.category === "attachment"
      ? "#fb923c"
      : card.category === "science"
      ? "#38bdf8"
      : card.category === "project"
      ? "#34d399"
      : card.category === "skill"
      ? "#facc15"
      : card.category === "relic"
      ? "#c084fc"
      : card.category === "evolution"
      ? "#4ade80"
      : "#34d399"
    : FACTION_COLOR[card.faction] || "#94a3b8";
  const glyph = isWorldCard
    ? card.category === "planet"
      ? "🪐"
      : card.category === "development"
      ? "⚡"
      : card.category === "world"
      ? "⬢"
      : card.category === "structure"
      ? "▣"
      : card.category === "attachment"
      ? "⚙"
      : card.category === "science"
      ? "⌬"
      : card.category === "project"
      ? "▤"
      : card.category === "skill"
      ? "✦"
      : card.category === "relic"
      ? "◆"
      : card.category === "evolution"
      ? "↟"
      : "👥"
    : FACTION_GLYPH[card.faction] || "?";
  const rarityColor = RARITY_COLOR[card.rarity] || "#94a3b8";

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl p-0 overflow-hidden sm:max-w-md">
        <div className="pointer-events-none absolute inset-0 -z-10 nebula-radial opacity-30" />

        {/* art header */}
        <div className="relative h-40 w-full overflow-hidden" style={{ background: `${color}15` }}>
          {card.art ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${card.art})` }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl" style={{ color }}>
              {glyph}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          {/* rarity bar */}
          <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: rarityColor }} />
          {/* category badge */}
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
            {isWorldCard ? card.category : card.type}
          </span>
          {/* cost orb */}
          {!["planet", "development", "crew"].includes(card.category) && (
            <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold text-black" style={{ background: color }}>
              {card.cost}
            </span>
          )}
        </div>

        {/* content */}
        <div className="space-y-3 p-4">
          {/* name + faction */}
          <div>
            <h2 className="text-lg font-black" style={{ color }}>{card.name}</h2>
            {!isWorldCard && (
              <p className="text-xs text-muted-foreground">
                {FACTION_NAME[card.faction] || card.faction} · {card.rarity}
              </p>
            )}
            {isWorldCard && (
              <p className="text-xs capitalize text-muted-foreground">{card.category} · {card.rarity}</p>
            )}
          </div>

          {/* stats row */}
          {!isWorldCard && card.type === "Entity" && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Attack</p>
                <p className="text-2xl font-black" style={{ color }}>⚔ {card.attack}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase text-muted-foreground">HP</p>
                <p className="text-2xl font-black text-rose-300">♥ {card.hp}</p>
              </div>
              {card.attackType && (
                <div className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Type</p>
                  <p className="text-lg font-bold" style={{ color: ATTACK_TYPE_COLOR[card.attackType] }}>
                    {ATTACK_TYPE_ICON[card.attackType]} {card.attackType}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* card text */}
          <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
            <p className="text-xs leading-snug text-foreground/85">{card.text || card.description}</p>
          </div>

          {/* keywords */}
          {card.keyword && (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: `${color}55`, color, background: `${color}11` }}>
                {card.keyword}
                {card.shieldValue ? ` ${card.shieldValue}` : ""}
              </span>
            </div>
          )}
          {card.keyword && (
            <p className="text-[10px] italic text-muted-foreground">{KEYWORD_DESC[card.keyword]}</p>
          )}

          {/* environment bonus */}
          {card.environmentBonus && (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-300">🌍 Environment Bonus</p>
              <p className="text-[11px] text-amber-200/80">
                On {PLANET_TYPE_NAME[card.environmentBonus.planetType]}:
                {card.environmentBonus.attackBonus > 0 && ` +${card.environmentBonus.attackBonus} ATK`}
                {card.environmentBonus.hpBonus > 0 && ` +${card.environmentBonus.hpBonus} HP`}
              </p>
            </div>
          )}

          {/* evolution */}
          {card.evolvesTo && (
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">↟ Stellar Evolution</p>
              <p className="text-[11px] text-emerald-200/80">
                Survive a turn → evolves into <span className="font-bold">{card.evolvesTo.name}</span>
                {card.evolvesTo.attackBonus > 0 && ` (+${card.evolvesTo.attackBonus} ATK)`}
                {card.evolvesTo.hpBonus > 0 && ` (+${card.evolvesTo.hpBonus} HP)`}
                {card.evolvesTo.keyword && ` · gains ${card.evolvesTo.keyword}`}
              </p>
            </div>
          )}

          {/* lore */}
          {card.lore && (
            <div className="border-t border-white/10 pt-2">
              <p className="text-[11px] italic leading-relaxed text-muted-foreground">"{card.lore}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
