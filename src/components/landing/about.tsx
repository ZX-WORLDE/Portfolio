"use client";

import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";
import { DeskScene } from "./desk-scene";

const TOOLS = [
  "PREMIERE PRO",
  "AFTER EFFECTS",
  "DAVINCI RESOLVE",
  "AUDITION",
  "PHOTOSHOP",
];

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-t border-line bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="03"
          label="About"
          title={
            <>
              Behind the cut<span className="text-ember">.</span>
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Bio + tool stack */}
          <Reveal className="lg:col-span-7" y={28}>
            <p className="text-base leading-relaxed text-ash sm:text-lg">
              <span className="font-semibold text-bone">
                I&apos;m a short-form video editor.
              </span>{" "}
              For the past 6 years I&apos;ve cut podcast clips, UGC ads and
              social campaigns for creators and brands — 110+ videos delivered
              and counting.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ash">
              Good editing is invisible: the hook lands in the first second,
              the captions breathe with the audio, and the story resolves
              before a thumb thinks to swipe. That&apos;s the standard on
              every cut that leaves this desk.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {TOOLS.map((t) => (
                <span
                  key={t}
                  className="border border-line px-3.5 py-2 font-mono text-[10px] tracking-[0.18em] text-ash"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Quick facts */}
          <Reveal className="lg:col-span-5" y={28} delay={120}>
            <div className="divide-y divide-line border border-line">
              {[
                { k: "Turnaround", v: "Most projects in 3–7 business days" },
                { k: "Revisions", v: "Two rounds included on every project" },
                { k: "Ownership", v: "You own the final files, always" },
                { k: "Clients", v: "Startups and established teams alike" },
              ].map((row) => (
                <div key={row.k} className="flex gap-5 p-5 sm:p-6">
                  <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                    {row.k}
                  </span>
                  <p className="text-[13px] leading-relaxed text-ash">
                    {row.v}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* The desk — fully vector, scroll-scrubbed edit-suite scene */}
        <Reveal className="mt-14 md:mt-20" y={36}>
          <DeskScene />
        </Reveal>
      </div>
    </section>
  );
}
