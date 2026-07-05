"use client";

import { useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS, type Faction } from "@/lib/game-data";
import { CARD_DEFS } from "@/lib/match-engine";
import { useCardDetail, CardDetailDialog } from "@/components/cosmic/card-detail";
import { cn } from "@/lib/utils";

type Tab = "overview" | "history" | "leadership" | "development" | "philosophy" | "relations" | "cards";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "✦" },
  { id: "history", label: "History", icon: "📜" },
  { id: "leadership", label: "Leadership", icon: "♛" },
  { id: "development", label: "Development", icon: "↟" },
  { id: "philosophy", label: "Philosophy", icon: "🧠" },
  { id: "relations", label: "Relations", icon: "⚔" },
  { id: "cards", label: "Signature Cards", icon: "🃏" },
];

export default function FactionCodex() {
  const exitToLanding = useGame((s) => s.exitToLanding);
  const [activeFaction, setActiveFaction] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const { selected: detailCard, showCard: showCardDetail, close: closeDetail } = useCardDetail();

  const f = FACTIONS[activeFaction];

  return (
    <div className="min-h-screen pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-4xl px-3 sm:px-6">
        {/* top bar */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <button onClick={exitToLanding} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
            ← Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Faction Codex</p>
          <div className="w-[60px]" />
        </div>

        {/* faction selector strip */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scroll-cosmic">
          {FACTIONS.map((fac, i) => {
            const sel = i === activeFaction;
            return (
              <button
                key={fac.id}
                onClick={() => { setActiveFaction(i); setTab("overview"); }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                  sel ? "border-white/25 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                )}
                style={sel ? { boxShadow: `0 0 0 1px ${fac.accent}66` } : undefined}
              >
                <span className="text-lg" style={{ color: fac.accent }}>{fac.glyph}</span>
                <span className={cn("text-xs font-bold", sel && "")} style={{ color: sel ? fac.accent : undefined }}>
                  {fac.short}
                </span>
              </button>
            );
          })}
        </div>

        {/* faction header */}
        <div
          className="relative mb-4 overflow-hidden rounded-2xl border p-5"
          style={{ borderColor: `${f.accent}44`, background: `linear-gradient(135deg, ${f.accentSoft}, rgba(255,255,255,0.02) 70%)` }}
        >
          {f.art && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${f.art})` }} />
          )}
          <div className="relative flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl sm:h-20 sm:w-20 sm:text-5xl" style={{ background: `${f.accent}22`, color: f.accent, boxShadow: `0 0 30px ${f.glow}` }}>
              {f.glyph}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black sm:text-2xl" style={{ color: f.accent }}>{f.name}</h1>
              <p className="text-xs text-foreground/70 sm:text-sm">{f.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${f.accent}55`, color: f.accent, background: f.accentSoft }}>{f.playstyle}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-foreground/60">Difficulty: {"★".repeat(f.difficulty)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* tab bar */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1 scroll-cosmic">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition",
                tab === t.id ? "bg-white/10 text-foreground" : "text-foreground/50 hover:bg-white/5"
              )}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div className="min-h-[300px]">
          {tab === "overview" && <OverviewTab f={f} />}
          {tab === "history" && <HistoryTab f={f} />}
          {tab === "leadership" && <LeadershipTab f={f} />}
          {tab === "development" && <DevelopmentTab f={f} />}
          {tab === "philosophy" && <PhilosophyTab f={f} />}
          {tab === "relations" && <RelationsTab f={f} />}
          {tab === "cards" && <CardsTab f={f} onShowCard={showCardDetail} />}
        </div>
      </div>

      <CardDetailDialog card={detailCard} onClose={closeDetail} />
    </div>
  );
}

function OverviewTab({ f }: { f: Faction }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-foreground/85">{f.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <InfoCard label="Home World" value={f.homeWorld} />
        <InfoCard label="Founded" value={f.founded} />
        <InfoCard label="Population" value={f.population} />
        <InfoCard label="Tech Level" value={f.techLevel} />
        <InfoCard label="Government" value={f.government} />
        <InfoCard label="Resource" value={f.resonance} />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Signature Abilities</p>
        <div className="space-y-2">
          {f.abilities.map((a) => (
            <div key={a.name} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
              <p className="text-xs font-bold" style={{ color: f.accent }}>{a.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ f }: { f: Faction }) {
  return (
    <div className="space-y-3">
      {f.history.map((h, i) => (
        <div key={i} className="relative rounded-xl border border-white/10 bg-white/[0.02] p-4 pl-6">
          {/* timeline dot */}
          <span className="absolute left-2 top-4 h-2 w-2 rounded-full" style={{ background: f.accent, boxShadow: `0 0 8px ${f.glow}` }} />
          {i < f.history.length - 1 && <span className="absolute left-[11px] top-7 h-full w-px bg-white/10" />}
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: f.accent }}>{h.era}</p>
          <p className="mt-0.5 text-sm font-bold">{h.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{h.text}</p>
        </div>
      ))}
    </div>
  );
}

function LeadershipTab({ f }: { f: Faction }) {
  return (
    <div className="space-y-3">
      {f.leadership.map((leader, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${f.accent}22`, color: f.accent }}>
            ♛
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold" style={{ color: f.accent }}>{leader.name}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{leader.title} · {leader.era}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{leader.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DevelopmentTab({ f }: { f: Faction }) {
  return (
    <div className="space-y-2">
      {f.development.map((stage, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black" style={{ background: `${f.accent}22`, color: f.accent }}>
            {i + 1}
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: f.accent }}>{stage.stage}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{stage.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhilosophyTab({ f }: { f: Faction }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: `${f.accent}33`, background: `${f.accent}08` }}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: f.accent }}>Core Philosophy</p>
      <p className="text-sm italic leading-relaxed text-foreground/85">"{f.philosophy}"</p>
    </div>
  );
}

function RelationsTab({ f }: { f: Faction }) {
  return (
    <div className="space-y-2">
      {f.relations.map((r, i) => {
        const target = FACTIONS.find((x) => x.id === r.factionId);
        if (!target) return null;
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <span className="text-xl" style={{ color: target.accent }}>{target.glyph}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">{target.name}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: f.accent }}>{r.stance}</p>
            </div>
            <p className="max-w-[50%] text-[10px] leading-snug text-muted-foreground">{r.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function CardsTab({ f, onShowCard }: { f: Faction; onShowCard: (defId: string) => void }) {
  return (
    <div className="space-y-2">
      {f.signatureCards.map((sc, i) => {
        const card = CARD_DEFS.find((c) => c.defId === sc.defId);
        if (!card) return null;
        return (
          <button
            key={i}
            onClick={() => onShowCard(sc.defId)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.05]"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: card.art ? `url(${card.art})` : undefined, backgroundColor: `${f.accent}1a` }}>
              {!card.art && <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: f.accent }}>{f.glyph}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold" style={{ color: f.accent }}>{card.name}</p>
              <p className="text-[10px] text-muted-foreground">{card.rarity} · {card.type === "Entity" ? `⚔${card.attack} ♥${card.hp}` : "✺ Spell"}</p>
            </div>
            <p className="max-w-[40%] text-[10px] leading-snug text-muted-foreground">{sc.note}</p>
          </button>
        );
      })}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground/85">{value}</p>
    </div>
  );
}
