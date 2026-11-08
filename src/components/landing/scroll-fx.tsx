"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";

function formatTimecode(progress: number) {
  const fps = 24;
  const totalFrames = Math.max(0, Math.round(progress * 150 * fps)); // "2.5-minute timeline"
  const ff = totalFrames % fps;
  const ss = Math.floor(totalFrames / fps) % 60;
  const mm = Math.floor(totalFrames / (fps * 60)) % 60;
  const hh = Math.floor(totalFrames / (fps * 3600));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/**
 * Persistent scroll HUD, all of it scrubbed proportionally to the page:
 * - ember progress line pinned along the top edge
 * - timecode readout that ticks like a playhead (desktop)
 * - side hairlines framing the layout like a safe-area margin (desktop)
 */
export function ScrollFx() {
  const barRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bar = barRef.current;
    const tc = tcRef.current;
    if (!bar) return;

    const barAnim = animate(bar, {
      scaleX: [0, 1],
      ease: "linear",
      autoplay: onScroll({
        target: document.body,
        enter: "top top",
        leave: "bottom bottom",
        sync: true,
      }),
    });

    let tcObserver: ReturnType<typeof onScroll> | undefined;
    if (tc) {
      tcObserver = onScroll({
        target: document.body,
        enter: "top top",
        leave: "bottom bottom",
        sync: true,
        onUpdate: (self) => {
          tc.textContent = formatTimecode(self.progress);
        },
      });
    }

    return () => {
      barAnim.revert();
      tcObserver?.revert();
    };
  }, []);

  return (
    <>
      {/* Progress line */}
      <div
        ref={barRef}
        aria-hidden
        style={{ transform: "scaleX(0)" }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-ember"
      />

      {/* Side hairline (right edge; the left edge belongs to the section rail) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-8 right-5 hidden w-px bg-[#171717] xl:block"
      />

      {/* Timecode readout */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-4 right-6 z-40 hidden items-center gap-2.5 border border-line bg-[#0a0a0a]/85 px-3 py-2 backdrop-blur-sm md:flex"
      >
        <span className="block h-1.5 w-1.5 bg-ember" />
        <span className="font-mono text-[10px] tracking-[0.18em] text-ash">
          TC{" "}
          <span ref={tcRef} className="text-steel">
            00:00:00:00
          </span>
        </span>
      </div>
    </>
  );
}
