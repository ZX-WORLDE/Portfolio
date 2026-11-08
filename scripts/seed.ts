/* Seed the editor's database with the current reels + showreel setting. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CUTS = [
  {
    title: "Mindset Podcast — Clip Pack",
    tags: "Podcast clips · Kinetic captions",
    src: "/videos/reel-2.mp4",
    poster: "/videos/poster-2.jpg",
    duration: "0:11",
    featured: true,
    order: 0,
  },
  {
    title: "UGC Ad Spot — Conversion Edit",
    tags: "UGC ad · Screen capture · CTA",
    src: "/videos/reel-1.mp4",
    poster: "/videos/poster-1.jpg",
    duration: "0:51",
    featured: false,
    order: 1,
  },
  {
    title: "Relationship Podcast — Cinematic Cut",
    tags: "Podcast · B-roll · Warm grade",
    src: "/videos/reel-3.mp4",
    poster: "/videos/poster-3.jpg",
    duration: "0:29",
    featured: false,
    order: 2,
  },
];

const SETTINGS = [
  { key: "showreel_src", value: "/videos/reel-2.mp4" },
  { key: "showreel_poster", value: "/videos/poster-2.jpg" },
  { key: "showreel_label", value: "SHOWREEL — 2026" },
];

async function main() {
  const cutCount = await db.cut.count();
  if (cutCount === 0) {
    await db.cut.createMany({ data: CUTS });
    console.log(`Seeded ${CUTS.length} cuts`);
  } else {
    console.log(`Cuts already present (${cutCount}) — skipped`);
  }

  for (const s of SETTINGS) {
    await db.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("Settings ensured");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
