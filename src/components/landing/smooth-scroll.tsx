"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Inertial page scrolling — the weightless feel of animejs.com.
 * - Entirely skipped for visitors who prefer reduced motion.
 * - Overlays (mobile menu, dialogs) can freeze the page via the
 *   `cutroom:overlay-open` / `cutroom:overlay-close` window events.
 * - Anchor links glide and respect each section's `scroll-mt-*`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    window.__lenis = lenis;

    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("cutroom:overlay-open", stop);
    window.addEventListener("cutroom:overlay-close", start);

    return () => {
      window.removeEventListener("cutroom:overlay-open", stop);
      window.removeEventListener("cutroom:overlay-close", start);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
