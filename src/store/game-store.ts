"use client";

import { create } from "zustand";
import {
  createMatch,
  playCard as enginePlay,
  attackWith as engineAttack,
  endTurn as engineEndTurn,
  runEnemyTurn,
  canPlay,
  type MatchState,
  type Side,
  buildDeckFromIds,
} from "@/lib/match-engine";
import type { DeckData } from "@/lib/match-engine";

export type View = "landing" | "hub" | "game" | "deckbuilder" | "profile" | "multiplayer" | "collection" | "campaign" | "operations" | "domain" | "headquarters" | "codex";

type Commander = {
  id: string;
  name: string;
  title: string;
  factionId: string;
  wins: number;
  losses: number;
  matches: number;
  shards: number;
  seasonXp: number;
  seasonTier: number;
  collectionLevel: number;
  influence: number;
  plasma: number;
  biomass: number;
  crystals: number;
  tritium: number;
  quantumCores: number;
};

type Stats = { wins: number; losses: number; matches: number };

type GameState = {
  view: View;
  commander: Commander | null;
  loginOpen: boolean;
  match: MatchState | null;
  stats: Stats;
  resultCounted: boolean;
  decks: DeckData[];
  activeDeckId: string | null;
  difficulty: "easy" | "normal" | "hard";
  mode: "conquest" | "ascension" | "singularity" | "multiplayer" | "campaign";
  multiplayerStatus: "idle" | "queueing" | "matched" | "playing";
  authHydrated: boolean;
  // campaign match context (set when starting a campaign chapter)
  campaignChapterId: string | null;
  packOpen: boolean;
  lastRewards: { drop: { defId: string; rarity: string; isNew: boolean } | null; shards: number; seasonXp: number; dailyBonus: boolean } | null;

  // auth
  openLogin: () => void;
  closeLogin: () => void;
  onAuthed: () => Promise<void>; // called after NextAuth signin/signup
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
  enterGame: () => void;
  exitToLanding: () => void;
  exitToHub: () => void;
  setView: (v: View) => void;
  setPackOpen: (open: boolean) => void;

  // match
  playMatch: () => void;
  startCampaignChapter: (chapter: {
    id: string;
    enemyName: string;
    enemyFactionId: string;
    enemyDeckIds: string[];
    enemyHp: number;
  }) => void;
  startMatch: () => void;
  selectHand: (idx: number | null) => void;
  selectAttacker: (sectorIdx: number | null) => void;
  playSelected: (col: number) => void;
  playAnomaly: (handIdx: number) => void;
  attack: (sectorIdx: number) => void;
  endPlayerTurn: () => void;
  replay: () => void;
  setDifficulty: (d: GameState["difficulty"]) => void;
  setMode: (m: GameState["mode"]) => void;

  // decks
  loadDecks: () => Promise<void>;
  saveDeck: (name: string, factionId: string, cardDefIds: string[], id?: string) => Promise<boolean>;
  deleteDeck: (id: string) => Promise<void>;
  setActiveDeck: (id: string | null) => Promise<void>;

  // multiplayer
  findMultiplayerMatch: () => Promise<void>;
  cancelMatchmaking: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  view: "landing",
  commander: null,
  loginOpen: false,
  match: null,
  stats: { wins: 0, losses: 0, matches: 0 },
  resultCounted: true,
  decks: [],
  activeDeckId: null,
  difficulty: "normal",
  mode: "conquest",
  multiplayerStatus: "idle",
  authHydrated: false,
  campaignChapterId: null,
  packOpen: false,
  lastRewards: null,

  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),

  onAuthed: async () => {
    await get().hydrateSession();
    set({ loginOpen: false, view: "hub" });
    void get().loadDecks();
  },

  hydrateSession: async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        set({ authHydrated: true });
        return;
      }
      const data = await res.json();
      if (data.commander) {
        set({
          commander: data.commander,
          stats: {
            wins: data.commander.wins,
            losses: data.commander.losses,
            matches: data.commander.matches,
          },
          decks: data.decks || [],
          activeDeckId: data.commander.activeDeckId || null,
          authHydrated: true,
        });
      } else {
        set({ authHydrated: true });
      }
    } catch {
      set({ authHydrated: true });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "csrfToken=" + (await getCsrf()),
      });
    } catch {
      /* ignore */
    }
    set({
      commander: null,
      match: null,
      view: "landing",
      stats: { wins: 0, losses: 0, matches: 0 },
      decks: [],
      activeDeckId: null,
      resultCounted: true,
    });
  },

  enterGame: () => {
    if (get().commander) {
      set({ view: "hub" });
    } else {
      set({ loginOpen: true });
    }
  },

  exitToLanding: () => set({ view: "landing" }),
  exitToHub: () => set({ view: "hub", match: null, resultCounted: true }),
  setView: (v) => set({ view: v }),
  setPackOpen: (open) => set({ packOpen: open }),

  playMatch: () => {
    const c = get().commander;
    if (!c) return;
    const deck = getActiveDeck(get);
    const match = createMatch(c.name, c.factionId, undefined, undefined, deck, get().difficulty);
    set({ match, view: "game", resultCounted: false, campaignChapterId: null, mode: "conquest" });
  },

  startCampaignChapter: (chapter: {
    id: string;
    enemyName: string;
    enemyFactionId: string;
    enemyDeckIds: string[];
    enemyHp: number;
  }) => {
    const c = get().commander;
    if (!c) return;
    const deck = getActiveDeck(get);
    const match = createMatch(
      c.name,
      c.factionId,
      chapter.enemyName,
      chapter.enemyFactionId,
      deck,
      "normal",
      chapter.enemyDeckIds,
      chapter.enemyHp
    );
    set({
      match,
      view: "game",
      resultCounted: false,
      campaignChapterId: chapter.id,
      mode: "campaign",
    });
  },

  startMatch: () => {
    const c = get().commander;
    if (!c) return;
    const deck = getActiveDeck(get);
    const match = createMatch(c.name, c.factionId, undefined, undefined, deck, get().difficulty);
    set({ match, resultCounted: false });
  },

  selectHand: (idx) =>
    set((s) => ({
      match: s.match ? { ...s.match, selectedHandIdx: idx, selectedAttacker: null } : s.match,
    })),

  selectAttacker: (sectorIdx) =>
    set((s) => ({
      match: s.match ? { ...s.match, selectedAttacker: sectorIdx, selectedHandIdx: null } : s.match,
    })),

  playSelected: (col) => {
    const s = get();
    if (!s.match) return;
    const idx = s.match.selectedHandIdx;
    if (idx === null) return;
    if (!canPlay(s.match, idx)) return;
    const next = enginePlay(s.match, idx, col);
    set({ match: next });
  },

  playAnomaly: (handIdx: number) => {
    const s = get();
    if (!s.match) return;
    if (!canPlay(s.match, handIdx)) return;
    const next = enginePlay(s.match, handIdx, 0);
    set({ match: next });
  },

  attack: (sectorIdx) => {
    const s = get();
    if (!s.match) return;
    const next = engineAttack(s.match, sectorIdx);
    set({ match: next });
    maybeCountResult(get, set, next);
  },

  endPlayerTurn: () => {
    const s = get();
    if (!s.match || s.match.phase === "over") return;
    set({ match: { ...s.match, aiThinking: true } });
    setTimeout(() => {
      const cur = get().match;
      if (!cur) return;
      const ended = engineEndTurn(cur);
      const afterEnemy = runEnemyTurn(ended);
      set({ match: { ...afterEnemy, aiThinking: false } });
      maybeCountResult(get, set, afterEnemy);
    }, 650);
  },

  replay: () => {
    get().startMatch();
  },

  setDifficulty: (d) => set({ difficulty: d }),
  setMode: (m) => set({ mode: m }),

  loadDecks: async () => {
    try {
      const res = await fetch("/api/decks");
      if (!res.ok) return;
      const data = await res.json();
      set({ decks: data.decks || [] });
    } catch {
      /* ignore */
    }
  },

  saveDeck: async (name, factionId, cardDefIds, id) => {
    try {
      const url = id ? `/api/decks/${id}` : "/api/decks";
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, factionId, cardDefIds }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return false;
      }
      await get().loadDecks();
      return true;
    } catch {
      return false;
    }
  },

  deleteDeck: async (id) => {
    try {
      await fetch(`/api/decks/${id}`, { method: "DELETE" });
      await get().loadDecks();
    } catch {
      /* ignore */
    }
  },

  setActiveDeck: async (id) => {
    if (id === null) return;
    try {
      await fetch(`/api/decks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      set({ activeDeckId: id });
      await get().loadDecks();
    } catch {
      /* ignore */
    }
  },

  findMultiplayerMatch: async () => {
    const deckId = get().activeDeckId ?? get().decks[0]?.id;
    if (!deckId) return;
    set({ multiplayerStatus: "queueing" });
    try {
      const res = await fetch("/api/pvp/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, queueType: "unranked" }),
      });
      if (!res.ok) set({ multiplayerStatus: "idle" });
    } catch {
      set({ multiplayerStatus: "idle" });
    }
  },
  cancelMatchmaking: () => set({ multiplayerStatus: "idle" }),
}));

// helpers
function getActiveDeck(get: () => GameState): string[] | undefined {
  const { decks, activeDeckId } = get();
  if (!activeDeckId) return undefined;
  const d = decks.find((x) => x.id === activeDeckId);
  return d?.cardDefIds;
}

async function getCsrf(): Promise<string> {
  try {
    const res = await fetch("/api/auth/csrf");
    const data = await res.json();
    return data.csrfToken || "";
  } catch {
    return "";
  }
}

function maybeCountResult(
  get: () => GameState,
  set: (partial: Partial<GameState>) => void,
  match: MatchState
) {
  if (match.phase !== "over") return;
  if (get().resultCounted) return;
  const win = match.winner === "player";
  // optimistic local update
  set({
    resultCounted: true,
    stats: {
      wins: get().stats.wins + (win ? 1 : 0),
      losses: get().stats.losses + (win ? 0 : 1),
      matches: get().stats.matches + 1,
    },
  });

  // count deployed + cast for quest progress (entities on board + anomalies implied by log)
  const deployedCount = match.sectors.filter((s) => s && s.ownerSide === "player").length;

  // persist to DB (fire-and-forget) and capture rewards
  const c = get().commander;
  const isCampaign = !!get().campaignChapterId;
  if (c) {
    fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commanderName: c.name,
        factionId: c.factionId,
        enemyName: match.enemy.name,
        enemyFactionId: match.enemy.factionId,
        result: win ? "win" : "loss",
        turns: match.turn,
        playerHpLeft: match.player.hp,
        enemyHpLeft: match.enemy.hp,
        mode: isCampaign ? "campaign" : get().mode,
        difficulty: get().difficulty,
        deployedCount,
        castCount: 0, // anomalies count not tracked in state; could parse log
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.rewards) {
          set({ lastRewards: data.rewards });
        }
        // if this was a campaign chapter win, mark it complete
        const chapterId = get().campaignChapterId;
        if (isCampaign && win && chapterId) {
          fetch(`/api/campaign/${chapterId}/complete`, { method: "POST" })
            .then((r) => r.json())
            .catch(() => {});
        }
      })
      .catch(() => {});
  }
}
