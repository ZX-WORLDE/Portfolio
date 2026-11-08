"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, onScroll } from "animejs";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Vertical rise in px (default 26) */
  y?: number;
  /** Base delay in ms */
  delay?: number;
  duration?: number;
};

/**
 * Scroll-triggered reveal powered by anime.js `onScroll`.
 * Plays once when the element enters the viewport, pauses if it
 * leaves mid-flight and resumes when it comes back.
 */
export function Reveal({
  children,
  className,
  y = 26,
  delay = 0,
  duration = 900,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    /* Park the element in its "from" state before animating so there
       is never a flash of the resting position. */
    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;

    const anim = animate(el, {
      opacity: [0, 1],
      translateY: [y, 0],
      duration,
      delay,
      ease: "out(3)",
      autoplay: onScroll({ target: el, enter: "bottom top" }),
    });

    return () => {
      anim.revert();
    };
  }, [y, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
