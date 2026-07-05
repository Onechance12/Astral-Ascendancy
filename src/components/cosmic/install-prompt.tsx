"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "astral-install-dismissed";

/**
 * Shows an "Install App" banner when the browser fires beforeinstallprompt
 * (Chrome/Edge/Android). Hidden on iOS (no PWA install prompt API) and after
 * the user dismisses it once per session.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // respect prior dismissal
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "dismissed") {
        try {
          sessionStorage.setItem(DISMISS_KEY, "1");
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    } finally {
      setVisible(false);
      setDeferred(null);
    }
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-xl">
          📲
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Install Astral Ascendancy</p>
          <p className="text-[11px] text-muted-foreground">
            Play full-screen, offline, right from your home screen.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <Button
            size="sm"
            onClick={install}
            className="h-8 bg-emerald-400 px-3 text-xs font-bold text-emerald-950 hover:bg-emerald-300"
          >
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={dismiss}
            className="h-8 px-2 text-xs text-muted-foreground"
            aria-label="Dismiss install prompt"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
