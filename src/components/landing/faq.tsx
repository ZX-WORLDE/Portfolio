"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "How fast can you deliver?",
    a: "Most projects are delivered within 3–7 business days, depending on the scope and complexity. Larger projects may require additional time.",
  },
  {
    q: "Do you work with early-stage startups or only established companies?",
    a: "We work with both early-stage startups and established companies. If you have a great product or idea and need high-quality creative work, we're happy to help.",
  },
  {
    q: "Who owns the final files?",
    a: "You do. Once the project is completed and payment is made, you receive full ownership of the final deliverables and files.",
  },
  {
    q: "How many revisions do I get?",
    a: "You get up to 2 rounds of revisions included with each project. Additional revisions can be arranged if needed.",
  },
  {
    q: "Do you work with non-YC startups?",
    a: "Yes. YC is just one part of our client base. We also work with independent founders, early-stage startups, SaaS companies, and established businesses.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-line bg-[#070707] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="06"
          label="Good to know"
          title={
            <>
              FAQs<span className="text-ember">.</span>
            </>
          }
          hint={
            <>
              Still unsure about something?{" "}
              <a
                href="#contact"
                className="text-bone underline-offset-4 transition-colors hover:text-ember hover:underline"
              >
                Ask directly.
              </a>
            </>
          }
        />

        <Reveal className="max-w-3xl" y={26}>
          <Accordion
            type="single"
            collapsible
            className="border-t border-line"
          >
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="border-line"
              >
                <AccordionTrigger className="py-5 font-condensed text-base font-medium tracking-wide text-bone hover:no-underline hover:text-ember sm:text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-ash">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
