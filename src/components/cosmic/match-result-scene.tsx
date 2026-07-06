"use client";

import { CARD_DEFS } from "@/lib/match-engine";
import { ALL_WORLD_CARDS } from "@/lib/world-cards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MatchRewardPayload = {
  drop: { defId: string; rarity: string; isNew: boolean } | null;
  shards: number;
  seasonXp: number;
  dailyBonus: boolean;
  cardMastery?: Array<{
    defId: string;
    xpGained: number;
    totalXp: number;
    level: number;
    leveledUp: boolean;
    isNew: boolean;
  }>;
  packProgress?: {
    pityCounter: number;
    nextRarePlusAt: number;
    winsUntilRarePlus: number;
  };
};

type Props = {
  winner: "player" | "enemy" | null;
  winCondition: string | null;
  rewards: MatchRewardPayload | null;
  isCampaign: boolean;
  playerName: string;
  enemyName: string;
  playerFactionId: string;
  enemyFactionId: string;
  turns: number;
  playerHpLeft: number;
  enemyHpLeft: number;
  onReplay: () => void;
  onExit: () => void;
};

export default function MatchResultScene({
  winner,
  winCondition,
  rewards,
  isCampaign,
  playerName,
  enemyName,
  playerFactionId,
  enemyFactionId,
  turns,
  playerHpLeft,
  enemyHpLeft,
  onReplay,
  onExit,
}: Props) {
  const win = winner === "player";
  const accent = win ? "#34d399" : "#fb7185";
  const softAccent = win ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)";
  const drop = rewards?.drop ? getCardMeta(rewards.drop.defId) : null;
  const packProgress = rewards?.packProgress;
  const packPct = packProgress
    ? Math.min(100, ((packProgress.nextRarePlusAt - packProgress.winsUntilRarePlus) / Math.max(1, packProgress.nextRarePlusAt)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#02040a] text-white">
      <div className="absolute inset-0 result-starfield" />
      <div className={cn("absolute inset-0", win ? "result-victory-wash" : "result-defeat-wash")} />
      <div className="result-shockwave absolute left-1/2 top-[18%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full" style={{ borderColor: accent }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onExit}
            className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white/70 backdrop-blur transition hover:bg-white/10"
          >
            Return
          </button>
          <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-center backdrop-blur">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/45">Battle Report</p>
            <p className="mt-0.5 text-[10px] font-bold text-white/70">Turn {turns} · {formatWinCondition(winCondition)}</p>
          </div>
          <div className="w-[72px]" />
        </div>

        <div className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="text-center lg:text-left">
            <div
              className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full border text-5xl result-core-pulse lg:mx-0"
              style={{ borderColor: `${accent}66`, color: accent, background: softAccent, boxShadow: `0 0 70px ${softAccent}` }}
            >
              {win ? "✦" : "◆"}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-white/45">
              {win ? "Ascendancy Signal Secured" : "Sector Control Lost"}
            </p>
            <h1 className="mt-2 text-5xl font-black uppercase leading-none sm:text-7xl" style={{ color: accent, textShadow: `0 0 34px ${softAccent}` }}>
              {win ? "Victory" : "Defeat"}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {win
                ? isCampaign
                  ? "The chapter is sealed. Your command imprint spreads through the sector."
                  : `${enemyName} breaks under your assault. Rewards, mastery, and new decisions are transmitting now.`
                : `${playerName}'s line collapsed. Recovery, training, and deck tuning decide the next push.`}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <DuelStat label="Commander" value={playerName} detail={`${playerFactionId} · ${playerHpLeft} HP`} accent="#34d399" />
              <DuelStat label="Opponent" value={enemyName} detail={`${enemyFactionId} · ${enemyHpLeft} HP`} accent="#fb7185" />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:justify-start">
              <Button onClick={onReplay} className="h-11 bg-emerald-400 px-6 text-sm font-black text-emerald-950 hover:bg-emerald-300">
                {isCampaign ? "Replay Chapter" : "Rematch"}
              </Button>
              <Button onClick={onExit} variant="outline" className="h-11 border-white/15 bg-white/5 px-6 text-sm font-black text-white/85 hover:bg-white/10">
                Command Hub
              </Button>
            </div>
          </section>

          <section className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Rewards</p>
                  <h2 className="text-lg font-black">Battle Yield</h2>
                </div>
                {rewards?.dailyBonus && (
                  <span className="rounded-md border border-amber-300/30 bg-amber-300/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                    Daily bonus
                  </span>
                )}
              </div>

              {win && rewards && !isCampaign ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <RewardTile glyph="◈" label="Aether Shards" value={`+${rewards.shards}`} accent="#22d3ee" />
                    <RewardTile glyph="✦" label="Season XP" value={`+${rewards.seasonXp}`} accent="#fbbf24" />
                  </div>

                  {drop && rewards.drop && (
                    <div
                      className="mt-3 overflow-hidden rounded-xl border bg-black/35 p-3"
                      style={{ borderColor: `${rarityColor(rewards.drop.rarity)}66`, boxShadow: `inset 0 0 30px ${rarityColor(rewards.drop.rarity)}18` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border bg-cover bg-center"
                          style={{
                            borderColor: `${rarityColor(rewards.drop.rarity)}88`,
                            backgroundImage: drop.art ? `url(${drop.art})` : undefined,
                            backgroundColor: `${rarityColor(rewards.drop.rarity)}22`,
                          }}
                        >
                          <div className="grid h-full w-full place-items-center bg-black/25 text-lg font-black" style={{ color: rarityColor(rewards.drop.rarity) }}>
                            {drop.art ? "" : "✦"}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: rarityColor(rewards.drop.rarity) }}>
                            {rewards.drop.isNew ? "New card acquired" : "Card drop"}
                          </p>
                          <h3 className="truncate text-base font-black text-white">{drop.name}</h3>
                          <p className="text-xs text-white/50">{rewards.drop.rarity}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/60">
                  {isCampaign ? "Campaign chapter rewards resolve through the campaign node." : "Defeat still records the lesson. Return to command and rebuild the line."}
                </p>
              )}
            </div>

            {rewards?.cardMastery && rewards.cardMastery.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Card Mastery</p>
                <div className="mt-3 grid gap-2">
                  {rewards.cardMastery.slice(0, 4).map((card) => {
                    const meta = getCardMeta(card.defId);
                    return (
                      <div key={card.defId} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-white">{meta.name}</p>
                          <p className="text-[10px] text-white/45">Total {card.totalXp} XP</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black text-emerald-300">+{card.xpGained} XP</p>
                          <p className={cn("text-[10px] font-bold", card.leveledUp ? "text-amber-300" : "text-white/45")}>
                            Lv.{card.level}{card.leveledUp ? " up" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {packProgress && (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Pack Signal</p>
                    <p className="mt-1 text-xs text-white/60">
                      {packProgress.winsUntilRarePlus === 0 ? "Rare+ pressure is armed." : `${packProgress.winsUntilRarePlus} win${packProgress.winsUntilRarePlus === 1 ? "" : "s"} until Rare+ pressure.`}
                    </p>
                  </div>
                  <p className="text-lg font-black text-cyan-200">{packProgress.pityCounter}/{packProgress.nextRarePlusAt}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 transition-all" style={{ width: `${packPct}%` }} />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DuelStat({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-left backdrop-blur">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-0.5 truncate text-sm font-black" style={{ color: accent }}>{value}</p>
      <p className="truncate text-[10px] text-white/45">{detail}</p>
    </div>
  );
}

function RewardTile({ glyph, label, value, accent }: { glyph: string; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-2xl font-black" style={{ color: accent }}>{glyph} {value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/45">{label}</p>
    </div>
  );
}

function getCardMeta(defId: string) {
  const battle = CARD_DEFS.find((card) => card.defId === defId);
  if (battle) return { name: battle.name, art: battle.art };
  const world = ALL_WORLD_CARDS.find((card) => card.defId === defId);
  if (world) return { name: world.name, art: world.art };
  return { name: defId, art: undefined };
}

function rarityColor(rarity: string) {
  if (rarity === "Singularity") return "#f0abfc";
  if (rarity === "Mythic") return "#f97316";
  if (rarity === "Holo") return "#22d3ee";
  if (rarity === "Rare") return "#a78bfa";
  if (rarity === "Uncommon") return "#34d399";
  return "#94a3b8";
}

function formatWinCondition(winCondition: string | null) {
  if (winCondition === "ascension") return "Ascension";
  if (winCondition === "singularity") return "Singularity";
  return "Conquest";
}
