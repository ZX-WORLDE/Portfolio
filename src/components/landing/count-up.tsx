"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";

/**
 * Number that counts up the first time it scrolls into view.
 * Driven by an anime.js tween on a proxy object.
 */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (v: number) => `${v.toFixed(decimals)}${suffix}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(to);
      return;
    }

    const counter = { v: 0 };
    el.textContent = format(0);

    const anim = animate(counter, {
      v: to,
      duration,
      ease: "out(3)",
      onUpdate: () => {
        el.textContent = format(counter.v);
      },
      autoplay: onScroll({ target: el, enter: "bottom-=60 top" }),
    });

    return () => {
      anim.revert();
    };
  }, [to, decimals, suffix, duration]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}
