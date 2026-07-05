"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

type MatchRow = {
  id: string;
  commanderName: string;
  factionId: string;
  enemyName: string;
  enemyFactionId: string;
  result: string;
  turns: number;
  playerHpLeft: number;
  enemyHpLeft: number;
  mode: string;
  difficulty: string;
  playedAt: string;
};

export default function ProfileView() {
  const commander = useGame((s) => s.commander);
  const stats = useGame((s) => s.stats);
  const exitToHub = useGame((s) => s.exitToHub);
  const logout = useGame((s) => s.logout);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => (r.ok ? r.json() : { matches: [] }))
      .then((d) => setMatches(d.matches || []))
      .finally(() => setLoading(false));
  }, [stats.matches]);

  if (!commander) return null;

  const f = FACTIONS.find((x) => x.id === commander.factionId)!;
  const color = FACTION_COLOR[commander.factionId];
  const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={exitToHub}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Commander Profile
        </p>
        <button
          onClick={logout}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>

      {/* profile header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-5"
        style={{ borderColor: `${color}44`, background: `linear-gradient(135deg, ${f.accentSoft}, rgba(255,255,255,0.02) 70%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{ background: `${color}22`, color, boxShadow: `0 0 24px ${f.glow}` }}
          >
            {FACTION_GLYPH[commander.factionId]}
          </div>
          <div>
            <h1 className="text-xl font-black sm:text-2xl" style={{ color }}>
              {commander.name}
            </h1>
            <p className="text-xs text-foreground/70">{commander.title} · {f.name}</p>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        <StatCard label="Matches" value={stats.matches} accent="#a78bfa" />
        <StatCard label="Wins" value={stats.wins} accent="#34d399" />
        <StatCard label="Losses" value={stats.losses} accent="#fb7185" />
        <StatCard label="Win %" value={`${winRate}%`} accent="#fbbf24" />
      </div>

      {/* match history */}
      <div className="mt-5">
        <h2 className="mb-2 text-sm font-bold">Match History</h2>
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-muted-foreground">
            No matches yet. Go win your first Conquest!
          </div>
        ) : (
          <div className="space-y-1.5">
            {matches.map((m) => {
              const win = m.result === "win";
              const mColor = FACTION_COLOR[m.factionId];
              const eColor = FACTION_COLOR[m.enemyFactionId];
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-white/[0.02] px-3 py-2",
                    win ? "border-emerald-400/20" : "border-rose-400/20"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      win ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"
                    )}
                  >
                    {win ? "W" : "L"}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-base" style={{ color: mColor }}>
                      {FACTION_GLYPH[m.factionId]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">
                        {m.commanderName} vs {m.enemyName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.turns} turns · {m.difficulty} · {m.mode}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {timeAgo(m.playedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center sm:p-3"
      style={{ boxShadow: `inset 0 0 20px ${accent}10` }}
    >
      <p className="text-xl font-black tabular-nums sm:text-2xl" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}
