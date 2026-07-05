"use client";

import { useEffect } from "react";
import SiteHeader from "@/components/cosmic/site-header";
import Starfield from "@/components/cosmic/starfield";
import FactionShowcase from "@/components/cosmic/faction-showcase";
import SectorGrid from "@/components/cosmic/sector-grid";
import GameCard from "@/components/cosmic/game-card";
import LoginDialog from "@/components/cosmic/login-dialog";
import MatchView from "@/components/cosmic/match-view";
import GameHub from "@/components/cosmic/game-hub";
import DeckBuilder from "@/components/cosmic/deck-builder";
import ProfileView from "@/components/cosmic/profile-view";
import MultiplayerView from "@/components/cosmic/multiplayer-view";
import CollectionView from "@/components/cosmic/collection-view";
import CampaignView from "@/components/cosmic/campaign-view";
import OperationsView from "@/components/cosmic/operations-view";
import DomainView from "@/components/cosmic/domain-view";
import FactionCodex from "@/components/cosmic/faction-codex";
import PackOpener from "@/components/cosmic/pack-opener";
import InstallPrompt from "@/components/cosmic/install-prompt";
import { useGame } from "@/store/game-store";
import {
  MECHANICS,
  WIN_CONDITIONS,
  CARD_TYPES,
  SAMPLE_CARDS,
  HERO_STATS,
  VISION_PILLARS,
} from "@/lib/game-data";

export default function Home() {
  const view = useGame((s) => s.view);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const packOpen = useGame((s) => s.packOpen);
  const setPackOpen = useGame((s) => s.setPackOpen);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <div
      id="top"
      className="relative flex min-h-screen flex-col bg-background text-foreground"
    >
      {/* ===== GLOBAL COSMIC BACKGROUND LAYERS ===== */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 nebula-radial animate-drift" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Starfield density={1} />
      </div>

      {view === "game" ? (
        <MatchView />
      ) : view === "hub" ? (
        <GameHub />
      ) : view === "deckbuilder" ? (
        <DeckBuilder />
      ) : view === "profile" ? (
        <ProfileView />
      ) : view === "multiplayer" ? (
        <MultiplayerView />
      ) : view === "collection" ? (
        <CollectionView />
      ) : view === "campaign" ? (
        <CampaignView />
      ) : view === "operations" ? (
        <OperationsView />
      ) : view === "domain" ? (
        <DomainView />
      ) : view === "codex" ? (
        <FactionCodex />
      ) : (
        <Landing />
      )}

      <LoginDialog />
      {packOpen && <PackOpener onClose={() => setPackOpen(false)} />}
      <InstallPrompt />
    </div>
  );
}

