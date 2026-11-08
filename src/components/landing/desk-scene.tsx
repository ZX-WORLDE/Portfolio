"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, stagger } from "animejs";

/* Deterministic waveform heights for the A1 track (SSR-stable). */
const BAR_H = [
  34, 58, 42, 70, 52, 88, 64, 96, 74, 100, 82, 92, 60, 78, 94, 66, 84, 50, 72,
  90, 58, 76, 98, 62, 86, 54, 80, 46, 68, 92, 56, 74, 40, 30,
];

/* V2 clips on the monitor's timeline. */
const CLIPS_V2 = [
  { x: 472, w: 64, f: "#20242a", inner: "#2c323b" },
  { x: 560, w: 96, f: "#262b33", inner: "#343b45" },
  { x: 680, w: 74, f: "#20242a", inner: "#2c323b" },
  { x: 762, w: 88, f: "#262b33", inner: "#343b45" },
];
/* V1 clips — one selected (ember). */
const CLIPS_V1 = [
  { x: 456, w: 58, f: "#242930", inner: "#333a44" },
  { x: 520, w: 70, f: "#2b313a", inner: "#3a424d" },
  { x: 596, w: 92, f: "#ff5c00", inner: "#ffb27a" },
  { x: 694, w: 64, f: "#242930", inner: "#333a44" },
  { x: 764, w: 86, f: "#2b313a", inner: "#3a424d" },
];

const METER_ON = "#ff5c00";
const METER_OFF = "#22262c";
const METER_TH = [0.5, 0.68, 0.86];
const LED_OFF = "#22262c";

