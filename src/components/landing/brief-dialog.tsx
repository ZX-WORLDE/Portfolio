"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * THE PROJECT BRIEF — opened from any "Let's Talk" button via the
 * `cutroom:open-brief` event. On submit it stores the lead, then hands
 * the visitor to WhatsApp with every detail pre-filled and shows a
 * studio-grade confirmation so nobody is left wondering what happened.
 */

const PROJECT_TYPES = [
  { value: "social", label: "Short-form / Social" },
  { value: "commercial", label: "Commercial / Ad" },
  { value: "documentary", label: "Long-form / YouTube" },
  { value: "music-video", label: "Music video" },
  { value: "other", label: "Something else" },
];

const BUDGETS = [
  { value: "<2k", label: "Under $2K" },
  { value: "2-5k", label: "$2K – $5K" },
  { value: "5-15k", label: "$5K – $15K" },
  { value: "15k+", label: "$15K+" },
  { value: "not-sure", label: "Not sure yet" },
];

const INITIAL = {
  name: "",
  email: "",
  whatsapp: "",
  company: "",
  projectType: "",
  budget: "",
  message: "",
};

type FormState = typeof INITIAL;

const fieldClass =
  "h-11 border-line bg-[#0e0e0e] text-sm text-bone placeholder:text-[#4a4a4a] focus-visible:ring-ember";
const labelClass =
  "font-condensed text-[10px] font-medium uppercase tracking-[0.22em] text-ash";

export function openBrief() {
  window.dispatchEvent(new Event("cutroom:open-brief"));
}

