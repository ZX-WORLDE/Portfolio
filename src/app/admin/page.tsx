"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Film,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Pencil,
  Play,
  Plus,
  Save,
  Settings2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/admin/upload-field";
import { cn } from "@/lib/utils";

/* ============================================================ types */

type Lead = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string | null;
  projectType: string;
  budget: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

type Cut = {
  id: string;
  title: string;
  tags: string;
  src: string;
  poster: string;
  duration: string;
  featured: boolean;
  order: number;
};

type Settings = {
  showreel_src?: string;
  showreel_poster?: string;
  showreel_label?: string;
};

const TYPE_LABELS: Record<string, string> = {
  social: "Short-form / Social",
  commercial: "Commercial / Ad",
  documentary: "Long-form / YouTube",
  "music-video": "Music video",
  other: "Something else",
};

const BUDGET_LABELS: Record<string, string> = {
  "<2k": "Under $2K",
  "2-5k": "$2K – $5K",
  "5-15k": "$5K – $15K",
  "15k+": "$15K+",
  "not-sure": "Not sure yet",
};

const STATUSES = ["NEW", "REPLIED", "WON", "CLOSED"];

const fieldClass =
  "h-10 border-line bg-[#0e0e0e] text-sm text-bone placeholder:text-[#4a4a4a] focus-visible:ring-ember";
const labelClass =
  "font-condensed text-[10px] font-medium uppercase tracking-[0.22em] text-ash";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================ page */

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-bone">
        <Loader2 className="h-6 w-6 animate-spin text-ember" />
      </main>
    );
  }

  return authed ? (
    <Dashboard onLogout={() => setAuthed(false)} />
  ) : (
    <LoginGate onOk={() => setAuthed(true)} />
  );
}

/* ============================================================ login */

function LoginGate({ onOk }: { onOk: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Wrong password.");
        return;
      }
      onOk();
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ink px-4 text-bone">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/[0.06] blur-[140px]"
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm border border-[#232323] bg-panel p-8"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-1.5 -top-1.5 block h-4 w-4 border-l-2 border-t-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1.5 -top-1.5 block h-4 w-4 border-r-2 border-t-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 -left-1.5 block h-4 w-4 border-b-2 border-l-2 border-ember/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 -right-1.5 block h-4 w-4 border-b-2 border-r-2 border-ember/60"
        />

        <p className="flex items-center gap-2.5 font-mono text-[9px] tracking-[0.3em] text-ember">
          <span className="inline-block h-1.5 w-1.5 bg-ember" />
          RESTRICTED — STUDIO ACCESS
        </p>
        <h1 className="mt-4 font-display text-2xl uppercase tracking-tight">
          Admin panel<span className="text-ember">.</span>
        </h1>
        <p className="mt-2 text-[13px] text-ash">
          Briefs, recent cuts and the showreel live behind this door.
        </p>

        <div className="mt-7 space-y-2">
          <Label htmlFor="admin-pass" className={labelClass}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a5a5a]" />
            <Input
              id="admin-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={cn(fieldClass, "pl-9")}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ember">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 bg-ember font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember-hot disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Enter the studio"
          )}
        </button>
      </form>
    </main>
  );
}

/* ============================================================ dashboard */

type Tab = "briefs" | "cuts" | "showreel";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("briefs");

  const TABS: Array<{ id: Tab; label: string; icon: typeof Inbox }> = [
    { id: "briefs", label: "Project briefs", icon: Inbox },
    { id: "cuts", label: "Recent cuts", icon: Film },
    { id: "showreel", label: "Showreel", icon: Settings2 },
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  return (
    <main className="min-h-screen bg-ink text-bone">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-[#050505]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-ember">
              <Play className="h-3.5 w-3.5 fill-[#050505] text-[#050505]" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[13px] tracking-wide">
                STUDIO ADMIN
              </span>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.28em] text-ash">
                BEHIND THE CUT — CONTROL ROOM
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 border border-line px-3.5 py-2 font-mono text-[9px] tracking-[0.2em] text-ash transition-colors hover:border-ember hover:text-ember sm:inline-flex"
            >
              VIEW SITE
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 border border-line px-3.5 py-2 font-mono text-[9px] tracking-[0.2em] text-ash transition-colors hover:border-ember hover:text-ember"
            >
              LOGOUT
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 font-condensed text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                tab === t.id
                  ? "border-ember text-bone"
                  : "border-transparent text-ash hover:text-bone"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {tab === "briefs" && <BriefsPanel />}
        {tab === "cuts" && <CutsPanel />}
        {tab === "showreel" && <ShowreelPanel />}
      </div>
    </main>
  );
}

