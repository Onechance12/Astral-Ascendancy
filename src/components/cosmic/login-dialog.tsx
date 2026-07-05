"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FACTIONS } from "@/lib/game-data";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginDialog() {
  const open = useGame((s) => s.loginOpen);
  const close = useGame((s) => s.closeLogin);
  const onAuthed = useGame((s) => s.onAuthed);

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commander, setCommander] = useState("");
  const [title, setTitle] = useState("");
  const [factionId, setFactionId] = useState("solari");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      commanderName: commander,
      title,
      factionId,
      mode,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      toast.error(mode === "signup" ? "Could not create account" : "Invalid email or password");
      return;
    }
    toast.success(mode === "signup" ? "Commander registered" : "Welcome back");
    onAuthed();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl sm:max-w-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl nebula-radial opacity-50"
        />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-emerald-300">✦</span>
            {mode === "signup" ? "Create your Commander" : "Welcome back, Commander"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Register to persist your stats, decks & match history across devices."
              : "Sign in to continue your conquest of the Cluster."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* mode toggle */}
          <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5 text-xs">
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-bold transition",
                mode === "signup" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60"
              )}
            >
              New Commander
            </button>
            <button
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-bold transition",
                mode === "signin" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60"
              )}
            >
              Sign In
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ld-email">Email</Label>
            <Input
              id="ld-email"
              type="email"
              placeholder="commander@cluster.gg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ld-pass">Password</Label>
            <Input
              id="ld-pass"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="bg-background/60"
            />
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ld-name">Commander name</Label>
                <Input
                  id="ld-name"
                  placeholder="e.g. Zharvox"
                  value={commander}
                  onChange={(e) => setCommander(e.target.value)}
                  className="bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ld-title">War title (optional)</Label>
                <Input
                  id="ld-title"
                  placeholder="Herald of Dawn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Starting faction</Label>
                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto scroll-cosmic pr-1">
                  {FACTIONS.map((f) => {
                    const sel = f.id === factionId;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFactionId(f.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all",
                          sel ? "border-white/25 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        )}
                        style={sel ? { boxShadow: `0 0 0 1px ${f.accent}66` } : undefined}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg"
                          style={{ background: f.accentSoft, color: f.accent }}
                        >
                          {f.glyph}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold" style={{ color: sel ? f.accent : undefined }}>
                            {f.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">{f.tagline}</p>
                        </div>
                        {sel && <span className="text-emerald-300">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={close} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={busy}
            className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
          >
            {busy ? "…" : mode === "signup" ? "Register & Enter →" : "Sign In →"}
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          {mode === "signup"
            ? "Your stats, decks & history persist across devices."
            : "Beta — credentials auth, no OAuth yet."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
