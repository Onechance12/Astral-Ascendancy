"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  baseAlpha: number;
  twPhase: number;
  twSpeed: number;
  hue: number;
};

type Shooting = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
};

const HUES = [165, 200, 280, 45, 320];

export default function Starfield({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let shooters: Shooting[] = [];
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(((w * h) / 6000) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: Math.random() * 0.02 + 0.004,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.twPhase += s.twSpeed * dt;
        const tw = (Math.sin(s.twPhase) + 1) / 2;
        const alpha = s.baseAlpha * (0.5 + tw * 0.6);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 90%, 75%, ${alpha})`;
        ctx.shadowBlur = 6 * s.z;
        ctx.shadowColor = `hsla(${s.hue}, 90%, 70%, ${alpha * 0.8})`;
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (Math.random() < 0.004 && shooters.length < 3) {
        const startX = Math.random() * w;
        const startY = Math.random() * h * 0.4;
        const ang = Math.PI / 5 + Math.random() * 0.3;
        const sp = 6 + Math.random() * 4;
        shooters.push({
          x: startX,
          y: startY,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: 60 + Math.random() * 30,
        });
      }

      shooters = shooters.filter((sh) => sh.life < sh.max);
      for (const sh of shooters) {
        sh.life += 1;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const t = sh.life / sh.max;
        const alpha = Math.sin(Math.PI * t);
        const grad = ctx.createLinearGradient(
          sh.x,
          sh.y,
          sh.x - sh.vx * 8,
          sh.y - sh.vy * 8
        );
        grad.addColorStop(0, `rgba(167,243,208,${alpha})`);
        grad.addColorStop(1, "rgba(167,243,208,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
