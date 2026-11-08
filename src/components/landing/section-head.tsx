"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, onScroll } from "animejs";
import { Reveal } from "./reveal";

type SectionHeadProps = {
  /** Section index, e.g. "01" */
  index: string;
  /** Short label, e.g. "Selected work" */
  label: string;
  /** Display title; append your own ember period */
  title: ReactNode;
  /** Optional right-aligned side note */
  hint?: ReactNode;
  className?: string;
};

/**
 * Standard section opener:
 * crosshair → hairline that draws itself on scroll → index label,
 * then the display title with a ghost numeral behind it (desktop).
 */
export function SectionHead({
  index,
  label,
  title,
  hint,
  className,
}: SectionHeadProps) {
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    line.style.transform = "scaleX(0)";

    const anim = animate(line, {
      scaleX: [0, 1],
      duration: 1300,
      ease: "out(3)",
      autoplay: onScroll({ target: line, enter: "bottom top" }),
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <Reveal className={className} y={22}>
      <div className="relative mb-10 md:mb-14">
        {/* Meta row — crosshair, drawn rule, index */}
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="font-mono text-[11px] leading-none text-ember"
          >
            +
          </span>
          <span className="relative block h-px flex-1 overflow-hidden bg-[#1a1a1a]">
            <span
              ref={lineRef}
              className="absolute inset-0 block origin-left bg-[#3a3a3a]"
            />
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-ash">
            {index} / {label.toUpperCase()}
          </span>
        </div>

        {/* Title row with ghost numeral */}
        <div className="relative mt-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-9 right-0 hidden select-none font-display text-[9rem] leading-none text-[#0b0b0b] xl:block"
          >
            {index}
          </span>
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl">
              {title}
            </h2>
            {hint ? (
              <p className="max-w-xs text-sm leading-relaxed text-ash md:text-right">
                {hint}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
