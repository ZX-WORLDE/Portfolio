"use client";

import { useEffect, useRef } from "react";
import { onScroll } from "animejs";

const BAR_COUNT = 64;

/** Deterministic pseudo-random waveform so SSR and client agree. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HEIGHTS: number[] = (() => {
  const rand = mulberry32(0xcafe);
  const out: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    /* Envelope: quieter at the tails, energetic in the middle */
    const env =
      0.35 +
      0.65 * Math.sin((Math.PI * (i + 0.5)) / BAR_COUNT) ** 0.7;
    const jitter = 0.55 + rand() * 0.45;
    out.push(Math.round(Math.min(100, env * jitter * 100)));
  }
  return out;
})();

function Bars({ played }: { played: boolean }) {
  return (
    <span className="absolute inset-0 flex items-center gap-[2px] px-1">
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%` }}
          className={`block min-w-[2px] flex-1 ${
            played ? "bg-ember" : "bg-[#1d1d1d]"
          }`}
        />
      ))}
    </span>
  );
}

/**
 * Audio-track divider — an A1 waveform that "plays back" in exact
 * proportion to how far it has scrolled through the viewport, with a
 * playhead riding the fill edge. Scrolls back = rewinds.
 */
export function Waveform({ label = "A1 — SOUND DESIGN / MIX" }: { label?: string }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fill = fillRef.current;
    const head = headRef.current;
    if (!fill) return;

    /* Park in the "unplayed" state (no-JS visitors see the full wave) */
    fill.style.clipPath = "inset(0 100% 0 0)";
    if (head) head.style.left = "0%";

    const so = onScroll({
      target: fill,
      enter: "bottom top",
      leave: "top bottom",
      sync: true,
      onUpdate: (self) => {
        const p = self.progress;
        fill.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
        if (head) head.style.left = `${p * 100}%`;
      },
    });

    return () => {
      so.revert();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-[#151515] bg-[#070707] py-5"
    >
      {/* Track label */}
      <span className="pointer-events-none absolute left-4 top-2 z-10 font-mono text-[8px] tracking-[0.26em] text-ash">
        {label}
      </span>
      <span className="pointer-events-none absolute right-4 top-2 z-10 font-mono text-[8px] tracking-[0.26em] text-[#4a4a4a]">
        48KHZ / 24BIT
      </span>

      {/* The wave */}
      <div className="relative mx-auto h-14 max-w-7xl sm:h-16">
        <Bars played={false} />
        <div ref={fillRef} className="absolute inset-0">
          <Bars played />
        </div>
        {/* Playhead */}
        <div
          ref={headRef}
          className="absolute inset-y-0 left-0 z-10 w-px bg-bone/70"
        >
          <span className="absolute -top-1 left-1/2 block h-1.5 w-1.5 -translate-x-1/2 bg-ember" />
        </div>
      </div>
    </div>
  );
}
