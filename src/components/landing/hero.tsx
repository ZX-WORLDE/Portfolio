"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, createScope, createTimeline, onScroll, stagger } from "animejs";
import { ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import { CountUp } from "./count-up";
import { openBrief } from "./brief-dialog";

type Reel = { src: string; poster: string; label: string };

const STATS = [
  { value: 110, decimals: 0, suffix: "+", label: "Videos delivered" },
  { value: 25, decimals: 0, suffix: "+", label: "Happy creators" },
  { value: 6, decimals: 0, suffix: "+", label: "Years editing" },
  { value: 48, decimals: 0, suffix: "h", label: "Average turnaround" },
];

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MQ).matches;
}

export function Hero({ reel }: { reel?: Reel }) {
  const showreel: Reel = reel ?? {
    src: "/videos/reel-2.mp4",
    poster: "/videos/poster-2.jpg",
    label: "SHOWREEL — 2026",
  };
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  /* React doesn't always apply the muted property on first paint,
     which would block autoplay — set it imperatively too. */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  /* Play the reel while the hero is on screen (never for reduced motion). */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    /* Open on the strongest frame, not the white title card */
    const seekIn = () => {
      try {
        if (v.readyState >= 1 && v.currentTime < 0.1) v.currentTime = 8;
      } catch {
        /* metadata not ready — poster stays */
      }
    };
    v.addEventListener("loadeddata", seekIn, { once: true });
    seekIn();
    if (reduce) {
      v.pause();
      return () => v.removeEventListener("loadeddata", seekIn);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => {
      v.removeEventListener("loadeddata", seekIn);
      io.disconnect();
    };
  }, [reduce]);

  /* anime.js choreography — load timeline + scroll-scrubbed parallax. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("hero-fx");
      return;
    }

    const scope = createScope({ root }).add(() => {
      /* Entrance */
      const tl = createTimeline({ defaults: { ease: "out(3)" } });
      tl.add(
        "[data-fade='eyebrow']",
        { opacity: [0, 1], translateY: [16, 0], duration: 650 },
        90
      )
        .add(
          "[data-line] > span",
          {
            translateY: ["112%", "0%"],
            duration: 950,
            delay: stagger(90),
            ease: "out(4)",
          },
          320
        )
        .add(
          "[data-fade='lede']",
          { opacity: [0, 1], translateY: [18, 0], duration: 750 },
          960
        )
        .add(
          "[data-fade='cta']",
          { opacity: [0, 1], translateY: [18, 0], duration: 750 },
          1140
        )
        .add(
          "[data-fade='micro']",
          { opacity: [0, 1], duration: 600 },
          1500
        )
        .add(
          "[data-fade='frame']",
          { opacity: [0, 1], translateY: [36, 0], duration: 1000, ease: "out(4)" },
          620
        )
        .add(
          "[data-fade='stats']",
          { opacity: [0, 1], translateY: [24, 0], duration: 800 },
          1680
        );

      /* Proportional drift while the hero scrolls away */
      animate("[data-parallax='copy']", {
        translateY: [0, 44],
        ease: "linear",
        autoplay: onScroll({
          target: root,
          enter: "top top",
          leave: "bottom top",
          sync: true,
        }),
      });
      animate("[data-parallax='reel']", {
        translateY: [0, -56],
        ease: "linear",
        autoplay: onScroll({
          target: root,
          enter: "top top",
          leave: "bottom top",
          sync: true,
        }),
      });
      animate("[data-parallax='grid']", {
        translateY: [0, 90],
        ease: "linear",
        autoplay: onScroll({
          target: root,
          enter: "top top",
          leave: "bottom top",
          sync: true,
        }),
      });

      /* Scroll cue playhead */
      animate("[data-cue-bar]", {
        translateY: ["-120%", "120%"],
        duration: 1600,
        ease: "inOut(2)",
        loop: true,
        loopDelay: 320,
      });
    });

    return () => scope.revert();
  }, []);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) void v.play().catch(() => {});
  }

  return (
    <section
      ref={rootRef}
      id="top"
      className="hero-fx relative overflow-hidden bg-ink"
    >
      {/* Blueprint grid + soft glows */}
      <div
        aria-hidden
        data-parallax="grid"
        className="bg-grid-faint pointer-events-none absolute inset-0"
      />
      <div
        className="pointer-events-none absolute right-[-12%] top-[6%] h-[520px] w-[520px] rounded-full bg-ember/[0.07] blur-[160px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-12%] left-[-14%] h-[420px] w-[420px] rounded-full bg-[#c7c9cc]/[0.04] blur-[140px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="lg:col-span-7" data-parallax="copy">
            <p
              data-fade="eyebrow"
              className="flex items-center gap-3 font-condensed text-xs font-medium uppercase tracking-[0.28em] text-ash"
            >
              <span className="inline-block h-2 w-2 bg-ember" aria-hidden />
              Short-form video editor
              <span className="hidden sm:inline">
                {" "}
                · Reels / Shorts / Ads
              </span>
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.5rem,6.4vw,4.9rem)] uppercase leading-[0.98] tracking-tight text-bone">
              <span data-line>
                <span>Cuts that</span>
              </span>{" "}
              <span data-line>
                <span>keep people</span>
              </span>{" "}
              <span data-line>
                <span className="text-ember">watching.</span>
              </span>
            </h1>

            <p
              data-fade="lede"
              className="mt-6 max-w-lg text-[15px] leading-relaxed text-ash sm:text-base"
            >
              I turn podcasts, creators and brands into vertical video that
              holds attention — tight hooks, clean captions, zero dead air.
            </p>

            <div
              data-fade="cta"
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <button
                type="button"
                onClick={openBrief}
                className="group inline-flex w-full items-center justify-center gap-2.5 bg-ember px-7 py-3.5 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember-hot sm:w-auto"
              >
                Let&apos;s Talk
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#work"
                className="group inline-flex w-full items-center justify-center gap-2.5 border border-[#2e2e2e] px-7 py-3.5 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:border-ember hover:text-ember sm:w-auto"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch the work
              </a>
            </div>

            <p
              data-fade="micro"
              className="mt-6 font-condensed text-[11px] uppercase tracking-[0.24em] text-[#8f8f8f]"
            >
              Free trial cut · Reply within 24h · Worldwide
            </p>
          </div>

          {/* Showreel — reel-2 */}
          <div className="lg:col-span-5" data-fade="frame">
            <div data-parallax="reel" className="relative">
              {/* Viewer corner brackets */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-1.5 -top-1.5 z-10 block h-4 w-4 border-l-2 border-t-2 border-ember/60"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1.5 -top-1.5 z-10 block h-4 w-4 border-r-2 border-t-2 border-ember/60"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-10 block h-4 w-4 border-b-2 border-l-2 border-ember/60"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-10 block h-4 w-4 border-b-2 border-r-2 border-ember/60"
              />

              <div className="relative mx-auto aspect-[9/16] h-[54vh] max-h-[640px] sm:h-[62vh] lg:h-[68vh]">
                <div className="absolute inset-0 border border-[#262626] bg-panel p-1.5">
                  <div className="relative h-full w-full overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover"
                      src={showreel.src}
                      poster={showreel.poster}
                      muted={muted}
                      loop
                      playsInline
                      preload="auto"
                      aria-label="Showreel — featured cuts"
                    />
                    <span className="pointer-events-none absolute left-3 top-3 border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] text-bone backdrop-blur-sm">
                      {showreel.label}
                    </span>
                    <button
                      type="button"
                      onClick={toggleSound}
                      aria-label={muted ? "Unmute showreel" : "Mute showreel"}
                      className="absolute bottom-3 right-3 flex items-center gap-2 border border-white/10 bg-black/55 px-2.5 py-2 font-mono text-[9px] tracking-[0.18em] text-bone backdrop-blur-sm transition-colors hover:border-ember hover:text-ember"
                    >
                      {muted ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                      {muted ? "SOUND OFF" : "SOUND ON"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          data-fade="stats"
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-10 sm:gap-x-12 md:mt-20 lg:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl text-bone sm:text-4xl">
                <CountUp
                  to={s.value}
                  decimals={s.decimals}
                  suffix={s.suffix}
                />
              </p>
              <p className="mt-2 font-condensed text-[11px] uppercase tracking-[0.24em] text-ash">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-5 hidden flex-col items-center gap-2.5 lg:flex"
      >
        <span className="relative block h-10 w-px overflow-hidden bg-[#1f1f1f]">
          <span
            data-cue-bar
            className="absolute left-0 top-0 block h-3 w-px bg-ember"
          />
        </span>
        <span className="font-mono text-[9px] tracking-[0.3em] text-[#8f8f8f]">
          SCROLL
        </span>
      </div>
    </section>
  );
}