/* ============================================================ briefs */

function BriefsPanel() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
      .catch(() => setLeads([]));
  }, []);

  useEffect(load, [load]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((ls) =>
      ls ? ls.map((l) => (l.id === id ? { ...l, status } : l)) : ls
    );
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this brief permanently?")) return;
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    setLeads((ls) => (ls ? ls.filter((l) => l.id !== id) : ls));
  }

  if (leads === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ember" />
      </div>
    );
  }

  const fresh = leads.filter((l) => l.status === "NEW").length;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl uppercase tracking-tight">
            Project briefs<span className="text-ember">.</span>
          </h2>
          <p className="mt-1.5 font-mono text-[9px] tracking-[0.22em] text-ash">
            {leads.length} TOTAL · {fresh} NEW — FROM THE POPUP &amp; CONTACT
            FORM
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="border border-line px-3.5 py-2 font-mono text-[9px] tracking-[0.2em] text-ash transition-colors hover:border-ember hover:text-ember"
        >
          REFRESH
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center border border-dashed border-line py-20 text-center">
          <Inbox className="h-8 w-8 text-[#3a3a3a]" />
          <p className="mt-4 font-condensed text-sm uppercase tracking-[0.18em] text-ash">
            The desk is quiet — no briefs yet
          </p>
          <p className="mt-2 max-w-xs text-[13px] text-[#6b6b6b]">
            Every brief sent through the site lands here instantly.
          </p>
        </div>
      ) : (
        <ul className="dark-scroll mt-8 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {leads.map((l) => (
            <li
              key={l.id}
              className={cn(
                "border bg-panel p-5",
                l.status === "NEW" ? "border-ember/40" : "border-line"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={cn(
                        "px-2 py-0.5 font-mono text-[8.5px] tracking-[0.18em]",
                        l.status === "NEW" && "bg-ember text-ink",
                        l.status === "REPLIED" &&
                          "border border-line text-steel",
                        l.status === "WON" &&
                          "border border-bone bg-bone text-ink",
                        l.status === "CLOSED" &&
                          "border border-line text-[#5a5a5a]"
                      )}
                    >
                      {l.status}
                    </span>
                    <h3 className="font-condensed text-base font-semibold uppercase tracking-wide text-bone">
                      {l.name}
                    </h3>
                    {l.company && (
                      <span className="text-[13px] text-ash">
                        · {l.company}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-[9px] tracking-[0.16em] text-ash">
                    {fmtDate(l.createdAt)} ·{" "}
                    {TYPE_LABELS[l.projectType] ?? l.projectType}
                    {l.budget ? ` · ${BUDGET_LABELS[l.budget] ?? l.budget}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => setStatus(l.id, e.target.value)}
                    aria-label={`Status for ${l.name}`}
                    className="h-8 border border-line bg-[#0e0e0e] px-2 font-mono text-[10px] tracking-[0.1em] text-bone focus:outline-ember"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <a
                    href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Reply on WhatsApp"
                    className="flex h-8 w-8 items-center justify-center border border-line text-ash transition-colors hover:border-ember hover:text-ember"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`mailto:${l.email}`}
                    title="Reply by email"
                    className="flex h-8 w-8 items-center justify-center border border-line text-ash transition-colors hover:border-ember hover:text-ember"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    title="Delete brief"
                    className="flex h-8 w-8 items-center justify-center border border-line text-ash transition-colors hover:border-ember hover:text-ember"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-1.5 font-mono text-[10px] tracking-[0.08em] text-ash sm:grid-cols-2">
                <span className="truncate">EMAIL — {l.email}</span>
                <span className="truncate">WHATSAPP — {l.whatsapp}</span>
              </div>

              {l.message && (
                <div className="mt-3">
                  <p
                    className={cn(
                      "whitespace-pre-wrap border-l-2 border-ember/50 pl-3.5 text-[13px] leading-relaxed text-[#c9c9c7]",
                      expanded === l.id ? "" : "line-clamp-2"
                    )}
                  >
                    {l.message}
                  </p>
                  {l.message.length > 120 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(expanded === l.id ? null : l.id)
                      }
                      className="mt-2 pl-3.5 font-condensed text-[10px] font-semibold uppercase tracking-[0.2em] text-ash transition-colors hover:text-ember"
                    >
                      {expanded === l.id ? "Show less" : "Read full brief"}
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================ cuts */

const CUT_INITIAL = {
  title: "",
  tags: "",
  src: "",
  poster: "",
  duration: "0:30",
  order: 10,
  featured: false,
};

function CutsPanel() {
  const [cuts, setCuts] = useState<Cut[] | null>(null);
  const [form, setForm] = useState({ ...CUT_INITIAL });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/cuts")
      .then((r) => r.json())
      .then((d) => setCuts(d.cuts ?? []))
      .catch(() => setCuts([]));
  }, []);

  useEffect(load, [load]);

  const set = (k: keyof typeof CUT_INITIAL) => (v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/api/admin/cuts/${editingId}` : "/api/admin/cuts",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            order: Number(form.order) || 0,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Couldn't save the cut.");
        return;
      }
      setForm({ ...CUT_INITIAL });
      setEditingId(null);
      load();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this cut from the homepage?")) return;
    await fetch(`/api/admin/cuts/${id}`, { method: "DELETE" });
    setCuts((cs) => (cs ? cs.filter((c) => c.id !== id) : cs));
  }

  async function toggleFeatured(c: Cut) {
    await fetch(`/api/admin/cuts/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !c.featured }),
    });
    setCuts((cs) =>
      cs
        ? cs.map((x) => (x.id === c.id ? { ...x, featured: !x.featured } : x))
        : cs
    );
  }

  function startEdit(c: Cut) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      tags: c.tags,
      src: c.src,
      poster: c.poster,
      duration: c.duration,
      order: c.order,
      featured: c.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-tight">
        Recent cuts<span className="text-ember">.</span>
      </h2>
      <p className="mt-1.5 font-mono text-[9px] tracking-[0.22em] text-ash">
        WHAT THE WORK SECTION SHOWS — UPLOAD VIDEOS &amp; POSTERS DIRECTLY, OR
        PASTE ANY URL
      </p>

      {/* Add / edit form */}
      <form
        onSubmit={save}
        className="mt-6 border border-line bg-panel p-5 sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h3 className="flex items-center gap-2.5 font-condensed text-sm font-semibold uppercase tracking-[0.18em] text-bone">
            {editingId ? (
              <>
                <Pencil className="h-4 w-4 text-ember" /> Editing cut
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-ember" /> Add a cut
              </>
            )}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...CUT_INITIAL });
              }}
              className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-ash hover:text-ember"
            >
              <X className="h-3 w-3" /> CANCEL
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClass}>Title *</Label>
            <Input
              required
              maxLength={120}
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="Podcast — Clip Pack"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>Tags *</Label>
            <Input
              required
              maxLength={160}
              value={form.tags}
              onChange={(e) => set("tags")(e.target.value)}
              placeholder="Podcast clips · Captions"
              className={fieldClass}
            />
          </div>
          <UploadField
            kind="video"
            label="Video"
            value={form.src}
            onChange={set("src")}
            placeholder="/videos/reel-1.mp4 or https://…"
          />
          <UploadField
            kind="image"
            label="Poster"
            value={form.poster}
            onChange={set("poster")}
            placeholder="/videos/poster-1.jpg or https://…"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClass}>Duration</Label>
              <Input
                maxLength={12}
                value={form.duration}
                onChange={(e) => set("duration")(e.target.value)}
                placeholder="0:30"
                className={cn(fieldClass, "font-mono text-xs")}
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Order</Label>
              <Input
                type="number"
                min={0}
                max={999}
                value={form.order}
                onChange={(e) => set("order")(Number(e.target.value))}
                className={cn(fieldClass, "font-mono text-xs")}
              />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 self-end border border-line bg-[#0e0e0e] px-4 py-2.5">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured")(e.target.checked)}
              className="h-4 w-4 accent-[#ff5c00]"
            />
            <span className="flex items-center gap-2 font-condensed text-[11px] font-medium uppercase tracking-[0.18em] text-ash">
              <Star
                className={cn(
                  "h-3.5 w-3.5",
                  form.featured ? "fill-ember text-ember" : "text-[#5a5a5a]"
                )}
              />
              Featured (plays first)
            </span>
          </label>
        </div>

        {error && (
          <p className="mt-4 border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ember">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2.5 bg-ember px-7 font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember-hot disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editingId ? (
            <>
              <Save className="h-4 w-4" /> Save changes
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add cut
            </>
          )}
        </button>
      </form>

      {/* List */}
      {cuts === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-ember" />
        </div>
      ) : cuts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center border border-dashed border-line py-16 text-center">
          <Film className="h-8 w-8 text-[#3a3a3a]" />
          <p className="mt-4 font-condensed text-sm uppercase tracking-[0.18em] text-ash">
            No cuts yet — add the first one above
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {cuts.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-4 border border-line bg-panel p-4"
            >
              {/* Poster thumbnail */}
              <img
                src={c.poster}
                alt=""
                className="h-16 w-11 shrink-0 border border-line object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] tracking-[0.16em] text-[#5a5a5a]">
                    #{String(c.order).padStart(2, "0")}
                  </span>
                  <h4 className="truncate font-condensed text-sm font-semibold uppercase tracking-wide text-bone">
                    {c.title}
                  </h4>
                  {c.featured && (
                    <span className="flex items-center gap-1 bg-ember px-1.5 py-0.5 font-mono text-[8px] tracking-[0.16em] text-ink">
                      <Star className="h-2.5 w-2.5 fill-ink" /> FEATURED
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-[12px] text-ash">{c.tags}</p>
                <p className="mt-0.5 truncate font-mono text-[9px] text-[#5a5a5a]">
                  {c.src} · {c.duration}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFeatured(c)}
                  title="Toggle featured"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border transition-colors",
                    c.featured
                      ? "border-ember text-ember"
                      : "border-line text-ash hover:border-ember hover:text-ember"
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      c.featured && "fill-ember"
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  title="Edit cut"
                  className="flex h-8 w-8 items-center justify-center border border-line text-ash transition-colors hover:border-ember hover:text-ember"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  title="Delete cut"
                  className="flex h-8 w-8 items-center justify-center border border-line text-ash transition-colors hover:border-ember hover:text-ember"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================ showreel */

function ShowreelPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    showreel_src: "",
    showreel_poster: "",
    showreel_label: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s: Settings = d.settings ?? {};
        setSettings(s);
        setForm({
          showreel_src: s.showreel_src ?? "/videos/reel-2.mp4",
          showreel_poster: s.showreel_poster ?? "/videos/poster-2.jpg",
          showreel_label: s.showreel_label ?? "SHOWREEL — 2026",
        });
      })
      .catch(() => setSettings({}));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Couldn't save the showreel.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (settings === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-tight">
        Showreel<span className="text-ember">.</span>
      </h2>
      <p className="mt-1.5 font-mono text-[9px] tracking-[0.22em] text-ash">
        THE HERO PLAYER ON THE HOMEPAGE — VIDEO, POSTER AND ITS LABEL
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form onSubmit={save} className="border border-line bg-panel p-5 sm:p-6">
          <div className="space-y-4">
            <UploadField
              kind="video"
              label="Showreel video"
              value={form.showreel_src}
              onChange={(url) =>
                setForm((f) => ({ ...f, showreel_src: url }))
              }
              placeholder="/videos/reel-2.mp4 or https://…"
            />
            <UploadField
              kind="image"
              label="Showreel poster"
              value={form.showreel_poster}
              onChange={(url) =>
                setForm((f) => ({ ...f, showreel_poster: url }))
              }
              placeholder="/videos/poster-2.jpg or https://…"
            />
            <div className="space-y-2">
              <Label className={labelClass}>Label *</Label>
              <Input
                required
                minLength={2}
                maxLength={60}
                value={form.showreel_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showreel_label: e.target.value }))
                }
                placeholder="SHOWREEL — 2026"
                className={fieldClass}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ember">
              {error}
            </p>
          )}
          {saved && (
            <p className="mt-4 flex items-center gap-2 border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ember">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Saved — the homepage shows it on the next visit.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2.5 bg-ember px-7 font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember-hot disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save showreel
              </>
            )}
          </button>
        </form>

        {/* Live preview */}
        <div>
          <p className={labelClass}>Preview</p>
          <div className="mx-auto mt-3 aspect-[9/16] max-h-[480px] w-full max-w-[270px] border border-[#262626] bg-panel p-1.5">
            <div className="relative h-full w-full overflow-hidden bg-black">
              {form.showreel_src ? (
                <video
                  key={form.showreel_src}
                  src={form.showreel_src}
                  poster={form.showreel_poster || undefined}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ash">
                  No video URL
                </div>
              )}
              <span className="pointer-events-none absolute left-3 top-3 border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] text-bone backdrop-blur-sm">
                {form.showreel_label || "SHOWREEL — 2026"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[9px] tracking-[0.18em] text-[#6b6b6b]">
            THIS IS EXACTLY WHAT VISITORS SEE IN THE HERO
          </p>
        </div>
      </div>
    </div>
  );
}
