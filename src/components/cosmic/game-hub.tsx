"use client";

import { useCallback, useEffect, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import QuestsPanel from "@/components/cosmic/quests-panel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);
const FACTION_ART: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.art ?? ""])
);

type Assignment = {
  id: string;
  type: string;
  title: string;
  status: "active" | "ready";
  assetType: string;
  deckId: string | null;
  cardDefId: string | null;
  planetId: string | null;
  description: string | null;
  rewards: Record<string, unknown>;
  completesAt: string;
};

type DeckLicense = {
  licenseId: string;
  displayName: string;
  deckTier: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
};

type BriefingAction = {
  kind:
    | "claim_assignment"
    | "claim_reward"
    | "claim_daily_reward"
    | "start_assignment"
    | "open_domain"
    | "open_deckbuilder"
    | "open_pack"
    | "play_match"
    | "open_campaign"
    | "open_multiplayer"
    | "open_headquarters"
    | "open_operations";
  label: string;
  assignmentId?: string;
  rewardId?: string;
  assignmentType?: "resource" | "study" | "rescue";
  view?: string;
};

type BriefingItem = {
  id: string;
  title: string;
  body: string;
  priority: "critical" | "high" | "medium" | "low";
  source: string;
  action: BriefingAction;
};

type DailyBriefing = {
  generatedAt: string;
  headline: string;
  factionVoiceLine: string;
  commander: {
    name: string;
    factionId: string;
    factionName: string;
    glyph: string;
    color: string;
  };
  summary: {
    readyAssignments: number;
    activeAssignments: number;
    pendingResourceTotal: number;
    availableDecks: number;
    deckCount: number;
    nearestLicense: { displayName: string; progress: number; target: number; unlocked: boolean } | null;
    claimableQuests: number;
    readyRewards: number;
    currentStreak: number;
    canClaimDaily: boolean;
  };
  recommendedAction: BriefingItem;
  secondaryActions: BriefingItem[];
  completedItems: BriefingItem[];
  warnings: BriefingItem[];
  context: {
    deckState: string;
    worldState: string;
    progressionState: string;
  };
};

