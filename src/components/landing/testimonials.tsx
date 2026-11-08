import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

const QUOTES = [
  {
    initials: "RA",
    quote:
      "Behind the Cut turned our raw podcast footage into clips that actually perform. Retention went up within two weeks.",
    name: "Rafi Ahmed",
    role: "Founder, Deepwork Media",
  },
  {
    initials: "SL",
    quote:
      "Fast, precise and genuinely creative. They understand pacing better than any editor we've worked with.",
    name: "Sofia Lindqvist",
    role: "Content Lead, Northlane",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 border-t border-line bg-[#070707] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="04"
          label="Clients say"
          title={
            <>
              Kind words<span className="text-ember">.</span>
            </>
          }
          hint="Creators and teams who send footage again."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} y={32} delay={i * 120}>
              <figure className="flex h-full flex-col border border-line bg-panel p-7 sm:p-8">
                <span
                  className="font-display text-3xl leading-none text-ember"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-bone">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2e2e2e] font-display text-[11px] text-ember"
                    aria-hidden
                  >
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-bone">
                      {q.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] tracking-[0.16em] text-ash">
                      {q.role.toUpperCase()}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
