"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

type Chapter = {
  id: string;
  factionId: string;
  chapter: number;
  title: string;
  intro: string;
  outro: string;
  enemyName: string;
  enemyFactionId: string;
  enemyDeckIds: string[];
  enemyHp: number;
  rewardCards: { defId: string; name: string; rarity: string; faction: string; art?: string }[];
  rewardShards: number;
  completed: boolean;
};

export default function CampaignView() {
  const commander = useGame((s) => s.commander);
  const exitToHub = useGame((s) => s.exitToHub);
  const startCampaignChapter = useGame((s) => s.startCampaignChapter);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = () => {
    fetch("/api/campaign")
      .then((r) => (r.ok ? r.json() : { chapters: [] }))
      .then((d) => setChapters(d.chapters || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  if (!commander) return null;

  // group by faction
  const byFaction = new Map<string, Chapter[]>();
  for (const ch of chapters) {
    if (!byFaction.has(ch.factionId)) byFaction.set(ch.factionId, []);
    byFaction.get(ch.factionId)!.push(ch);
  }

  const selectedChapter = chapters.find((c) => c.id === selected);

  const start = (ch: Chapter) => {
    // chapters are sequential — must complete previous
    const factionChapters = byFaction.get(ch.factionId) || [];
    const idx = factionChapters.findIndex((c) => c.id === ch.id);
    if (idx > 0 && !factionChapters[idx - 1].completed) {
      return; // locked
    }
    startCampaignChapter({
      id: ch.id,
      enemyName: ch.enemyName,
      enemyFactionId: ch.enemyFactionId,
      enemyDeckIds: ch.enemyDeckIds,
      enemyHp: ch.enemyHp,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={exitToHub} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Cluster Campaigns</p>
        <div className="w-[60px]" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Loading…</p>
      ) : chapters.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No campaigns available</p>
      ) : (
        <div className="space-y-5">
          {[...byFaction.entries()].map(([factionId, chs]) => {
            const f = FACTIONS.find((x) => x.id === factionId)!;
            const color = FACTION_COLOR[factionId];
            const completedCount = chs.filter((c) => c.completed).length;
            return (
              <div key={factionId} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {/* faction header */}
                <div className="flex items-center gap-3 p-4" style={{ background: `linear-gradient(90deg, ${f.accentSoft}, transparent)` }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${color}22`, color }}>
                    {FACTION_GLYPH[factionId]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color }}>{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{completedCount}/{chs.length} chapters complete</p>
                  </div>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/40">
                    <div className="h-full rounded-full" style={{ width: `${(completedCount / chs.length) * 100}%`, background: color }} />
                  </div>
                </div>
                {/* chapters */}
                <div className="divide-y divide-white/5">
                  {chs.map((ch, i) => {
                    const prevDone = i === 0 || chs[i - 1].completed;
                    const locked = !prevDone && !ch.completed;
                    const isSel = selected === ch.id;
                    return (
                      <div key={ch.id} className={cn("p-3 transition", locked ? "opacity-50" : "hover:bg-white/[0.02]", isSel && "bg-white/[0.03]")}>
                        <button
                          onClick={() => !locked && setSelected(isSel ? null : ch.id)}
                          className="flex w-full items-center gap-3 text-left"
                          disabled={locked}
                        >
                          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", ch.completed ? "bg-emerald-400 text-emerald-950" : locked ? "bg-white/5 text-muted-foreground" : "border border-white/20 text-foreground/70")}>
                            {ch.completed ? "✓" : locked ? "🔒" : ch.chapter}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{ch.title}</p>
                            <p className="truncate text-[11px] text-muted-foreground">vs {ch.enemyName} · {ch.enemyHp} HP</p>
                          </div>
                          {!ch.completed && !locked && (
                            <span className="shrink-0 rounded-md bg-emerald-400/20 px-2 py-1 text-[10px] font-bold text-emerald-300">▶ Play</span>
                          )}
                        </button>
                        {/* expanded view */}
                        {isSel && (
                          <div className="mt-3 pl-11">
                            <p className="text-xs italic leading-relaxed text-foreground/70">{ch.intro}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rewards:</span>
                              {ch.rewardCards.map((rc) => (
                                <span key={rc.defId} className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px]" style={{ color: FACTION_COLOR[rc.faction] }}>
                                  <span className="font-bold">{rc.name}</span>
                                  <span className="text-muted-foreground">{rc.rarity}</span>
                                </span>
                              ))}
                              <span className="flex items-center gap-0.5 text-[10px] text-cyan-300">◈ {ch.rewardShards}</span>
                            </div>
                            <Button
                              onClick={() => start(ch)}
                              className="mt-3 bg-emerald-400 text-xs font-bold text-emerald-950 hover:bg-emerald-300"
                              size="sm"
                            >
                              ▶ Start Chapter
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