export function BriefDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    ref: string;
    waUrl: string;
    blocked: boolean;
  } | null>(null);
  const waWindow = useRef<Window | null>(null);

  /* Any "Let's Talk" button on the page can open the brief. */
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("cutroom:open-brief", open);
    return () => window.removeEventListener("cutroom:open-brief", open);
  }, []);

  /* Freeze Lenis while the dialog overlays the page. */
  function handleOpenChange(next: boolean) {
    setOpen(next);
    window.dispatchEvent(
      new Event(next ? "cutroom:overlay-open" : "cutroom:overlay-close")
    );
    if (!next) {
      setError(null);
      if (waWindow.current) {
        waWindow.current.close();
        waWindow.current = null;
      }
    }
  }

  const set = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    /* Open the WhatsApp tab inside the user gesture so pop-up
       blockers never eat the redirect; details are written in after
       the server responds. */
    waWindow.current = window.open("", "_blank");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Check your fields and try again.");
        waWindow.current?.close();
        waWindow.current = null;
        return;
      }

      const waUrl: string = data.waUrl;
      let blocked = false;
      if (waWindow.current && !waWindow.current.closed) {
        waWindow.current.location.href = waUrl;
      } else {
        blocked = true;
      }
      waWindow.current = null;
      setDone({ ref: String(data.id).toUpperCase().slice(-8), waUrl, blocked });
    } catch {
      setError("Network error — the line dropped. Try again in a moment.");
      waWindow.current?.close();
      waWindow.current = null;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setDone(null);
    setForm(INITIAL);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[92vh] gap-0 overflow-y-auto border-[#232323] bg-[#0a0a0a] p-0 sm:max-w-[560px]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Project brief</DialogTitle>
        </DialogHeader>

        {done ? (
          /* ============ CONFIRMATION ============ */
          <div className="relative flex flex-col items-center px-6 py-12 text-center sm:px-12">
            {/* Viewer corner brackets */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-4 block h-4 w-4 border-l-2 border-t-2 border-ember/60"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 top-4 block h-4 w-4 border-r-2 border-t-2 border-ember/60"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-4 left-4 block h-4 w-4 border-b-2 border-l-2 border-ember/60"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-4 right-4 block h-4 w-4 border-b-2 border-r-2 border-ember/60"
            />

            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-ember/60 bg-ember/10">
              <BadgeCheck className="h-8 w-8 text-ember" />
              <span className="absolute inset-0 animate-ping rounded-full border border-ember/30" />
            </span>

            <p className="mt-7 font-mono text-[9px] tracking-[0.3em] text-ash">
              TRANSMISSION COMPLETE — REF {done.ref}
            </p>
            <h3 className="mt-3 font-display text-2xl uppercase tracking-tight text-bone">
              Brief received<span className="text-ember">.</span>
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">
              Thank you, {form.name.split(" ")[0] || "friend"} — your brief is
              on the studio desk. <span className="text-bone">We will
              contact you within 24 hours</span>, usually much sooner.
            </p>

            <a
              href={done.waUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-2.5 bg-ember px-6 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember-hot"
            >
              <MessageCircle className="h-4 w-4" />
              Continue in WhatsApp
            </a>
            {done.blocked && (
              <p className="mt-3 font-mono text-[9px] tracking-[0.18em] text-ash">
                WHATSAPP DIDN&apos;T OPEN AUTOMATICALLY — USE THE BUTTON ABOVE
              </p>
            )}

            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-5 inline-flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-ash transition-colors hover:text-ember"
            >
              <X className="h-3.5 w-3.5" /> Done
            </button>
          </div>
        ) : (
          /* ============ THE BRIEF FORM ============ */
          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="flex items-center gap-2.5 font-mono text-[9px] tracking-[0.28em] text-ember">
                  <span className="inline-block h-1.5 w-1.5 bg-ember" />
                  PROJECT BRIEF — 60 SECONDS
                </p>
                <h3 className="mt-3 font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
                  Tell me about the cut<span className="text-ember">.</span>
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ash">
                  Fill this once — it lands on the studio desk and opens
                  WhatsApp with everything pre-written.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bf-name" className={labelClass}>
                    Name *
                  </Label>
                  <Input
                    id="bf-name"
                    required
                    minLength={2}
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => set("name")(e.target.value)}
                    placeholder="Your name"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bf-email" className={labelClass}>
                    Email *
                  </Label>
                  <Input
                    id="bf-email"
                    type="email"
                    required
                    maxLength={120}
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    placeholder="you@brand.com"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bf-wa" className={labelClass}>
                    WhatsApp number *
                  </Label>
                  <Input
                    id="bf-wa"
                    required
                    minLength={7}
                    maxLength={20}
                    inputMode="tel"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp")(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className={fieldClass}
                  />
                  <p className="font-mono text-[8.5px] tracking-[0.14em] text-[#6b6b6b]">
                    COUNTRY CODE INCLUDED — WE REPLY HERE FIRST
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bf-company" className={labelClass}>
                    Brand / project
                  </Label>
                  <Input
                    id="bf-company"
                    maxLength={80}
                    value={form.company}
                    onChange={(e) => set("company")(e.target.value)}
                    placeholder="Optional"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className={labelClass}>Project type *</Label>
                  <Select
                    value={form.projectType}
                    onValueChange={set("projectType")}
                    required
                  >
                    <SelectTrigger
                      className={`w-full ${fieldClass} data-[placeholder]:text-[#4a4a4a]`}
                    >
                      <SelectValue placeholder="Pick a type" />
                    </SelectTrigger>
                    <SelectContent className="border-line bg-[#0b0b0b] text-bone">
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="focus:bg-ember focus:text-[#050505]"
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Budget range</Label>
                  <Select value={form.budget} onValueChange={set("budget")}>
                    <SelectTrigger
                      className={`w-full ${fieldClass} data-[placeholder]:text-[#4a4a4a]`}
                    >
                      <SelectValue placeholder="If you know it" />
                    </SelectTrigger>
                    <SelectContent className="border-line bg-[#0b0b0b] text-bone">
                      {BUDGETS.map((b) => (
                        <SelectItem
                          key={b.value}
                          value={b.value}
                          className="focus:bg-ember focus:text-[#050505]"
                        >
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bf-message" className={labelClass}>
                  The footage
                </Label>
                <Textarea
                  id="bf-message"
                  maxLength={1200}
                  value={form.message}
                  onChange={(e) => set("message")(e.target.value)}
                  placeholder="What are we cutting, how much footage exists, and when does it ship?"
                  className={`min-h-[96px] border-line bg-[#0e0e0e] text-sm text-bone placeholder:text-[#4a4a4a] focus-visible:ring-ember`}
                />
              </div>

              {error && (
                <p className="border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ember">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2.5 bg-ember px-6 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember-hot disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending the brief…
                  </>
                ) : (
                  <>
                    Send the brief — open WhatsApp
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[8.5px] tracking-[0.18em] text-[#6b6b6b]">
                NO SPAM · REPLY WITHIN 24H · YOUR BRIEF SAVES TO THE STUDIO DESK
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
