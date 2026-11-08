"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";

export type ReelCard = {
  src: string;
  poster: string;
  duration: string;
  title: string;
  tags: string;
  featured?: boolean;
};

/**
 * Vertical (9:16) reel card.
 * - Poster-first: nothing loads until the visitor shows intent.
 * - Hover (mouse only) plays a muted preview loop.
 * - Click engages the player with sound and native controls.
 * - Anything that scrolls out of view pauses and resets.
 */
export function VideoCard({ reel }: { reel: ReelCard }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [engaged, setEngaged] = useState(false);
  const [hovering, setHovering] = useState(false);

  /* Playback scrub bar — direct DOM writes, no re-renders. */
  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    const fill = fillRef.current;
    if (!fill || !v.duration || Number.isNaN(v.duration)) return;
    fill.style.width = `${(v.currentTime / v.duration) * 100}%`;
  }

  const reset = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* not yet loaded — nothing to reset */
    }
    if (fillRef.current) fillRef.current.style.width = "0%";
  }, []);

  const disengage = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.controls = false;
    v.muted = true;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* ignore */
    }
    setEngaged(false);
    setHovering(false);
    if (fillRef.current) fillRef.current.style.width = "0%";
  }, []);

  /* Pause whenever the card leaves the viewport. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (engaged) disengage();
          else reset();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [engaged, disengage, reset]);

  function handleEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch taps go to the button
    const v = videoRef.current;
    if (!v || engaged) return;
    v.muted = true;
    void v.play().catch(() => {});
    setHovering(true);
  }

  function handleLeave() {
    if (engaged) return;
    reset();
    setHovering(false);
  }

  function engage() {
    const v = videoRef.current;
    if (!v) return;
    v.controls = true;
    v.muted = false;
    void v.play().catch(() => {});
    setEngaged(true);
    setHovering(false);
  }

  return (
    <figure className="group">
        <div
          className="relative aspect-[9/16] overflow-hidden border border-[#232323] bg-panel"
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
        >
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            className="absolute inset-0 h-full w-full object-cover"
            src={reel.src}
            poster={reel.poster}
            preload="none"
            muted
            loop
            playsInline
            aria-label={reel.title}
          />

          {/* Playback scrub bar (hidden while native controls are engaged) */}
          {!engaged && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 block h-[3px] bg-white/10"
            >
              <span
                ref={fillRef}
                className="block h-full w-0 bg-ember transition-[width] duration-150 ease-linear"
              />
            </span>
          )}

          {!engaged && (
            <button
              type="button"
              onClick={engage}
              aria-label={`Play ${reel.title} with sound`}
              className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
                  hovering
                    ? "scale-105 border-ember bg-ember/15"
                    : "border-white/25 bg-black/45"
                }`}
              >
                <Play
                  className={`h-5 w-5 fill-current transition-colors ${
                    hovering ? "text-ember" : "text-bone"
                  }`}
                />
              </span>
            </button>
          )}

          {reel.featured && (
            <span className="pointer-events-none absolute left-3 top-3 bg-ember px-2 py-1 font-mono text-[9px] font-bold tracking-[0.2em] text-ink">
              FEATURED
            </span>
          )}

          <span className="pointer-events-none absolute bottom-3 left-3 border border-white/10 bg-black/55 px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-bone backdrop-blur-sm">
            {reel.duration}
          </span>

          {engaged && (
            <button
              type="button"
              onClick={disengage}
              aria-label="Close player"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-white/15 bg-black/60 text-bone backdrop-blur-sm transition-colors hover:border-ember hover:text-ember"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <figcaption className="mt-4">
          <p className="text-[15px] font-semibold text-bone">{reel.title}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ash">
            {reel.tags}
          </p>
        </figcaption>
      </figure>
    );
}
