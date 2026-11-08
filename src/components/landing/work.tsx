"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";
import { ArrowUpRight } from "lucide-react";
import { VideoCard, type ReelCard } from "./video-card";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";
import { openBrief } from "./brief-dialog";

const REELS: ReelCard[] = [
  {
    src: "/videos/reel-2.mp4",
    poster: "/videos/poster-2.jpg",
    duration: "0:11",
    title: "Mindset Podcast — Clip Pack",
    tags: "Podcast clips · Kinetic captions",
    featured: true,
  },
  {
    src: "/videos/reel-1.mp4",
    poster: "/videos/poster-1.jpg",
    duration: "0:51",
    title: "UGC Ad Spot — Conversion Edit",
    tags: "UGC ad · Screen capture · CTA",
  },
  {
    src: "/videos/reel-3.mp4",
    poster: "/videos/poster-3.jpg",
    duration: "0:29",
    title: "Relationship Podcast — Cinematic Cut",
    tags: "Podcast · B-roll · Warm grade",
  },
];

export function Work({ cuts }: { cuts?: ReelCard[] }) {
  const reels = cuts && cuts.length > 0 ? cuts : REELS;
  const rootRef = useRef<HTMLElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  /* Desktop: each reel drifts at its own rate while the section
     travels through the viewport — proportional, never jumpy.
     The ruler playhead scrubs across the timeline in lock-step. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let headObserver: ReturnType<typeof onScroll> | undefined;

    const scope = createScope({
      root,
      mediaQueries: { desktop: "(min-width: 768px)" },
    }).add((self) => {
      const grid = root.querySelector<HTMLElement>("[data-reel-grid]");
      const playhead = playheadRef.current;

      if (!self?.matches.desktop || !grid) return;

      /* Ruler playhead rides the grid's transit through the viewport */
      if (playhead) {
        headObserver = onScroll({
          target: grid,
          enter: "bottom top",
          leave: "top bottom",
          sync: true,
          onUpdate: (so) => {
            playhead.style.left = `${so.progress * 100}%`;
          },
        });
      }

      const rates: Array<[string, number]> = [
        ['[data-drift="1"]', 26],
        ['[data-drift="2"]', 46],
        ['[data-drift="3"]', 12],
      ];
      rates.forEach(([selector, travel]) => {
        animate(selector, {
          translateY: [travel, -travel],
          ease: "linear",
          autoplay: onScroll({
            target: "[data-reel-grid]",
            enter: "bottom top",
            leave: "top bottom",
            sync: true,
          }),
        });
      });
    });

    return () => {
      headObserver?.revert();
      scope.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="work"
      className="scroll-mt-24 border-t border-line bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="01"
          label="Selected work"
          title={
            <>
              Recent cuts<span className="text-ember">.</span>
            </>
          }
          hint={
            <>
              {reels.length} reels from recent projects.
              <span className="hidden text-bone md:inline">
                {" "}
                Hover to preview, click for sound.
              </span>
              <span className="text-bone md:hidden"> Tap a reel to play.</span>
            </>
          }
        />

        {/* NLE timeline ruler (desktop) — the playhead scrubs with scroll */}
        <div className="mb-6 hidden md:block">
          <div className="flex items-stretch gap-2">
            {/* Track headers */}
            <div className="flex w-9 shrink-0 flex-col justify-between py-0.5">
              {["V1", "V2", "A1"].map((t) => (
                <span
                  key={t}
                  className={`flex h-3.5 items-center justify-center border font-mono text-[8px] tracking-[0.14em] ${
                    t === "A1"
                      ? "border-[#263026] bg-[#0c110c] text-[#7a8f7a]"
                      : "border-line bg-[#0a0a0a] text-ash"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            {/* Ruler */}
            <div className="relative h-12 flex-1 border border-line bg-[#0a0a0a]">
              {/* Ticks */}
              {Array.from({ length: 33 }).map((_, i) => {
                const major = i % 4 === 0;
                return (
                  <span
                    key={i}
                    style={{ left: `${(i / 32) * 100}%` }}
                    className={`absolute top-0 w-px ${
                      major ? "h-3 bg-[#333]" : "h-1.5 bg-[#222]"
                    }`}
                  />
                );
              })}
              {/* Timecode labels — 12s timeline, no collisions at the edges */}
              <span className="absolute left-2 top-1.5 font-mono text-[8px] tracking-[0.14em] text-[#8f8f8f]">
                00:00
              </span>
              {["00:03", "00:06", "00:09"].map((tc, i) => (
                <span
                  key={tc}
                  style={{ left: `${((i + 1) / 4) * 100}%` }}
                  className="absolute top-1.5 -translate-x-1/2 font-mono text-[8px] tracking-[0.14em] text-[#8f8f8f]"
                >
                  {tc}
                </span>
              ))}
              <span className="absolute right-2 top-1.5 font-mono text-[8px] tracking-[0.14em] text-[#8f8f8f]">
                00:12
              </span>
              {/* Playhead */}
              <div
                ref={playheadRef}
                className="absolute inset-y-0 left-0 z-10 w-px bg-ember"
              >
                <span
                  className="absolute -top-px left-1/2 block h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-ember"
                />
                <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 bg-ember" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: swipe carousel / Desktop: grid */}
        <p className="mb-4 font-mono text-[9px] tracking-[0.22em] text-ash md:hidden">
          SWIPE →
        </p>
        <div
          data-reel-grid
          className="dark-scroll -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:gap-8"
        >
          {reels.map((reel, i) => (
            <Reveal
              key={`${reel.src}-${i}`}
              y={34}
              delay={i * 110}
              className="min-w-[78vw] snap-center sm:min-w-[340px] md:min-w-0"
            >
              <div data-drift={String(i + 1)} className="will-change-transform">
                <VideoCard reel={reel} />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Foot */}
        <Reveal className="mt-12" y={18}>
          <div className="flex items-center justify-between gap-6 border-t border-line pt-6">
            <p className="text-sm text-ash">
              Full portfolio and references available on request.
            </p>
            <button
              type="button"
              onClick={openBrief}
              className="group hidden items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:text-ember sm:inline-flex"
            >
              Let&apos;s talk
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
