"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";

const SEGMENTS = [
  "BEHIND THE CUT",
  "REEL 2026",
  "24 FPS",
  "2.39:1",
  "COLOR / SOUND",
  "DELIVERY 48H",
  "MADE FOR VERTICAL",
];

/** One repeated frame of the strip: perforations + a mono caption. */
function StripHalf({ offset }: { offset: number }) {
  return (
    <div className="flex shrink-0">
      {SEGMENTS.map((text, i) => (
        <span
          key={`${offset}-${text}`}
          className="flex w-44 flex-col items-stretch gap-[7px] border-r border-[#202020] px-4 py-2.5 sm:w-52"
        >
          {/* Top perforation row */}
          <span className="flex justify-between">
            {Array.from({ length: 5 }).map((_, h) => (
              <span
                key={`t-${h}`}
                className="block h-[7px] w-[13px] rounded-[2px] bg-[#2e2e2e]"
              />
            ))}
          </span>
          {/* Caption */}
          <span className="text-center font-mono text-[8px] leading-none tracking-[0.3em] text-[#8a8a8a]">
            {text}
          </span>
          {/* Bottom perforation row */}
          <span className="flex justify-between">
            {Array.from({ length: 5 }).map((_, h) => (
              <span
                key={`b-${h}`}
                className="block h-[7px] w-[13px] rounded-[2px] bg-[#2e2e2e]"
              />
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Film-strip divider — the page literally advances like film while
 * this strip travels through the viewport (scroll-scrubbed drift,
 * perfectly proportional, reverses when you scroll back up).
 */
export function FilmStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = trackRef.current;
    if (!track) return;

    const anim = animate(track, {
      x: ["0%", "-8%"],
      ease: "linear",
      autoplay: onScroll({
        target: track,
        enter: "bottom top",
        leave: "top bottom",
        sync: true,
      }),
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="mask-strip relative overflow-hidden border-y border-[#151515] bg-[#070707] py-1"
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        <StripHalf offset={0} />
        <StripHalf offset={1} />
      </div>
    </div>
  );
}
