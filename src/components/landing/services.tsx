import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

const SERVICES = [
  {
    n: "01",
    title: "Short-Form Edits",
    desc: "Reels, Shorts and TikToks paced for retention from the first frame.",
  },
  {
    n: "02",
    title: "YouTube Editing",
    desc: "Long-form storytelling with clean pacing, b-roll and captions.",
  },
  {
    n: "03",
    title: "Motion Graphics",
    desc: "Titles, callouts and animated brand elements built to your identity.",
  },
  {
    n: "04",
    title: "Sound & Color",
    desc: "Mixing, sound design and grading that make footage feel finished.",
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-24 border-t border-line bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="02"
          label="What we do"
          title={
            <>
              Services<span className="text-ember">.</span>
            </>
          }
          hint="One discipline, done properly: video that earns the next second."
        />

        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal
              key={s.n}
              y={30}
              delay={i * 90}
              className="group relative bg-ink transition-colors duration-300 hover:bg-panel"
            >
              {/* Frame corner brackets */}
              <span
                aria-hidden
                className="absolute left-2.5 top-2.5 block h-3 w-3 border-l border-t border-[#2e2e2e] transition-colors duration-300 group-hover:border-ember"
              />
              <span
                aria-hidden
                className="absolute right-2.5 top-2.5 block h-3 w-3 border-r border-t border-[#2e2e2e] transition-colors duration-300 group-hover:border-ember"
              />
              <span
                aria-hidden
                className="absolute bottom-2.5 left-2.5 block h-3 w-3 border-b border-l border-[#2e2e2e] transition-colors duration-300 group-hover:border-ember"
              />
              <span
                aria-hidden
                className="absolute bottom-2.5 right-2.5 block h-3 w-3 border-b border-r border-[#2e2e2e] transition-colors duration-300 group-hover:border-ember"
              />

              <div className="p-7 sm:p-9">
                <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-ember">
                  {s.n}
                  {/* Signal meter */}
                  <span
                    aria-hidden
                    className="flex items-end gap-[3px] transition-colors duration-300"
                  >
                    <span className="block h-[3px] w-[3px] bg-[#2e2e2e] transition-colors duration-300 group-hover:bg-ember" />
                    <span className="block h-[6px] w-[3px] bg-[#2e2e2e] transition-colors duration-300 group-hover:bg-ember" />
                    <span className="block h-[9px] w-[3px] bg-[#2e2e2e] transition-colors duration-300 group-hover:bg-ember" />
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto text-[#3a3a3a] transition-colors duration-300 group-hover:text-ember"
                  >
                    +
                  </span>
                </p>
                <h3 className="mt-4 text-lg font-semibold text-bone">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ash">
                  {s.desc}
                </p>
              </div>

              {/* Hover baseline — draws across the clip */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 block h-px w-full origin-left scale-x-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
