"use client";

import { useEffect } from "react";

const SW_VERSION = "v3.0.0";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const setup = async () => {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]";

      // Always unregister + clear caches on localhost
      if (process.env.NODE_ENV !== "production" || isLocalhost) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        return;
      }

      // Production: clear any old caches that don't match current version
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => !k.includes(SW_VERSION))
            .map((k) => caches.delete(k))
        );
      }

      // Register / update SW
      const reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });

      // Force immediate update if a new SW is waiting
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            newSW.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      // Reload page when new SW takes control
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Check for updates every hour
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    };

    setup().catch(() => {});
  }, []);

  return null;
}
