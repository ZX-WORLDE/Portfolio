"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "top", label: "INTRO" },
  { id: "work", label: "WORK" },
  { id: "services", label: "SERVICES" },
  { id: "about", label: "ABOUT" },
  { id: "testimonials", label: "CLIENTS" },
  { id: "process", label: "PROCESS" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "CONTACT" },
];

/**
 * Fixed track rail on the left edge (desktop): a vertical hairline
 * with a marker per section — like the track headers of an NLE.
 * The marker rides to the section currently in view and the label
 * slides in beside it. Click to glide to a section.
 */
export function SectionRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      {/* Spine */}
      <span
        aria-hidden
        className="absolute left-[3.5px] top-1 bottom-1 w-px bg-[#1c1c1c]"
      />
      <ul className="relative flex flex-col gap-[22px]">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="pointer-events-auto">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-3"
              >
                <span
                  className={`block h-2 w-2 rotate-45 border transition-all duration-300 ${
                    isActive
                      ? "border-ember bg-ember"
                      : "border-[#2e2e2e] bg-ink group-hover:border-ash"
                  }`}
                />
                <span
                  className={`font-mono text-[8px] tracking-[0.3em] transition-all duration-300 ${
                    isActive
                      ? "translate-x-0 text-steel opacity-100"
                      : "-translate-x-1 text-ash opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
