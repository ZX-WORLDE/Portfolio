"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

const ITEMS = [
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Audition",
  "Photoshop",
  "Kinetic Captions",
  "Sound Design",
  "Color Grading",
];

/**
 * Tool marquee — one bold ember band between the hero and the work.
 * Loops seamlessly with anime.js (track holds two identical halves).
 */
export function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = trackRef.current;
    if (!track) return;

    const anim = animate(track, {
      x: ["0%", "-50%"],
      duration: 30000,
      ease: "linear",
      loop: true,
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-[#1a1a1a] bg-ember"
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <span key={`${half}-${item}`} className="flex items-center">
                <span className="px-7 py-3.5 font-display text-[13px] uppercase tracking-wide text-ink">
                  {item}
                </span>
                <span className="block h-1.5 w-1.5 rotate-45 bg-ink/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
