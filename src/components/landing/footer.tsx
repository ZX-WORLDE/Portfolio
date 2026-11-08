import { ArrowUp, Mail, Phone, MapPin } from "lucide-react";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

const CONTACT = [
  { icon: Mail, value: "behindthecut12@gmail.com", href: "mailto:behindthecut12@gmail.com" },
  { icon: Phone, value: "+880 17820-17981", href: "tel:+8801782017981" },
  { icon: MapPin, value: "Nalchity Upazila, Bangladesh" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Wordmark + contact */}
          <div className="md:col-span-7">
            <p className="font-display text-2xl uppercase tracking-wide text-bone sm:text-3xl">
              Behind the cut<span className="text-ember">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">
              Short-form video editor for podcasts, creators and brands.
              Reels, Shorts, TikToks and ads — cut for retention.
            </p>
            <ul className="mt-7 space-y-2.5">
              {CONTACT.map((c) => (
                <li key={c.value} className="flex items-center gap-3">
                  <c.icon className="h-3.5 w-3.5 shrink-0 text-ember" aria-hidden />
                  {c.href ? (
                    <a
                      href={c.href}
                      className="font-condensed text-sm tracking-wide text-ash transition-colors hover:text-bone"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="font-condensed text-sm tracking-wide text-ash">
                      {c.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Nav */}
          <nav aria-label="Footer" className="md:col-span-5 md:justify-self-end">
            <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
              NAVIGATE
            </p>
            <ul className="mt-4 space-y-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="font-condensed text-base font-medium uppercase tracking-[0.12em] text-ash transition-colors hover:text-bone"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#8f8f8f]">
            © {new Date().getFullYear()} BEHIND THE CUT — ALL CUTS RESERVED
          </p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-ash transition-colors hover:text-ember"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
