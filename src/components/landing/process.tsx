"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Brief",
    desc: "We learn the goal, the audience and the tone of the edit.",
  },
  {
    n: "02",
    title: "Assembly",
    desc: "Footage is sorted, cut and structured around the story.",
  },
  {
    n: "03",
    title: "Polish",
    desc: "Graphics, sound design, color and captions get layered in.",
  },
  {
    n: "04",
    title: "Deliver",
    desc: "Revisions, then exports sized for every platform you post on.",
  },
];

export function Process() {
  const rootRef = useRef<HTMLElement>(null);

  /* The timeline rule draws itself in proportion to how far the
     steps have travelled through the viewport, and the keyframe
     diamonds ignite one by one as the playhead passes them. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const steps = root.querySelector<HTMLElement>("[data-steps]");
    const diamonds = Array.from(
      root.querySelectorAll<HTMLElement>("[data-keyframe]")
    );
    if (steps && diamonds.length > 0) {
      /* Park diamonds dimmed (no-JS visitors see them lit) */
      diamonds.forEach((d) => d.classList.remove("kf-lit"));

      const thresholds = diamonds.map((_, i) =>
        Math.min(0.97, 0.02 + (i / Math.max(1, diamonds.length - 1)) * 0.94)
      );

      const so = onScroll({
        target: steps,
        enter: "bottom top",
        leave: "top bottom",
        sync: true,
        onUpdate: (self) => {
          const p = self.progress;
          diamonds.forEach((d, i) => {
            d.classList.toggle("kf-lit", p >= thresholds[i]);
          });
        },
      });

      const scope = createScope({ root }).add(() => {
        animate("[data-process-line]", {
          scaleX: [0, 1],
          ease: "linear",
          autoplay: onScroll({
            target: steps,
            enter: "bottom top",
            leave: "top bottom",
            sync: true,
          }),
        });
      });

      return () => {
        so.revert();
        scope.revert();
      };
    }

    const scope = createScope({ root }).add(() => {
      animate("[data-process-line]", {
        scaleX: [0, 1],
        ease: "linear",
        autoplay: onScroll({
          target: "[data-steps]",
          enter: "bottom top",
          leave: "top bottom",
          sync: true,
        }),
      });
    });

    return () => scope.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="process"
      className="scroll-mt-24 border-t border-line bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="05"
          label="How we work"
          title={
            <>
              The process<span className="text-ember">.</span>
            </>
          }
          hint="Four steps from raw footage to finished cut."
        />

        {/* Timeline rule with keyframe diamonds */}
        <div
          aria-hidden
          className="relative mb-10 hidden h-px bg-line md:block"
        >
          <span
            data-process-line
            style={{ transform: "scaleX(0)" }}
            className="absolute inset-0 block origin-left bg-ember/70"
          />
          {["0%", "33.333%", "66.666%", "100%"].map((left) => (
            <span
              key={left}
              data-keyframe
              className="kf-lit absolute top-0 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#2e2e2e] bg-ink transition-[background-color,border-color,box-shadow] duration-300"
              style={{ left }}
            />
          ))}
        </div>

        <div
          data-steps
          className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              y={30}
              delay={i * 100}
              className="bg-ink transition-colors duration-300 hover:bg-panel"
            >
              <div className="p-7">
                <p className="font-display text-2xl text-ember">{s.n}</p>
                <h3 className="mt-4 text-lg font-semibold text-bone">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ash">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
