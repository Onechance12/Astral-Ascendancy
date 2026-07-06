"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useGame } from "@/store/game-store";

const LINKS = [
  { href: "#world", label: "World" },
  { href: "#factions", label: "Factions" },
  { href: "#mechanics", label: "Mechanics" },
  { href: "#cards", label: "Cards" },
  { href: "#vision", label: "Vision" },
];

export default function SiteHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const commander = useGame((s) => s.commander);
  const openLogin = useGame((s) => s.openLogin);

  const onPlay = () => (commander ? router.push("/play") : openLogin());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "pt-[env(safe-area-inset-top)]",
        scrolled
          ? "border-b border-white/10 bg-background/90 backdrop-blur-xl"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
        {/* Logo — compact on mobile */}
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
            <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-emerald-400/40" />
            <span className="text-base font-black text-emerald-300 sm:text-lg">✦</span>
          </span>
          <div className="leading-none">
            <p className="text-xs font-extrabold tracking-tight sm:text-sm">
              ASTRAL<span className="text-emerald-300"> ASCENDANCY</span>
            </p>
            <p className="hidden text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
              Galactic TCG
            </p>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side: Play button (always visible) + hamburger (mobile only) */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onPlay}
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.4)] transition hover:bg-emerald-300 active:scale-95"
          >
            {commander ? "Enter" : "Play"}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xl transition hover:bg-white/10 active:scale-95 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
