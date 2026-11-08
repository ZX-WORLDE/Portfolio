"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";
import { openBrief } from "./brief-dialog";
import { MessageCircle } from "lucide-react";

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

const CONTACT_ROWS = [
  {
    icon: Mail,
    label: "Email",
    value: "behindthecut12@gmail.com",
    href: "mailto:behindthecut12@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 17820-17981",
    href: "tel:+8801782017981",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nalchity Upazila, Bangladesh",
  },
];

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  company: "",
  projectType: "",
  budget: "",
  message: "",
};

const fieldClass =
  "border-line bg-[#0b0b0b] text-sm text-bone placeholder:text-[#4a4a4a] focus-visible:ring-ember";
const labelClass =
  "font-condensed text-[11px] font-medium uppercase tracking-[0.22em] text-ash";

export function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ id: string; waUrl: string } | null>(null);

  const set = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast({
          title: "Couldn't send the brief",
          description: data.error ?? "Check your fields and try again.",
          variant: "destructive",
        });
        return;
      }
      setDone({ id: data.id, waUrl: data.waUrl });
      toast({
        title: "Brief received",
        description: "We will contact you within 24 hours — usually sooner.",
      });
    } catch {
      toast({
        title: "Network error",
        description: "The line dropped. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-line bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Head */}
        <SectionHead
          index="07"
          label="Contact"
          title={
            <>
              Let&apos;s create something great
              <span className="text-ember">.</span>
            </>
          }
          hint="Got footage? We&apos;ll make it worth watching."
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Direct contact */}
          <Reveal className="lg:col-span-5" y={26}>
            <div className="divide-y divide-line border border-line">
              {CONTACT_ROWS.map((row) => {
                const inner = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-ember transition-colors group-hover:border-ember/40">
                      <row.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
                        {row.label}
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium text-bone transition-colors group-hover:text-ember">
                        {row.value}
                      </span>
                    </span>
                  </>
                );
                const cls =
                  "group flex items-center gap-4 p-5 transition-colors hover:bg-panel";
                return row.href ? (
                  <a key={row.label} href={row.href} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div key={row.label} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* The CTA */}
            <button
              type="button"
              onClick={openBrief}
              className="group mt-8 inline-flex w-full items-center justify-center gap-3 bg-ember px-9 py-4.5 font-condensed text-base font-semibold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-ember-hot focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:w-auto sm:min-w-[260px]"
            >
              Let&apos;s Talk
              <span className="flex h-6 w-6 items-center justify-center bg-ink/15 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
            <p className="mt-4 font-condensed text-[11px] uppercase tracking-[0.22em] text-[#8f8f8f]">
              Opens the 60-second brief · Replies within 24h
            </p>
          </Reveal>

          {/* Brief form */}
          <Reveal className="lg:col-span-7" y={26} delay={120}>
            <div className="border border-[#232323] bg-panel p-6 sm:p-8">
              {done ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ember">
                    <CheckCircle2 className="h-7 w-7 text-ember" />
                  </span>
                  <h3 className="mt-6 font-display text-xl uppercase text-bone">
                    Brief received.
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
                    We will contact you within 24 hours — usually sooner.
                    Want a head start? Continue the conversation on
                    WhatsApp with your brief pre-written.
                  </p>
                  <a
                    href={done.waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2.5 bg-ember px-6 py-3.5 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember-hot"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Continue in WhatsApp
                  </a>
                  <p className="mt-5 border border-line bg-[#0b0b0b] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-steel">
                    REF: {done.id.toUpperCase().slice(-8)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDone(null);
                      setForm(INITIAL);
                    }}
                    className="mt-8 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-ash underline-offset-4 transition-colors hover:text-ember hover:underline"
                  >
                    Send another brief
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.18em] text-bone">
                      Project brief
                    </h3>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-[#8f8f8f]">
                      REPLY &lt; 24H
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className={labelClass}>
                        Name *
                      </Label>
                      <Input
                        id="name"
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
                      <Label htmlFor="email" className={labelClass}>
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={120}
                        value={form.email}
                        onChange={(e) => set("email")(e.target.value)}
                        placeholder="you@company.com"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className={labelClass}>
                      WhatsApp number *
                    </Label>
                    <Input
                      id="whatsapp"
                      required
                      minLength={7}
                      maxLength={20}
                      inputMode="tel"
                      value={form.whatsapp}
                      onChange={(e) => set("whatsapp")(e.target.value)}
                      placeholder="+880 1XXX-XXXXXX — with country code"
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className={labelClass}>
                      Brand / project
                    </Label>
                    <Input
                      id="company"
                      maxLength={80}
                      value={form.company}
                      onChange={(e) => set("company")(e.target.value)}
                      placeholder="Optional — who is this for?"
                      className={fieldClass}
                    />
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
                    <Label htmlFor="message" className={labelClass}>
                      The footage
                    </Label>
                    <Textarea
                      id="message"
                      maxLength={1200}
                      value={form.message}
                      onChange={(e) => set("message")(e.target.value)}
                      placeholder="What are we cutting, how much exists, and when does it ship?"
                      className={`min-h-[110px] ${fieldClass}`}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group h-auto w-full bg-ember py-4 font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember-hot disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending the brief…
                      </>
                    ) : (
                      <>
                        Send the brief
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  <p className="text-center font-mono text-[9px] tracking-[0.18em] text-[#8f8f8f]">
                    NO SPAM · A REPLY FROM THE DESK, NOT A BOT
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
