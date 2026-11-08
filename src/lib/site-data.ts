import { db, ensureDb } from "@/lib/db";

export type PublicCut = {
  id: string;
  title: string;
  tags: string;
  src: string;
  poster: string;
  duration: string;
  featured: boolean;
};

export type Showreel = { src: string; poster: string; label: string };

export const FALLBACK_CUTS: PublicCut[] = [
  {
    id: "reel-2",
    title: "Mindset Podcast — Clip Pack",
    tags: "Podcast clips · Kinetic captions",
    src: "/videos/reel-2.mp4",
    poster: "/videos/poster-2.jpg",
    duration: "0:11",
    featured: true,
  },
  {
    id: "reel-1",
    title: "UGC Ad Spot — Conversion Edit",
    tags: "UGC ad · Screen capture · CTA",
    src: "/videos/reel-1.mp4",
    poster: "/videos/poster-1.jpg",
    duration: "0:51",
    featured: false,
  },
  {
    id: "reel-3",
    title: "Relationship Podcast — Cinematic Cut",
    tags: "Podcast · B-roll · Warm grade",
    src: "/videos/reel-3.mp4",
    poster: "/videos/poster-3.jpg",
    duration: "0:29",
    featured: false,
  },
];

export const FALLBACK_SHOWREEL: Showreel = {
  src: "/videos/reel-2.mp4",
  poster: "/videos/poster-2.jpg",
  label: "SHOWREEL — 2026",
};

const SETTING_KEYS = ["showreel_src", "showreel_poster", "showreel_label"];

/** Server-side fetch for the public page — falls back to the static reels. */
export async function getSiteData(): Promise<{
  cuts: PublicCut[];
  showreel: Showreel;
}> {
  try {
    await ensureDb();
    const [cuts, rows] = await Promise.all([
      db.cut.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
      db.setting.findMany({ where: { key: { in: SETTING_KEYS } } }),
    ]);
    const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const showreel: Showreel = {
      src: s.showreel_src || FALLBACK_SHOWREEL.src,
      poster: s.showreel_poster || FALLBACK_SHOWREEL.poster,
      label: s.showreel_label || FALLBACK_SHOWREEL.label,
    };
    return {
      cuts: cuts.length
        ? cuts.map((c) => ({
            id: c.id,
            title: c.title,
            tags: c.tags,
            src: c.src,
            poster: c.poster,
            duration: c.duration,
            featured: c.featured,
          }))
        : FALLBACK_CUTS,
      showreel,
    };
  } catch {
    return { cuts: FALLBACK_CUTS, showreel: FALLBACK_SHOWREEL };
  }
}
