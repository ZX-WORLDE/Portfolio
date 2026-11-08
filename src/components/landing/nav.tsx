"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Play, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { openBrief } from "./brief-dialog";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* Freeze Lenis while the mobile menu overlays the page. */
  function handleOpenChange(next: boolean) {
    setOpen(next);
    window.dispatchEvent(
      new Event(next ? "cutroom:overlay-open" : "cutroom:overlay-close")
    );
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-[#050505]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link href="#top" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-ember transition-transform duration-300 group-hover:scale-105">
            <Play className="h-3.5 w-3.5 fill-[#050505] text-[#050505]" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[13px] tracking-wide text-bone">
              BEHIND THE CUT
            </span>
            <span className="mt-1 block font-mono text-[9px] tracking-[0.28em] text-ash">
              SHORT-FORM VIDEO EDITOR
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group font-condensed text-[13px] font-medium uppercase tracking-[0.18em] text-ash transition-colors hover:text-bone"
            >
              {l.label}
              <span className="block h-px max-w-0 bg-ember transition-all duration-300 group-hover:max-w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openBrief}
            className="group hidden items-center gap-2 bg-ember px-5 py-2.5 font-condensed text-[13px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember-hot sm:inline-flex"
          >
            Let&apos;s Talk
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center border border-line text-bone lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className="flex w-[85vw] max-w-sm flex-col border-line bg-[#0a0a0a] p-0"
            >
              <SheetHeader className="border-b border-line p-5">
                <SheetTitle className="flex items-center gap-3 font-display text-[13px] text-bone">
                  <span className="flex h-8 w-8 items-center justify-center bg-ember">
                    <Play className="h-3 w-3 fill-[#050505] text-[#050505]" />
                  </span>
                  BEHIND THE CUT
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile"
                className="flex flex-1 flex-col divide-y divide-line"
              >
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-5 py-5 font-condensed text-2xl font-medium uppercase tracking-wide text-bone transition-colors hover:bg-panel hover:text-ember"
                  >
                    {l.label}
                    <ArrowUpRight className="h-5 w-5 text-ash" />
                  </a>
                ))}
              </nav>
              <div className="border-t border-line p-5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openBrief();
                  }}
                  className="flex w-full items-center justify-center gap-2 bg-ember px-4 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-ink hover:bg-ember-hot"
                >
                  Let&apos;s Talk
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <p className="mt-4 text-center font-mono text-[9px] tracking-[0.22em] text-ash">
                  REELS · SHORTS · TIKTOKS · ADS
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
