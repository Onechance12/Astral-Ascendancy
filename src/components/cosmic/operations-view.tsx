"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);

type Operation = {
  id: string;
  type: string;
  name: string;
  lore: string;
  target: number;
  factionId: string | null;
  rewardShards: number;
  rewardCommanderTitle: string | null;
  endsAt: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardCards: { defId: string; name: string; rarity: string; faction: string; art?: string }[];
};

export default function OperationsView() {
  const commander = useGame((s) => s.commander);
  const exitToHub = useGame((s) => s.exitToHub);
  const lastMatches = useGame((s) => s.stats.matches);
  const [ops, setOps] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/operations")
      .then((r) => (r.ok ? r.json() : { operations: [] }))
      .then((d) => setOps(d.operations || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [lastMatches]);

  if (!commander) return null;

  const claim = async (id: string) => {
    const res = await fetch(`/api/operations/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "claim" }),
    });
    if (res.ok) {
      toast.success("Operation rewards claimed!");
      load();
    } else {
      toast.error("Cannot claim yet");
    }
  };

  const timeLeft = (iso: string) => {
    const ms = new Date(iso).getTime() - Date.now();
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={exitToHub} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Operations</p>
        <div className="w-[60px]" />
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        Limited-time narrative events across the Cluster. Complete the objective to rescue or capture unique cards.
      </p>

      {loading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Loading…</p>
      ) : ops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-muted-foreground">
          No active operations. Check back soon — new events rotate regularly.
        </div>
      ) : (
        <div className="space-y-3">
          {ops.map((op) => {
            const pct = Math.min(100, (op.progress / op.target) * 100);
            const isRescue = op.type === "rescue";
            const accent = isRescue ? "#34d399" : "#fb7185";
            return (
              <div key={op.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]" style={{ boxShadow: `inset 0 0 30px ${accent}08` }}>
                {/* header */}
                <div className="flex items-center gap-3 p-4" style={{ background: `linear-gradient(90deg, ${accent}14, transparent)` }}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${accent}22`, color: accent }}>
                    {isRescue ? "✦" : "☣"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                      {isRescue ? "Rescue Operation" : "Bounty Contract"} · {timeLeft(op.endsAt)} left
                    </p>
                    <p className="truncate text-sm font-bold">{op.name}</p>
                  </div>
                  {op.claimed && <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-muted-foreground">Claimed</span>}
                </div>

                {/* body */}
                <div className="p-4">
                  <p className="text-xs italic leading-relaxed text-foreground/70">{op.lore}</p>

                  {/* progress */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold tabular-nums" style={{ color: accent }}>{op.progress}/{op.target}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/40">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
                    </div>
                  </div>

                  {/* rewards */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rewards:</span>
                    {op.rewardCards.map((rc) => (
                      <span key={rc.defId} className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px]" style={{ color: FACTION_COLOR[rc.faction] || "#fff" }}>
                        <span className="font-bold">{rc.name}</span>
                        <span className="text-muted-foreground">{rc.rarity}</span>
                      </span>
                    ))}
                    <span className="flex items-center gap-0.5 text-[10px] text-cyan-300">◈ {op.rewardShards}</span>
                    {op.rewardCommanderTitle && (
                      <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                        Title: {op.rewardCommanderTitle}
                      </span>
                    )}
                  </div>

                  {/* claim button */}
                  {op.completed && !op.claimed && (
                    <Button onClick={() => claim(op.id)} className="mt-3 bg-emerald-400 text-xs font-bold text-emerald-950 hover:bg-emerald-300" size="sm">
                      Claim Rewards
                    </Button>
                  )}
                  {!op.completed && op.progress > 0 && (
                    <p className="mt-2 text-[10px] text-muted-foreground">Win {op.target - op.progress} more match(es) to complete</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