export default function GameHub() {
  const commander = useGame((s) => s.commander);
  const stats = useGame((s) => s.stats);
  const decks = useGame((s) => s.decks);
  const activeDeckId = useGame((s) => s.activeDeckId);
  const difficulty = useGame((s) => s.difficulty);
  const playMatch = useGame((s) => s.playMatch);
  const exitToLanding = useGame((s) => s.exitToLanding);
  const logout = useGame((s) => s.logout);
  const setView = useGame((s) => s.setView);
  const setDifficulty = useGame((s) => s.setDifficulty);
  const setActiveDeck = useGame((s) => s.setActiveDeck);
  const setPackOpen = useGame((s) => s.setPackOpen);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [licenses, setLicenses] = useState<DeckLicense[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [assignmentBusy, setAssignmentBusy] = useState<string | null>(null);
  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? decks[0];

  const loadBetaStatus = useCallback(() => {
    void Promise.all([
      fetch("/api/assignments").then((r) => (r.ok ? r.json() : { assignments: [] })),
      fetch("/api/deck-licenses").then((r) => (r.ok ? r.json() : { licenses: [] })),
      fetch("/api/daily-briefing").then((r) => (r.ok ? r.json() : { briefing: null })),
    ]).then(([assignmentData, licenseData, briefingData]) => {
      setAssignments(assignmentData.assignments || []);
      setLicenses(licenseData.licenses || []);
      setBriefing(briefingData.briefing || null);
    });
  }, []);

  useEffect(() => {
    if (!commander) return;
    loadBetaStatus();
    const interval = setInterval(loadBetaStatus, 15000);
    return () => clearInterval(interval);
  }, [commander, loadBetaStatus]);

  if (!commander) return null;

  const f = FACTIONS.find((x) => x.id === commander.factionId)!;
  const color = FACTION_COLOR[commander.factionId];
  const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
  const activeDeckAssignment = activeDeck
    ? assignments.find((assignment) => assignment.deckId === activeDeck.id && (assignment.status === "active" || assignment.status === "ready"))
    : null;
  const canPlayActiveDeck = !activeDeckAssignment;

  const startAssignment = async (type: "resource" | "study" | "rescue") => {
    if (type === "rescue" && !activeDeck) {
      toast.error("Build or activate a deck before sending a rescue operation");
      setView("deckbuilder");
      return;
    }
    setAssignmentBusy(type);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, deckId: type === "rescue" ? activeDeck?.id : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not start assignment");
        return;
      }
      toast.success(`${data.assignment?.title || "Assignment"} started`);
      loadBetaStatus();
    } finally {
      setAssignmentBusy(null);
    }
  };

  const claimAssignment = async (assignmentId: string) => {
    const res = await fetch("/api/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, action: "claim" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Assignment is not ready");
      return;
    }
    toast.success("Assignment rewards claimed");
    hydrateSession();
    loadBetaStatus();
  };

  const claimReward = async (rewardId: string) => {
    const res = await fetch(`/api/rewards/${rewardId}/claim`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Reward is not ready");
      return;
    }
    const granted = data.granted || {};
    const parts = [
      granted.shards ? `${granted.shards} shards` : null,
      granted.seasonXp ? `${granted.seasonXp} XP` : null,
      Array.isArray(granted.cards) && granted.cards.length ? `${granted.cards.length} card${granted.cards.length === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    toast.success(parts.length ? `Reward claimed: ${parts.join(", ")}` : "Reward claimed");
    hydrateSession();
    loadBetaStatus();
  };

  const claimDailyReward = async () => {
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "claim_daily" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Daily signal is not ready");
      loadBetaStatus();
      return;
    }
    if (data.reward?.id) {
      await claimReward(data.reward.id);
      return;
    }
    loadBetaStatus();
  };

  const runBriefingAction = (action: BriefingAction) => {
    if (action.kind === "claim_assignment" && action.assignmentId) {
      void claimAssignment(action.assignmentId);
      return;
    }
    if (action.kind === "claim_reward" && action.rewardId) {
      void claimReward(action.rewardId);
      return;
    }
    if (action.kind === "claim_daily_reward") {
      void claimDailyReward();
      return;
    }
    if (action.kind === "start_assignment" && action.assignmentType) {
      void startAssignment(action.assignmentType);
      return;
    }
    if (action.kind === "open_pack") {
      setPackOpen(true);
      return;
    }
    if (action.kind === "play_match") {
      if (canPlayActiveDeck) playMatch();
      return;
    }
    const targetView = action.view ?? actionKindToView(action.kind);
    if (targetView) setView(targetView as Parameters<typeof setView>[0]);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={exitToLanding}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Site
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Commander Hub
        </p>
        <button
          onClick={logout}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>

      {/* commander hero card */}
      <div
        className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
        style={{
          borderColor: `${color}44`,
          background: `linear-gradient(135deg, ${f.accentSoft}, rgba(255,255,255,0.02) 70%)`,
        }}
      >
        {FACTION_ART[commander.factionId] && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${FACTION_ART[commander.factionId]})` }}
          />
        )}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl sm:h-20 sm:w-20 sm:text-4xl"
              style={{ background: `${color}22`, color, boxShadow: `0 0 30px ${f.glow}` }}
            >
              {FACTION_GLYPH[commander.factionId]}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                Commander · {commander.title}
              </p>
              <h1 className="truncate text-2xl font-black sm:text-3xl" style={{ color }}>
                {commander.name}
              </h1>
              <p className="mt-0.5 truncate text-xs text-foreground/70 sm:text-sm">
                {f.name} · {f.playstyle}
              </p>
            </div>
          </div>
          <Button
            onClick={canPlayActiveDeck ? playMatch : undefined}
            disabled={!canPlayActiveDeck}
            className="shrink-0 bg-emerald-400 px-6 py-3 text-sm font-bold text-emerald-950 shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:bg-emerald-300"
          >
            {canPlayActiveDeck ? "▶ Play vs AI" : "Deck Away"}
          </Button>
        </div>
        {activeDeckAssignment && (
          <p className="relative mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200">
            {activeDeck?.name} is assigned to {activeDeckAssignment.title}. Returns {formatTimeLeft(activeDeckAssignment.completesAt)}.
          </p>
        )}
      </div>

      {/* stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard label="Wins" value={stats.wins} accent="#34d399" />
        <StatCard label="Losses" value={stats.losses} accent="#fb7185" />
        <StatCard label="Win Rate" value={`${winRate}%`} accent="#fbbf24" />
      </div>

      {/* season pass + shards bar */}
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        {/* season tier badge */}
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-fuchsia-400/20">
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Tier</span>
          <span className="text-lg font-black text-amber-300">{commander.seasonTier}</span>
        </div>
        {/* season xp progress */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-bold uppercase tracking-widest text-muted-foreground">Convergence Season</span>
            <span className="tabular-nums text-amber-300">{commander.seasonXp % 100}/100 XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-400 transition-all duration-500"
              style={{ width: `${(commander.seasonXp % 100)}%` }}
            />
          </div>
        </div>
        {/* shards */}
        <div className="flex shrink-0 flex-col items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5">
          <span className="flex items-center gap-1 text-sm font-black tabular-nums text-cyan-300">
            <span className="text-xs">◈</span>{commander.shards}
          </span>
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Shards</span>
        </div>
      </div>

      {briefing && (
        <CommandBrief briefing={briefing} color={color} onAction={runBriefingAction} />
      )}

      {/* beta live loop */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Assignments</p>
              <h2 className="text-sm font-black text-foreground">Live Galaxy Clock</h2>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-foreground/60">
              {assignments.length} active
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <AssignmentAction
              label="Gather"
              desc="30m resource run"
              color="#34d399"
              disabled={assignmentBusy !== null}
              onClick={() => startAssignment("resource")}
            />
            <AssignmentAction
              label="Study"
              desc="45m world survey"
              color="#38bdf8"
              disabled={assignmentBusy !== null}
              onClick={() => startAssignment("study")}
            />
            <AssignmentAction
              label="Rescue"
              desc="60m deck away"
              color="#fbbf24"
              disabled={assignmentBusy !== null || !activeDeck || Boolean(activeDeckAssignment)}
              onClick={() => startAssignment("rescue")}
            />
          </div>

          <div className="mt-3 space-y-2">
            {assignments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-muted-foreground">
                No assignments running. Send a crew, study a world, or deploy a deck so the galaxy keeps moving while you are away.
              </p>
            ) : (
              assignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{assignment.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {assignment.assetType} · {assignment.status === "ready" ? "ready to claim" : formatTimeLeft(assignment.completesAt)}
                    </p>
                  </div>
                  {assignment.status === "ready" ? (
                    <Button size="sm" onClick={() => claimAssignment(assignment.id)} className="h-7 bg-emerald-400 px-2 text-[10px] font-bold text-emerald-950 hover:bg-emerald-300">
                      Claim
                    </Button>
                  ) : (
                    <span className="shrink-0 rounded bg-white/10 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                      Running
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Deck Licenses</p>
          <h2 className="mb-3 text-sm font-black text-foreground">Progressive Battle Tiers</h2>
          <div className="space-y-2">
            {licenses.slice(0, 4).map((license) => {
              const pct = Math.min(100, (license.progress / Math.max(1, license.target)) * 100);
              return (
                <div key={license.licenseId} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground">{license.displayName}</p>
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", license.unlocked ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-muted-foreground")}>
                      {license.unlocked ? "Unlocked" : `${license.progress}/${license.target}`}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-300" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{license.reward}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* match setup: difficulty + active deck */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* difficulty */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            AI Difficulty
          </p>
          <div className="flex gap-1.5">
            {(["easy", "normal", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold capitalize transition",
                  difficulty === d
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                    : "border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {/* active deck */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Active Deck
          </p>
          {decks.length === 0 ? (
            <button
              onClick={() => setView("deckbuilder")}
              className="w-full rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-xs text-foreground/60 transition hover:bg-white/5"
            >
              + Build your first deck
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={activeDeckId || ""}
                onChange={(e) => setActiveDeck(e.target.value || null)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-background/60 px-2 py-1.5 text-xs text-foreground"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.cardDefIds.length})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setView("deckbuilder")}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-foreground/70 hover:bg-white/10"
              >
                Edit
              </button>
            </div>
          )}
          {!activeDeck && decks.length > 0 && (
            <p className="mt-1 text-[10px] text-amber-300/70">Using default deck — select one above</p>
          )}
        </div>
      </div>

      {/* nav grid: pack / campaigns / collection / operations / deck / history / multiplayer */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-4">
        <NavCard
          icon="✦"
          label="Open Pack"
          desc="100 ◈ · 5 cards"
          onClick={() => setPackOpen(true)}
          highlight={commander.shards >= 100}
        />
        <NavCard
          icon="📖"
          label="Campaigns"
          desc="Story chapters"
          onClick={() => setView("campaign")}
        />
        <NavCard
          icon="🃏"
          label="Collection"
          desc="Cards & crafting"
          onClick={() => setView("collection")}
        />
        <NavCard
          icon="🪐"
          label="Domain"
          desc="Planets & resources"
          onClick={() => setView("domain")}
        />
        <NavCard
          icon="◆"
          label="Headquarters"
          desc="Homeworld base"
          onClick={() => setView("headquarters")}
        />
        <NavCard
          icon="✦"
          label="Operations"
          desc="Live events"
          onClick={() => setView("operations")}
        />
        <NavCard
          icon="🂠"
          label="Deck Builder"
          desc={`${decks.length} saved`}
          onClick={() => setView("deckbuilder")}
        />
        <NavCard
          icon="📜"
          label="Match History"
          desc={`${stats.matches} played`}
          onClick={() => setView("profile")}
        />
        <NavCard
          icon="⚔"
          label="Multiplayer"
          desc="Find a match"
          onClick={() => setView("multiplayer")}
        />
      </div>

      {/* quests panel */}
      <div className="mt-4">
        <QuestsPanel />
      </div>

      {/* how to play compact */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="mb-2 text-sm font-bold">Beta Quick Rules</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground sm:grid-cols-3">
          <span><span className="text-emerald-300">◈</span> Resonance ramps +1/turn</span>
          <span><span className="text-emerald-300">⚔</span> Tap unit, tap again to strike</span>
          <span><span className="text-amber-300">↟</span> Survive a turn → evolve</span>
          <span><span className="text-amber-300">✦</span> 20 Influence = Ascension win</span>
          <span><span className="text-amber-300">✺</span> Turn 5: Convergence Event</span>
          <span><span className="text-rose-300">♥</span> 0 HP = Conquest loss</span>
        </div>
      </div>
    </div>
  );
}

function CommandBrief({
  briefing,
  color,
  onAction,
}: {
  briefing: DailyBriefing;
  color: string;
  onAction: (action: BriefingAction) => void;
}) {
  const license = briefing.summary.nearestLicense;

  return (
    <section
      className="relative mt-4 overflow-hidden rounded-2xl border bg-black/35 p-4 sm:p-5"
      style={{
        borderColor: `${color}44`,
        boxShadow: `inset 0 0 40px ${color}12, 0 0 30px ${color}12`,
      }}
    >
      <div className="nebula-radial absolute inset-0 opacity-40" />
      <div className="grid-pattern absolute inset-0 opacity-20" />
      <div className="command-scanline pointer-events-none absolute inset-x-0 top-0 h-20" />
      <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl command-link-pulse"
              style={{ background: `${color}22`, color, boxShadow: `0 0 24px ${color}55` }}
            >
              {briefing.commander.glyph}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-muted-foreground">
                Command Link Established
              </p>
              <h2 className="truncate text-lg font-black sm:text-xl" style={{ color }}>
                {briefing.headline}
              </h2>
            </div>
          </div>

          <p className="mb-3 text-xs leading-relaxed text-foreground/75 sm:text-sm">
            {briefing.factionVoiceLine}
          </p>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              Strategic Priority
            </p>
            <h3 className="mt-1 text-sm font-black text-foreground">{briefing.recommendedAction.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{briefing.recommendedAction.body}</p>
            <Button
              onClick={() => onAction(briefing.recommendedAction.action)}
              className="mt-3 h-9 bg-emerald-400 px-4 text-xs font-black text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.3)] hover:bg-emerald-300"
            >
              {briefing.recommendedAction.action.label}
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <BriefMetric label="Ready" value={briefing.summary.readyAssignments} color="#34d399" />
            <BriefMetric label="Timers" value={briefing.summary.activeAssignments} color="#38bdf8" />
            <BriefMetric label="Harvest" value={briefing.summary.pendingResourceTotal} color="#fbbf24" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <BriefMetric label="Rewards" value={briefing.summary.readyRewards} color="#c084fc" />
            <BriefMetric label="Streak" value={briefing.summary.currentStreak} color="#fb7185" />
          </div>

          <div className="grid gap-2 text-xs">
            <BriefContext label="Deck" value={briefing.context.deckState} />
            <BriefContext label="Worlds" value={briefing.context.worldState} />
            <BriefContext
              label="License"
              value={license ? `${license.displayName} ${license.progress}/${license.target}` : briefing.context.progressionState}
            />
          </div>

          {briefing.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/80">Warnings</p>
              <div className="mt-2 space-y-1.5">
                {briefing.warnings.map((item) => (
                  <p key={item.id} className="text-xs text-amber-100/80">{item.title}</p>
                ))}
              </div>
            </div>
          )}

          {briefing.secondaryActions.length > 0 && (
            <div className="grid gap-2">
              {briefing.secondaryActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAction(item.action)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-bold text-foreground">{item.title}</p>
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase", priorityClass(item.priority))}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{item.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BriefMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-2 text-center">
      <p className="text-lg font-black tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function BriefContext({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
      <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-[11px] font-bold text-foreground/75">{value}</span>
    </div>
  );
}

function priorityClass(priority: BriefingItem["priority"]) {
  if (priority === "critical") return "bg-rose-400 text-rose-950";
  if (priority === "high") return "bg-amber-300 text-amber-950";
  if (priority === "medium") return "bg-cyan-300 text-cyan-950";
  return "bg-white/10 text-muted-foreground";
}

function actionKindToView(kind: BriefingAction["kind"]) {
  if (kind === "open_domain") return "domain";
  if (kind === "open_deckbuilder") return "deckbuilder";
  if (kind === "open_campaign") return "campaign";
  if (kind === "open_multiplayer") return "multiplayer";
  if (kind === "open_headquarters") return "headquarters";
  if (kind === "open_operations") return "operations";
  return null;
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center sm:p-4"
      style={{ boxShadow: `inset 0 0 24px ${accent}10` }}
    >
      <p className="text-2xl font-black tabular-nums sm:text-3xl" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function NavCard({
  icon,
  label,
  desc,
  onClick,
  muted,
  highlight,
}: {
  icon: string;
  label: string;
  desc: string;
  onClick: () => void;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition hover:bg-white/[0.05]",
        highlight
          ? "border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
          : "border-white/10 bg-white/[0.02]",
        muted && "opacity-60"
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{desc}</span>
    </button>
  );
}

function AssignmentAction({
  label,
  desc,
  color,
  disabled,
  onClick,
}: {
  label: string;
  desc: string;
  color: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-left transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-45"
      style={{ boxShadow: `inset 0 0 18px ${color}12` }}
    >
      <p className="text-xs font-black" style={{ color }}>{label}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{desc}</p>
    </button>
  );
}

function formatTimeLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ready now";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.ceil((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
