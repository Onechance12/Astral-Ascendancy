"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { CARD_DEFS } from "@/lib/match-engine";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);

type QuestRow = {
  id: string;
  kind: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardShards: number;
  rewardCardDefId: string | null;
  expiresAt: string | null;
};

export default function QuestsPanel() {
  const [quests, setQuests] = useState<QuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const lastMatches = useGame((s) => s.stats.matches);

  const load = () => {
    fetch("/api/quests")
      .then((r) => (r.ok ? r.json() : { quests: [] }))
      .then((d) => setQuests(d.quests || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [lastMatches]);

  const claim = async (id: string) => {
    const res = await fetch(`/api/quests/${id}/claim`, { method: "POST" });
    if (res.ok) {
      toast.success("Quest reward claimed!");
      load();
    } else {
      toast.error("Could not claim");
    }
  };

  const dailies = quests.filter((q) => q.kind === "daily");
  const weeklies = quests.filter((q) => q.kind === "weekly");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold sm:text-base">Transmissions</h2>
        <span className="text-[10px] text-muted-foreground">Quests & contracts</span>
      </div>
      {loading ? (
        <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
      ) : quests.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">No active quests</p>
      ) : (
        <div className="space-y-2">
          {dailies.length > 0 && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/70">Daily</p>
          )}
          {dailies.map((q) => (
            <QuestItem key={q.id} q={q} onClaim={claim} />
          ))}
          {weeklies.length > 0 && (
            <p className="pt-2 text-[10px] font-bold uppercase tracking-widest text-violet-300/70">Weekly</p>
          )}
          {weeklies.map((q) => (
            <QuestItem key={q.id} q={q} onClaim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestItem({ q, onClaim }: { q: QuestRow; onClaim: (id: string) => void }) {
  const pct = Math.min(100, (q.progress / q.target) * 100);
  const rewardCard = q.rewardCardDefId
    ? CARD_DEFS.find((c) => c.defId === q.rewardCardDefId)
    : null;
  const rewardColor = rewardCard ? FACTION_COLOR[rewardCard.faction] : "#fbbf24";

  return (
    <div
      className={cn(
        "rounded-lg border bg-white/[0.02] p-2.5",
        q.claimed ? "border-white/5 opacity-50" : q.completed ? "border-emerald-400/30" : "border-white/10"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold">{q.title}</p>
        {q.claimed ? (
          <span className="text-[10px] text-muted-foreground">Claimed</span>
        ) : q.completed ? (
          <Button
            size="sm"
            onClick={() => onClaim(q.id)}
            className="h-6 bg-emerald-400 px-2 text-[10px] font-bold text-emerald-950 hover:bg-emerald-300"
          >
            Claim
          </Button>
        ) : (
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {q.progress}/{q.target}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{q.description}</p>
      {/* progress bar */}
      {!q.claimed && !q.completed && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/40">
          <div className="h-full bg-emerald-400/60" style={{ width: `${pct}%` }} />
        </div>
      )}
      {/* rewards */}
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
        {q.rewardShards > 0 && (
          <span className="flex items-center gap-0.5">
            <span className="text-cyan-300">◈</span> {q.rewardShards}
          </span>
        )}
        {rewardCard && (
          <span className="flex items-center gap-0.5" style={{ color: rewardColor }}>
            <span>🂠</span> {rewardCard.name}
          </span>
        )}
      </div>
    </div>
  );
}