function fmtTC(progress: number) {
  const frames = Math.max(0, Math.round(progress * 12 * 24)); // 12s @ 24fps
  const ff = frames % 24;
  const ss = Math.floor(frames / 24) % 60;
  const mm = Math.floor(frames / (24 * 60));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/* Linear 0→1 ramp between scroll positions a and b. */
function seg(p: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/**
 * THE DESK — a fully vector edit-suite scene (no photography).
 * Everything is driven by the scroll transit, proportionally and reversibly:
 * parallax walls, a scrubbed timeline playhead, a program monitor that plays
 * three scenes as you scroll, clips that assemble, a waveform that grows,
 * dust drifting in the screen light and meters that ride progress.
 */
export function DeskScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<HTMLSpanElement>(null);
  const tcRef = useRef<SVGTextElement>(null);
  const ptcRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let readout: ReturnType<typeof onScroll> | undefined;

    const scope = createScope({ root }).add(() => {
      const scrub = () =>
        onScroll({
          target: root,
          enter: "bottom top",
          leave: "top bottom",
          sync: true,
        });

      /* Depth — background, light and foreground drift at their own rates */
      animate("[data-layer='bg']", {
        translateY: [26, -26],
        ease: "linear",
        autoplay: scrub(),
      });
      animate("[data-layer='light']", {
        translateY: [14, -14],
        ease: "linear",
        autoplay: scrub(),
      });
      animate("[data-layer='fg']", {
        translateY: [8, -8],
        ease: "linear",
        autoplay: scrub(),
      });

      /* The star: playhead sweeps the on-screen timeline in lock-step */
      animate("[data-playhead]", {
        translateX: [0, 400],
        ease: "linear",
        autoplay: scrub(),
      });

      /* Assembly — clips land, waveform grows, screen lights up */
      animate("[data-clip]", {
        opacity: [0, 1],
        translateX: [-16, 0],
        duration: 380,
        delay: stagger(52, { start: 120 }),
        ease: "out(3)",
        autoplay: scrub(),
      });
      animate("[data-bar]", {
        scaleY: [0, 1],
        duration: 300,
        delay: stagger(16, { start: 240 }),
        ease: "out(3)",
        autoplay: scrub(),
      });
      animate("[data-glow]", {
        opacity: [0, 0.6],
        duration: 420,
        autoplay: scrub(),
      });
      animate("[data-binrow]", {
        opacity: [0, 1],
        duration: 300,
        delay: stagger(70, { start: 200 }),
        ease: "out(3)",
        autoplay: scrub(),
      });
      /* Screen powers on as the scene scrolls in */
      animate("[data-boot]", {
        opacity: [0.96, 0],
        ease: "out(2.5)",
        autoplay: scrub(),
      });

      /* Life — the plant sways */
      animate("[data-plant]", {
        rotate: [-2.6, 2.6],
        ease: "linear",
        autoplay: scrub(),
      });

      /* HUD — REC dot blinks, dust drifts */
      if (recRef.current) {
        animate(recRef.current, {
          opacity: [1, 0.15],
          duration: 900,
          direction: "alternate",
          loop: true,
          ease: "inOut(2)",
        });
      }
      animate("[data-mote]", {
        translateY: [-7, 7],
        duration: 3400,
        direction: "alternate",
        loop: true,
        delay: stagger(260),
        ease: "inOut(2)",
      });

      /* Readouts — timecodes, meters, program scenes */
      const meters = [
        ...root.querySelectorAll<SVGRectElement>("[data-meter]"),
      ];
      const pmeters = [
        ...root.querySelectorAll<SVGRectElement>("[data-pmeter]"),
      ];
      const scenes = [
        ...root.querySelectorAll<SVGGElement>("[data-scene]"),
      ];
      readout = onScroll({
        target: root,
        enter: "bottom top",
        leave: "top bottom",
        sync: true,
        onUpdate: (self) => {
          const p = self.progress;
          const tc = fmtTC(p);
          if (tcRef.current) tcRef.current.textContent = tc;
          if (ptcRef.current) ptcRef.current.textContent = tc;
          meters.forEach((m, i) => {
            m.style.fill = p > METER_TH[i] ? METER_ON : METER_OFF;
          });
          const lit = Math.round(p * pmeters.length);
          pmeters.forEach((m, i) => {
            m.style.fill = i < lit ? METER_ON : LED_OFF;
          });
          /* Program monitor: three scenes crossfade with the scrub */
          const vis = [
            1 - seg(p, 0.24, 0.34),
            seg(p, 0.28, 0.38) * (1 - seg(p, 0.54, 0.62)),
            seg(p, 0.6, 0.68),
          ];
          scenes.forEach((el, i) => {
            el.style.opacity = String(vis[i]);
          });
        },
      });
    });

    return () => {
      readout?.revert();
      scope.revert();
    };
  }, []);

  return (
    <figure data-figure>
      <div className="relative">
        {/* Viewer corner brackets — the site's frame motif */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-1.5 -top-1.5 z-20 block h-4 w-4 border-l-2 border-t-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 block h-4 w-4 border-r-2 border-t-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 block h-4 w-4 border-b-2 border-l-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 block h-4 w-4 border-b-2 border-r-2 border-ember/60"
        />

        <div
          ref={rootRef}
          className="relative aspect-[1.8/1] overflow-hidden border border-[#232323] bg-[#0a0b0d] sm:aspect-[2.2/1]"
        >
          <svg
            viewBox="0 0 1320 600"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="Vector illustration of the editor's desk: an ultrawide monitor running a professional editing timeline, paired studio speakers, a workstation tower and a plant, all lit by the screen's glow"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1f2227" />
                <stop offset="1" stopColor="#0c0d0f" />
              </linearGradient>
              <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0d0e10" />
                <stop offset="1" stopColor="#070809" />
              </linearGradient>
              <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5e422a" />
                <stop offset="1" stopColor="#382612" />
              </linearGradient>
              <linearGradient id="scrG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#11141b" />
                <stop offset="1" stopColor="#0a0c0f" />
              </linearGradient>
              <radialGradient id="coolG" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#8fa2c4" stopOpacity="0.17" />
                <stop offset="1" stopColor="#8fa2c4" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="scnAG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a3c58" />
                <stop offset="1" stopColor="#0e1420" />
              </linearGradient>
              <linearGradient id="scnBG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a3140" />
                <stop offset="1" stopColor="#10131a" />
              </linearGradient>
              <linearGradient id="scnCG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#40200a" />
                <stop offset="1" stopColor="#140b06" />
              </linearGradient>
              <radialGradient id="vigG" cx="0.5" cy="0.46" r="0.72">
                <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
                <stop offset="1" stopColor="#000000" stopOpacity="0.42" />
              </radialGradient>
              <linearGradient id="phG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ff5c00" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ff5c00" stopOpacity="0.3" />
                <stop offset="1" stopColor="#ff5c00" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* ============ BACKGROUND (parallax layer) ============ */}
            <g data-layer="bg" className="will-change-transform">
              {/* Wall — drawn oversized so the parallax never shows an edge */}
              <rect x="-40" y="-80" width="1400" height="760" fill="url(#wallG)" />
              {/* Slanted attic ceiling, top-left */}
              <line
                x1="0"
                y1="64"
                x2="300"
                y2="8"
                stroke="#20242a"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1="0"
                y1="84"
                x2="260"
                y2="40"
                stroke="#171a1f"
                strokeWidth="1"
              />
              {/* Faint wall panel seams */}
              <line x1="140" y1="70" x2="140" y2="494" stroke="#14171b" strokeWidth="1" opacity="0.55" />
              <line x1="952" y1="70" x2="952" y2="494" stroke="#14171b" strokeWidth="1" opacity="0.55" />

              {/* Baseboard */}
              <rect x="-40" y="494" width="1400" height="10" fill="#121316" />
              <rect x="-40" y="494" width="1400" height="1.5" fill="#1f2227" />
            </g>

            {/* ============ FOREGROUND (parallax layer) ============ */}
            <g data-layer="fg" className="will-change-transform">
              {/* Floor */}
              <rect x="-40" y="508" width="1400" height="172" fill="url(#floorG)" />
              <line
                x1="-40"
                y1="508"
                x2="1360"
                y2="508"
                stroke="#1e2023"
                strokeWidth="1"
              />
              <rect x="-40" y="502" width="1400" height="6" fill="#101114" />

              {/* Screen glow reflected on the floor */}
              <ellipse cx="640" cy="534" rx="300" ry="15" fill="url(#coolG)" opacity="0.5" />
              <ellipse cx="640" cy="530" rx="200" ry="9" fill="#8fa2c4" opacity="0.035" />

              {/* Contact shadows */}
              <ellipse cx="640" cy="512" rx="340" ry="12" fill="#000" opacity="0.4" />
              <ellipse cx="205" cy="512" rx="50" ry="8" fill="#000" opacity="0.4" />
              <ellipse cx="980" cy="512" rx="44" ry="7" fill="#000" opacity="0.4" />

              {/* Desk — live-edge slab on metal legs */}
              <rect x="250" y="400" width="760" height="24" rx="2" fill="url(#woodG)" />
              <line
                x1="252"
                y1="401"
                x2="1008"
                y2="401"
                stroke="#7a5a3a"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <path
                d="M260 410 C 400 406, 700 414, 1000 408"
                stroke="#61452c"
                strokeWidth="1"
                fill="none"
                opacity="0.35"
              />
              <path
                d="M262 417 C 500 421, 760 413, 998 418"
                stroke="#61452c"
                strokeWidth="1"
                fill="none"
                opacity="0.25"
              />
              <ellipse
                cx="720"
                cy="412"
                rx="7"
                ry="2.5"
                fill="none"
                stroke="#6b4a2f"
                strokeWidth="1"
                opacity="0.3"
              />
              <rect x="300" y="426" width="14" height="90" fill="#1c1e21" />
              <rect x="940" y="426" width="14" height="90" fill="#1c1e21" />
              <rect x="298" y="510" width="18" height="6" rx="1" fill="#14161a" />
              <rect x="938" y="510" width="18" height="6" rx="1" fill="#14161a" />

              {/* Screen light spilling onto the desk */}
              <ellipse cx="640" cy="403" rx="210" ry="5" fill="#8fa2c4" opacity="0.06" />
              <ellipse cx="640" cy="404" rx="190" ry="6" fill="#ff5c00" opacity="0.05" />
              <ellipse cx="360" cy="404" rx="120" ry="5" fill="#8fa2c4" opacity="0.045" />

              {/* Monitor riser */}
              <rect
                x="420"
                y="368"
                width="440"
                height="32"
                rx="2"
                fill="#141519"
                stroke="#22252a"
              />
              <line
                x1="422"
                y1="369"
                x2="858"
                y2="369"
                stroke="#2b3037"
                strokeWidth="1"
                opacity="0.7"
              />

              {/* Screen glow behind the monitor */}
              <ellipse
                data-glow
                cx="640"
                cy="246"
                rx="290"
                ry="125"
                fill="url(#coolG)"
                style={{ opacity: 0.6 }}
              />

              {/* ---- Ultrawide monitor ---- */}
              <rect x="626" y="326" width="28" height="36" fill="#15171b" />
              <rect x="576" y="362" width="128" height="8" rx="3" fill="#1a1c21" />
              <rect
                x="404"
                y="164"
                width="472"
                height="162"
                rx="10"
                fill="#0b0c0e"
                stroke="#23262a"
                strokeWidth="2"
              />

              {/* ---- Screen: full NLE layout ---- */}
              <rect x="412" y="172" width="456" height="146" fill="url(#scrG)" />
              {/* App chrome */}
              <rect x="412" y="172" width="456" height="11" fill="#12151a" />
              {[422, 431, 440].map((x, i) => (
                <circle key={`dot-${x}`} cx={x} cy="177.5" r="2.2" fill={i === 0 ? "#3a3e44" : "#2a2d31"} />
              ))}
              <text
                x="640"
                y="180.5"
                textAnchor="middle"
                fill="#4c545e"
                style={{
                  fontFamily: "var(--font-jet-mono), monospace",
                  fontSize: "6.5px",
                  letterSpacing: "0.2em",
                }}
              >
                VOSS_CUT_03_FINAL
              </text>
              <text
                ref={tcRef}
                x="858"
                y="181"
                textAnchor="end"
                fill="#b8bfc7"
                style={{
                  fontFamily: "var(--font-jet-mono), monospace",
                  fontSize: "8.5px",
                  letterSpacing: "0.06em",
                }}
              >
                00:00:00
              </text>
              <line x1="412" y1="183" x2="868" y2="183" stroke="#1c2027" strokeWidth="1" />

              {/* Program monitor */}
              <rect x="418" y="190" width="152" height="62" fill="#0a0c10" stroke="#1c2027" />
              <rect x="418" y="190" width="152" height="4" fill="#05060a" />
              <rect x="418" y="248" width="152" height="4" fill="#05060a" />
              {/* Scene A — establishing wide */}
              <g data-scene>
                <rect x="418" y="194" width="152" height="54" fill="url(#scnAG)" />
                <circle cx="470" cy="214" r="8" fill="#d9e2ee" opacity="0.8" />
                <path d="M418 248 L452 220 L486 248 Z" fill="#0e1420" />
                <path d="M462 248 L510 210 L558 248 Z" fill="#101826" />
                <path d="M536 248 L570 226 L570 248 Z" fill="#0d1320" />
              </g>
              {/* Scene B — silhouette with ember rim light */}
              <g data-scene opacity="0">
                <rect x="418" y="194" width="152" height="54" fill="url(#scnBG)" />
                <ellipse cx="494" cy="226" rx="38" ry="28" fill="#8fa2c4" opacity="0.1" />
                <polygon points="418,194 460,194 440,248 418,248" fill="#8fa2c4" opacity="0.14" />
                <rect x="474" y="206" width="44" height="42" rx="2" fill="#06070a" />
                <line x1="518" y1="210" x2="518" y2="244" stroke="#ff5c00" strokeWidth="2.5" opacity="0.9" />
                <line x1="474" y1="212" x2="474" y2="226" stroke="#8fa2c4" strokeWidth="1.5" opacity="0.35" />
              </g>
              {/* Scene C — ember-lit portrait */}
              <g data-scene opacity="0">
                <rect x="418" y="194" width="152" height="54" fill="url(#scnCG)" />
                <circle cx="492" cy="218" r="10" fill="#06070a" />
                <path d="M468 248 C 472 232, 512 232, 516 248 Z" fill="#06070a" />
                <path d="M501 210 A10 10 0 0 1 501 226" stroke="#ff5c00" strokeWidth="2" fill="none" opacity="0.9" />
              </g>
              {/* Viewer marks + burn-in timecode */}
              <g stroke="#f4f4f2" strokeWidth="1" opacity="0.3" fill="none">
                <path d="M421 198 L421 193 L426 193" />
                <path d="M567 193 L567 198 L562 198" />
                <path d="M421 244 L421 249 L426 249" />
                <path d="M567 249 L567 244 L562 244" />
              </g>
              <circle cx="427" cy="201" r="2" fill="#ff5c00" opacity="0.9" />
              <text
                ref={ptcRef}
                x="566"
                y="245"
                textAnchor="end"
                fill="#f4f4f2"
                opacity="0.85"
                style={{
                  fontFamily: "var(--font-jet-mono), monospace",
                  fontSize: "6.5px",
                  letterSpacing: "0.08em",
                }}
              >
                00:00:00
              </text>

              {/* Audio meter column */}
              <rect x="576" y="190" width="24" height="62" fill="#0b0e12" stroke="#191d22" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={`pm-${i}`}
                  data-pmeter
                  x="582"
                  y={196 + i * 9.5}
                  width="12"
                  height="5"
                  rx="1"
                  fill={METER_OFF}
                />
              ))}

              {/* Bins / takes panel */}
              <rect x="606" y="190" width="256" height="62" fill="#0d1015" stroke="#191d22" />
              <text
                x="614"
                y="201"
                fill="#566070"
                style={{
                  fontFamily: "var(--font-jet-mono), monospace",
                  fontSize: "6px",
                  letterSpacing: "0.18em",
                }}
              >
                BINS — TAKES 01-04
              </text>
              {[0, 1, 2, 3].map((i) => {
                const y = 208 + i * 11;
                const sel = i === 1;
                return (
                  <g key={`bin-${i}`} data-binrow>
                    <rect x="614" y={y} width="18" height="8" fill="#1a1f27" stroke={sel ? "#ff5c00" : "#232830"} strokeWidth="1" />
                    <rect x="616" y={y + 2} width="14" height="4" fill="#232936" opacity="0.6" />
                    <rect x="638" y={y + 2.5} width="90" height="2" fill={sel ? "#ff5c00" : "#23262c"} opacity={sel ? 0.5 : 1} />
                    <rect x="638" y={y + 6} width="60" height="2" fill="#1b1f26" />
                  </g>
                );
              })}

              {/* Timeline panel */}
              <rect x="412" y="258" width="456" height="60" fill="#0e1116" />
              <line x1="412" y1="258" x2="868" y2="258" stroke="#1c2027" strokeWidth="1" />
              {/* Ruler */}
              {Array.from({ length: 37 }).map((_, i) => {
                const major = i % 4 === 0;
                return (
                  <line
                    key={`tick-${i}`}
                    x1={416 + i * 12}
                    y1="262"
                    x2={416 + i * 12}
                    y2={major ? 268 : 265.5}
                    stroke={major ? "#3a4149" : "#262b31"}
                    strokeWidth="1"
                  />
                );
              })}
              <line x1="412" y1="271" x2="868" y2="271" stroke="#1a1e24" strokeWidth="1" />
              {/* Track headers */}
              <line x1="452" y1="258" x2="452" y2="318" stroke="#1c2027" strokeWidth="1" />
              {[
                { t: "V2", y: 280 },
                { t: "V1", y: 294 },
                { t: "A1", y: 309 },
              ].map((r) => (
                <text
                  key={r.t}
                  x="432"
                  y={r.y}
                  textAnchor="middle"
                  fill="#4c545e"
                  style={{
                    fontFamily: "var(--font-jet-mono), monospace",
                    fontSize: "6px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {r.t}
                </text>
              ))}
              {/* V2 clips */}
              {CLIPS_V2.map((c) => (
                <g key={`v2-${c.x}`}>
                  <rect data-clip x={c.x} y="273" width={c.w} height="11" rx="2" fill={c.f} />
                  <rect x={c.x + 3} y="275" width={Math.max(6, c.w - 6)} height="7" rx="1" fill={c.inner} opacity="0.5" />
                </g>
              ))}
              {/* V1 clips */}
              {CLIPS_V1.map((c) => (
                <g key={`v1-${c.x}`}>
                  <rect
                    data-clip
                    x={c.x}
                    y="287"
                    width={c.w}
                    height="13"
                    rx="2"
                    fill={c.f}
                    opacity={c.f === "#ff5c00" ? 0.92 : 1}
                  />
                  <rect
                    x={c.x + 3}
                    y="289.5"
                    width={Math.max(6, c.w - 6)}
                    height="8"
                    rx="1"
                    fill={c.inner}
                    opacity={c.f === "#ff5c00" ? 0.4 : 0.5}
                  />
                </g>
              ))}
              {/* A1 waveform track */}
              <rect x="456" y="302" width="406" height="14" fill="#101318" />
              {BAR_H.map((h, i) => {
                const bh = 2.5 + h * 0.09;
                return (
                  <rect
                    key={`bar-${i}`}
                    data-bar
                    x={460 + i * 11.9}
                    y={309 - bh / 2}
                    width="3.5"
                    height={bh}
                    rx="1.5"
                    fill="#ff5c00"
                    opacity="0.6"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "50% 50%",
                    }}
                  />
                );
              })}
              {/* Playhead */}
              <g data-playhead className="will-change-transform">
                <rect x="446" y="262" width="20" height="56" fill="url(#phG)" />
                <line
                  x1="456"
                  y1="262"
                  x2="456"
                  y2="318"
                  stroke="#ff5c00"
                  strokeWidth="1.5"
                />
                <polygon points="450,258 462,258 456,266" fill="#ff5c00" />
              </g>

              {/* Screen inner border + power LED */}
              <rect x="412" y="172" width="456" height="146" fill="none" stroke="#1c2027" />
              <circle cx="862" cy="322" r="1.8" fill="#ff5c00" opacity="0.9" />
              {/* Boot overlay — screen powers on with scroll */}
              <rect data-boot x="412" y="172" width="456" height="146" fill="#05060a" opacity="0" />

              {/* ---- Left studio speaker ---- */}
              <rect x="300" y="328" width="74" height="72" rx="4" fill="#121419" stroke="#2a2f36" strokeWidth="1.5" />
              <circle cx="337" cy="372" r="20" fill="#0b0d10" stroke="#333941" strokeWidth="2" />
              <circle cx="337" cy="372" r="7" fill="#181b20" />
              <circle cx="337" cy="372" r="2" fill="#262b31" />
              <circle cx="337" cy="341" r="7" fill="#0b0d10" stroke="#333941" strokeWidth="1.5" />
              <rect x="321" y="388" width="32" height="3" fill="#08090b" />
              <circle cx="365" cy="336" r="1.5" fill="#ff5c00" opacity="0.8" />
              <ellipse cx="337" cy="402" rx="45" ry="4" fill="#000" opacity="0.35" />

              {/* ---- Right studio speaker ---- */}
              <rect x="906" y="328" width="74" height="72" rx="4" fill="#121419" stroke="#2a2f36" strokeWidth="1.5" />
              <circle cx="943" cy="372" r="20" fill="#0b0d10" stroke="#333941" strokeWidth="2" />
              <circle cx="943" cy="372" r="7" fill="#181b20" />
              <circle cx="943" cy="372" r="2" fill="#262b31" />
              <circle cx="943" cy="341" r="7" fill="#0b0d10" stroke="#333941" strokeWidth="1.5" />
              <rect x="927" y="388" width="32" height="3" fill="#08090b" />
              <circle cx="971" cy="336" r="1.5" fill="#ff5c00" opacity="0.8" />
              <ellipse cx="943" cy="402" rx="45" ry="4" fill="#000" opacity="0.35" />

              {/* Desk row — SSD, cup, keyboard, mouse, interface */}
              <rect x="388" y="388" width="44" height="12" rx="2" fill="#171a1f" stroke="#2b323c" />
              <line x1="394" y1="394" x2="414" y2="394" stroke="#39424e" strokeWidth="1.5" />
              <circle cx="426" cy="394" r="1.5" fill="#ff5c00" opacity="0.9" />
              <rect x="440" y="388" width="18" height="12" rx="2" fill="#1a1d21" stroke="#262b31" />
              <path
                d="M458 391 c 5 0, 5 6, 0 6"
                fill="none"
                stroke="#262b31"
                strokeWidth="1.5"
              />
              <path
                d="M446 384 c 1 -2, -1 -4, 0 -6 M451 384 c 1 -2, -1 -4, 0 -6"
                stroke="#f4ede2"
                strokeWidth="1"
                fill="none"
                opacity="0.1"
              />
              <rect x="484" y="404" width="206" height="13" rx="3" fill="#1b1f26" stroke="#3a424e" />
              <line
                x1="488"
                y1="405.5"
                x2="686"
                y2="405.5"
                stroke="#434c59"
                strokeWidth="1"
                opacity="0.8"
              />
              <line
                x1="490"
                y1="409"
                x2="688"
                y2="409"
                stroke="#262b31"
                strokeWidth="4"
                strokeDasharray="9 4.6"
              />
              <line
                x1="490"
                y1="414.5"
                x2="688"
                y2="414.5"
                stroke="#22262c"
                strokeWidth="3.5"
                strokeDasharray="9 4.6"
              />
              <circle cx="685" cy="415.5" r="1.5" fill="#ff5c00" opacity="0.8" />
              <rect x="702" y="404" width="24" height="15" rx="7.5" fill="#1b1f24" stroke="#262b31" />
              <line x1="714" y1="407" x2="714" y2="411" stroke="#2e333a" strokeWidth="2" />
              <rect x="738" y="404" width="100" height="16" rx="2" fill="#101318" stroke="#22262b" />
              {[
                { x: 752, a: -30 },
                { x: 772, a: 15 },
                { x: 792, a: -60 },
                { x: 812, a: 40 },
              ].map((k) => (
                <g key={`knob-${k.x}`}>
                  <circle cx={k.x} cy="411" r="5.5" fill="#191d22" stroke="#2b3037" strokeWidth="1.5" />
                  <line
                    x1={k.x}
                    y1="411"
                    x2={k.x + 4 * Math.cos((k.a * Math.PI) / 180)}
                    y2={411 + 4 * Math.sin((k.a * Math.PI) / 180)}
                    stroke="#3a4048"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
              <rect data-meter="0" x="830" y="407" width="4" height="3" rx="0.5" fill={METER_OFF} />
              <rect data-meter="1" x="830" y="411" width="4" height="3" rx="0.5" fill={METER_OFF} />
              <rect data-meter="2" x="830" y="415" width="4" height="3" rx="0.5" fill={METER_OFF} />

              {/* ---- Floor plant (beside the desk, on the floor) ---- */}
              <g>
                <g
                  data-plant
                  style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                >
                  <path d="M205 448 C 183 410, 175 366, 193 330 C 209 366, 211 412, 205 448 Z" fill="#35563f" />
                  <path d="M205 448 C 223 420, 227 384, 205 352 C 213 388, 213 420, 205 448 Z" fill="#2f4c38" />
                  <path d="M205 448 C 199 402, 203 356, 209 314 C 219 360, 215 410, 205 448 Z" fill="#3a5c45" stroke="#4d7157" strokeWidth="1" />
                  <path d="M205 448 C 227 430, 239 400, 231 368 C 225 402, 217 430, 205 448 Z" fill="#2c4634" />
                </g>
                <path d="M181 452 L229 452 L223 506 L187 506 Z" fill="#14161a" stroke="#2b313a" />
                <rect x="177" y="446" width="56" height="8" rx="2" fill="#17191e" stroke="#2b313a" />
              </g>

              {/* ---- Workstation tower (right, under the desk) ---- */}
              <g>
                <path d="M980 424 C 980 418, 952 420, 948 426" stroke="#0c0e10" strokeWidth="2.5" fill="none" />
                <rect x="956" y="424" width="48" height="84" rx="2" fill="#101215" stroke="#1e2126" />
                <rect x="962" y="432" width="36" height="68" fill="none" stroke="#191d22" />
                <line x1="966" y1="444" x2="994" y2="444" stroke="#191d22" strokeWidth="2" />
                <line x1="966" y1="450" x2="994" y2="450" stroke="#191d22" strokeWidth="2" />
                <line x1="966" y1="456" x2="994" y2="456" stroke="#191d22" strokeWidth="2" />
                <circle cx="980" cy="470" r="2" fill="#ff5c00" opacity="0.85" />
                <rect x="958" y="506" width="12" height="4" fill="#0c0e10" />
                <rect x="990" y="506" width="12" height="4" fill="#0c0e10" />
              </g>
            </g>

            {/* ============ LIGHT (parallax layer, screened) ============ */}
            <g
              data-layer="light"
              className="will-change-transform"
              style={{ mixBlendMode: "screen" }}
            >
              {/* Screen glow wash on the right wall */}
              <ellipse cx="1130" cy="280" rx="240" ry="200" fill="url(#coolG)" opacity="0.6" />
              {[
                { x: 480, y: 190, r: 1.4 },
                { x: 560, y: 160, r: 1.2 },
                { x: 700, y: 150, r: 1.6 },
                { x: 790, y: 210, r: 1.2 },
                { x: 520, y: 280, r: 1.3 },
                { x: 760, y: 300, r: 1.2 },
                { x: 640, y: 320, r: 1.4 },
                { x: 830, y: 260, r: 1.1 },
              ].map((m) => (
                <circle
                  key={`mote-${m.x}-${m.y}`}
                  data-mote
                  cx={m.x}
                  cy={m.y}
                  r={m.r}
                  fill="#c9d4e4"
                  opacity="0.14"
                />
              ))}
            </g>

            {/* Vignette */}
            <rect x="0" y="0" width="1320" height="600" fill="url(#vigG)" />
          </svg>

          {/* Camcorder HUD overlay */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-white/[0.06] bg-[#050607]/70 px-3 py-1.5 backdrop-blur-[2px]"
          >
            <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.22em] text-ash">
              <span className="block h-1.5 w-1.5 bg-ember" />
              SUITE CAM 01 — EDIT SUITE
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.22em] text-ash">
              REC
              <span
                ref={recRef}
                className="block h-1.5 w-1.5 rounded-full bg-ember"
              />
            </span>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.2em] text-[#8f8f8f]">
        <span className="flex items-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 bg-ember" aria-hidden />
          THE DESK — WHERE FOOTAGE GETS INTERESTING
        </span>
        <span className="hidden shrink-0 sm:inline">FIG. 03 — SCROLL TO SCRUB</span>
      </figcaption>
    </figure>
  );
}