/* ============ LANDING ============ */
function Landing() {
  const enterGame = useGame((s) => s.enterGame);
  const openLogin = useGame((s) => s.openLogin);
  const commander = useGame((s) => s.commander);
  const setView = useGame((s) => s.setView);

  // primary CTA: if logged in, go straight to hub; otherwise open login
  const play = () => (commander ? enterGame() : openLogin());

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-0 opacity-40"
            style={{
              backgroundImage: "url(/hero-bg.png)",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              maskImage:
                "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 75%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-20 lg:pt-24">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200 sm:text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Closed Beta — play a live match
                </span>

                <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight sm:mt-5 sm:text-6xl lg:text-7xl">
                  ASTRAL
                  <br />
                  <span className="shimmer-text">ASCENDANCY</span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/80 sm:mt-5 sm:text-lg">
                  An alien-themed trading card game across a galaxy of warring
                  civilizations. Deploy entities onto a 3-lane Sector Grid and
                  crush the enemy Commander.
                </p>

                <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80 sm:mt-3 sm:text-sm">
                  Conquer the galaxy. One card at a time.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    onClick={play}
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_0_36px_rgba(52,211,153,0.45)] transition hover:scale-[1.02] hover:bg-emerald-300 active:scale-95"
                  >
                    <span>{commander ? "Enter the Cluster" : "Play Now — Free"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                  <a
                    href="#world"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-foreground/90 backdrop-blur transition hover:bg-white/10"
                  >
                    Explore the Universe
                  </a>
                </div>

                <dl className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
                  {HERO_STATS.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 backdrop-blur sm:p-3"
                    >
                      <dt className="text-xl font-black text-emerald-300 sm:text-2xl">{s.value}</dt>
                      <dd className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                        {s.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative hidden h-[420px] sm:block sm:h-[480px] lg:h-[520px]">
                <HeroCards />
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <section className="border-y border-white/10 bg-black/30 py-3.5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:px-6">
            <span>Free to play</span>
            <span className="text-emerald-400/60">✦</span>
            <span className="text-foreground/50">Sector combat</span>
            <span className="text-emerald-400/60">✦</span>
            <span className="text-foreground/50">Living factions</span>
            <span className="text-emerald-400/60">✦</span>
            <span className="text-foreground/50">Cinematic packs</span>
            <span className="text-emerald-400/60">✦</span>
            <span className="text-foreground/50">Galaxy campaign</span>
          </div>
        </section>

        {/* ============ WORLD ============ */}
        <section id="world" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="The Universe"
              title="The Convergence shattered the galaxy"
              subtitle="Five ancient civilizations. One collapsing barrier between galaxies. A war for the Aetherion Cluster."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <LoreCard index="01" title="The Aetherion Cluster" accent="#34d399" body="A web of a hundred thousand stars where five civilizations reached ascendancy in isolation — each believing itself alone in the universe. For ten thousand years, the Barrier Veil kept them apart." />
              <LoreCard index="02" title="The Convergence" accent="#e879f9" body="An apocalyptic cosmic event cracked the Veil. Galaxies collided. Worlds folded into one another. The five civilizations met — and the war for the Cluster began. You are a Commander. You choose who wins." />
              <LoreCard index="03" title="The Ascendancy War" accent="#fbbf24" body="There is no peace between stars. Conquer by force, ascend through influence, or trigger the Genesis Singularity. Every match is a battle in the eternal war — and every card is a being, a world, a law of physics." />
            </div>
          </div>
        </section>

        {/* ============ FACTIONS ============ */}
        <section id="factions" className="scroll-mt-20 border-t border-white/10 bg-black/20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="The Five Civilizations"
              title="Five galaxies. Five ways to ascend."
              subtitle="Each faction is a full playstyle — pick one, or weave them together with Resonance Weaving. Hover a faction to inspect it."
            />
            <div className="mt-12">
              <FactionShowcase />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setView("codex")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-foreground/90 transition hover:bg-white/10"
              >
                📖 Explore the Full Faction Codex →
              </button>
            </div>
          </div>
        </section>

        {/* ============ SECTOR GRID DEMO ============ */}
        <section id="board" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="Signature Mechanic"
              title="The Sector Grid — geography is a weapon"
              subtitle="Where you place your entities matters. Try the live demo below, then take the system into a live match."
            />
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur sm:p-10">
              <SectorGrid />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={play}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/90 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
              >
                ▶ Play a live match {commander ? "" : "(login)"}
              </button>
            </div>
          </div>
        </section>

        {/* ============ MECHANICS ============ */}
        <section id="mechanics" className="scroll-mt-20 border-t border-white/10 bg-black/20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="Signature Mechanics"
              title="Six systems that make the galaxy playable"
              subtitle="Each mechanic turns lore into action: position, evolution, hidden information, comeback drama, cosmic events, and hybrid deck identity."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MECHANICS.map((m, i) => (
                <div
                  key={m.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 text-7xl font-black opacity-[0.06] transition-opacity group-hover:opacity-[0.12]">
                    {m.icon}
                  </div>
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-xl text-emerald-300">
                      {m.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{m.name}</h3>
                    <p className="mt-1 text-sm font-medium text-emerald-300/80">{m.oneLiner}</p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75">{m.description}</p>
                    <p className="mt-4 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                      <span className="font-bold text-foreground/70">Design pillar:</span> {m.designPillar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ WIN CONDITIONS ============ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="Three Paths to Victory"
              title="Win your way — not just by hitting HP"
              subtitle="Aggro, control, and combo players each get a dedicated path through the Ascendancy War."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {WIN_CONDITIONS.map((w, i) => {
                const colors = ["#fb7185", "#34d399", "#a78bfa"];
                const c = colors[i];
                return (
                  <div
                    key={w.id}
                    className="relative overflow-hidden rounded-2xl border p-6"
                    style={{ borderColor: `${c}33`, background: `${c}0d` }}
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                      style={{ background: `${c}1f`, color: c, boxShadow: `0 0 30px ${c}55` }}
                    >
                      {w.icon}
                    </div>
                    <h3 className="mt-4 text-xl font-bold" style={{ color: c }}>{w.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-foreground">{w.summary}</p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/70">{w.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ CARD TYPES ============ */}
        <section className="border-t border-white/10 bg-black/20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="The Arsenal"
              title="Six card types. Infinite combinations."
              subtitle="From your immortal Commander to reality-bending Anomalies — every card class has a distinct role on the galactic board."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CARD_TYPES.map((t) => (
                <div
                  key={t.name}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl"
                    style={{ background: `${t.color}1f`, color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: t.color }}>{t.name}</h3>
                    <p className="mt-1 text-sm leading-snug text-foreground/70">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CARD GALLERY ============ */}
        <section id="cards" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="The Codex"
              title="Cards from across the Cluster"
              subtitle="A glimpse of the launch set. Hover any card to feel the holographic resonance — tilt to catch the light."
            />
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_CARDS.map((card, i) => (
                <GameCard key={card.id} card={card} index={i} />
              ))}
            </div>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              320+ cards at launch · 6 rarity tiers including animated{" "}
              <span className="font-bold text-fuchsia-300">Singularity</span> foils
            </p>
          </div>
        </section>

        {/* ============ VISION ============ */}
        <section id="vision" className="scroll-mt-20 border-t border-white/10 bg-black/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              kicker="Game Direction"
              title="A browser game client, not a dashboard"
              subtitle="The web app handles accounts and persistence. The player experience should feel like entering a living cosmic war map."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VISION_PILLARS.map((item) => (
                <div
                  key={item.pillar}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <h3 className="text-lg font-bold text-emerald-300">{item.pillar}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.promise}</p>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground/70">Player feeling:</span> {item.playerFeeling}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section id="play" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-fuchsia-400/5 to-cyan-400/10 p-8 text-center sm:p-14">
              <div className="pointer-events-none absolute inset-0 nebula-radial opacity-60" />
              <div className="relative">
                <span className="text-4xl">✦</span>
                <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                  The Cluster is calling your name
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-foreground/75">
                  Register your Commander and play a live match right now. Deploy
                  entities, spend Resonance, and crush the enemy Commander on the
                  Sector Grid.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={play}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_0_36px_rgba(52,211,153,0.45)] transition hover:scale-[1.02] hover:bg-emerald-300"
                  >
                    {commander ? "Enter the Cluster →" : "Register & Play →"}
                  </button>
                  <a
                    href="#factions"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-foreground/90 transition hover:bg-white/10"
                  >
                    Study the Factions
                  </a>
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  Free to play · No download · Cross-platform
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER (sticky bottom) ============ */}
      <footer className="mt-auto border-t border-white/10 bg-black/40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-lg text-emerald-300">✦</span>
                <div className="leading-none">
                  <p className="text-sm font-extrabold">
                    ASTRAL<span className="text-emerald-300"> ASCENDANCY</span>
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Galactic TCG</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                A new alien-themed trading card game. Conquer the galaxy, one card at a time.
              </p>
            </div>
            <FooterCol title="Game" links={["Factions", "Mechanics", "Card Types", "Win Conditions"]} />
            <FooterCol title="Universe" links={["The Convergence", "Lore Codex", "Commanders", "Galaxy Map"]} />
            <FooterCol title="Community" links={["Discord", "Tournaments", "Deck Builder", "Roadmap"]} />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© 2026 Astral Ascendancy. Built as a free-to-play cosmic card strategy game.</p>
            <p className="flex items-center gap-1.5">
              Crafted among the stars
              <span className="text-emerald-400">✦</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300/80">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      <p className="mt-3 text-base text-foreground/70">{subtitle}</p>
    </div>
  );
}

function LoreCard({ index, title, body, accent }: { index: string; title: string; body: string; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]">
      <span className="absolute right-4 top-3 text-5xl font-black opacity-10 transition group-hover:opacity-20" style={{ color: accent }}>{index}</span>
      <h3 className="text-lg font-bold" style={{ color: accent }}>{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">{body}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#top" className="text-sm text-foreground/70 transition-colors hover:text-emerald-300">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroCards() {
  const featured = SAMPLE_CARDS.slice(0, 3);
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.35), rgba(232,121,249,0.18), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-white/10 sm:h-[440px] sm:w-[440px]" />
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[210px] -translate-x-1/2 -translate-y-1/2 animate-float-slow">
        <GameCard card={featured[1]} />
      </div>
      <div className="absolute left-[2%] top-[18%] h-[250px] w-[185px] animate-float-slow" style={{ animationDelay: "1.2s", transform: "rotate(-9deg)" }}>
        <GameCard card={featured[0]} />
      </div>
      <div className="absolute right-[2%] top-[22%] h-[250px] w-[185px] animate-float-slow" style={{ animationDelay: "0.6s", transform: "rotate(9deg)" }}>
        <GameCard card={featured[2]} />
      </div>
      <div className="absolute bottom-[2%] left-[18%] h-[230px] w-[170px] animate-float-slow opacity-90" style={{ animationDelay: "1.8s", transform: "rotate(6deg)" }}>
        <GameCard card={SAMPLE_CARDS[5]} />
      </div>
      <div className="absolute bottom-[4%] right-[14%] h-[230px] w-[170px] animate-float-slow opacity-90" style={{ animationDelay: "2.4s", transform: "rotate(-6deg)" }}>
        <GameCard card={SAMPLE_CARDS[6]} />
      </div>
    </div>
  );
}
