import { PrismaClient } from '@prisma/client'

/**
 * Portable Prisma client resolution:
 * 1. An explicit DATABASE_URL always wins (local .env, or any value set in
 *    the Vercel dashboard).
 * 2. On Vercel the deployment filesystem is read-only — the only writable
 *    location is /tmp, so a fresh, auto-seeded SQLite database lives there.
 * 3. Elsewhere (local dev / self-hosted) the db file sits in <project>/db.
 */
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.VERCEL === "1") return "file:/tmp/behind-the-cut.db";
  return `file:${process.cwd()}/db/custom.db`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Runtime schema + seed bootstrap. Runs at most once per server process;
 * safe to `await ensureDb()` at the top of any route or server helper.
 * - CREATE TABLE IF NOT EXISTS → idempotent on every platform.
 * - Seeds use fixed primary keys with INSERT OR IGNORE → no duplicates,
 *   even across concurrent cold starts.
 */
let ready: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = bootstrap().catch((err) => {
      ready = null; // allow a retry on the next request
      throw err;
    });
  }
  return ready;
}

async function bootstrap() {
  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Booking" (
       "id"          TEXT     NOT NULL PRIMARY KEY,
       "name"        TEXT     NOT NULL,
       "email"       TEXT     NOT NULL,
       "company"     TEXT,
       "projectType" TEXT     NOT NULL,
       "budget"      TEXT,
       "message"     TEXT,
       "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIME
     )`
  );
  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Lead" (
       "id"          TEXT     NOT NULL PRIMARY KEY,
       "name"        TEXT     NOT NULL,
       "email"       TEXT     NOT NULL,
       "whatsapp"    TEXT     NOT NULL,
       "company"     TEXT,
       "projectType" TEXT     NOT NULL,
       "budget"      TEXT,
       "message"     TEXT,
       "status"      TEXT     NOT NULL DEFAULT 'NEW',
       "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIME
     )`
  );
  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Cut" (
       "id"        TEXT     NOT NULL PRIMARY KEY,
       "title"     TEXT     NOT NULL,
       "tags"      TEXT     NOT NULL,
       "src"       TEXT     NOT NULL,
       "poster"    TEXT     NOT NULL,
       "duration"  TEXT     NOT NULL DEFAULT '0:30',
       "featured"  BOOLEAN  NOT NULL DEFAULT false,
       "order"     INTEGER  NOT NULL DEFAULT 0,
       "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIME
     )`
  );
  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Setting" (
       "key"   TEXT NOT NULL PRIMARY KEY,
       "value" TEXT NOT NULL
     )`
  );

  /* Seed the studio defaults so a fresh database (Vercel /tmp or a new
     clone) still shows the reel and a manageable Work section.
     Settings are key-seeded (INSERT OR IGNORE — never duplicates);
     cuts are seeded only when the table is empty. */
  await db.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "Setting" ("key", "value") VALUES
       ('showreel_src',    '/videos/reel-2.mp4'),
       ('showreel_poster', '/videos/poster-2.jpg'),
       ('showreel_label',  'SHOWREEL — 2026')`
  );

  if ((await db.cut.count()) === 0) {
    const now = new Date().toISOString();
    const seedCuts: Array<{
      id: string; title: string; tags: string; src: string;
      poster: string; duration: string; featured: number; order: number;
    }> = [
      { id: "seed-reel-2", title: "Mindset Podcast — Clip Pack", tags: "Podcast clips · Kinetic captions", src: "/videos/reel-2.mp4", poster: "/videos/poster-2.jpg", duration: "0:11", featured: 1, order: 0 },
      { id: "seed-reel-1", title: "UGC Ad Spot — Conversion Edit", tags: "UGC ad · Screen capture · CTA", src: "/videos/reel-1.mp4", poster: "/videos/poster-1.jpg", duration: "0:51", featured: 0, order: 1 },
      { id: "seed-reel-3", title: "Relationship Podcast — Cinematic Cut", tags: "Podcast · B-roll · Warm grade", src: "/videos/reel-3.mp4", poster: "/videos/poster-3.jpg", duration: "0:29", featured: 0, order: 2 },
    ];
    for (const c of seedCuts) {
      await db.$executeRawUnsafe(
        `INSERT OR IGNORE INTO "Cut"
             ("id", "title", "tags", "src", "poster", "duration", "featured", "order", "createdAt")
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id, c.title, c.tags, c.src, c.poster, c.duration, c.featured, c.order, now
      );
    }
  }
}
