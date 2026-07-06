"use client";

import { useEffect } from "react";

/**
 * Service workers are disabled during beta because stale cached game chunks can
 * keep old Pixi scenes alive after a deploy. This component cleans up older SWs.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches?.keys?.())
      .then((keys) => Promise.all((keys ?? []).filter((key) => key.startsWith("astral-")).map((key) => caches.delete(key))))
      .catch((err) => {
        console.warn("[Astral] SW cleanup failed:", err);
      });
  }, []);

  return null;
}
