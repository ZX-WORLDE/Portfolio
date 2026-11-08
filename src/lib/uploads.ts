import path from "path";

/**
 * Shared upload plumbing for the admin panel.
 *
 * Two storage backends:
 * - "blob"  → Vercel Blob (production on Vercel; needs BLOB_READ_WRITE_TOKEN).
 *             The browser streams files straight to Blob storage, so the
 *             4.5MB serverless request-body limit never applies.
 * - "local" → writable disk (sandbox / self-hosted). Files land in UPLOADS_DIR
 *             and are served through /api/uploads/<name> with Range support.
 */

export const VIDEO_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function uploadMode(): "blob" | "local" {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

/** Where local-mode files live. Writable on every target platform. */
export function uploadsDir(): string {
  if (process.env.UPLOADS_DIR) return path.resolve(process.env.UPLOADS_DIR);
  if (process.env.VERCEL === "1") return path.join("/tmp", "uploads");
  return path.join(process.cwd(), "uploads");
}

/** Collision-free, traversal-proof stored name: 1730981234-a3f9c2-my-reel.mp4 */
export function safeStoredName(
  originalName: string,
  kind: "video" | "image"
): string | null {
  const ext = path.extname(originalName).toLowerCase();
  const table = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  if (!table[ext]) return null;
  const base =
    path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "file";
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${Date.now()}-${rand}-${base}${ext}`;
}

export function contentTypeFor(ext: string): string | null {
  return VIDEO_TYPES[ext] ?? IMAGE_TYPES[ext] ?? null;
}

/** The URL a locally-stored file is served from. */
export function localUrlFor(storedName: string): string {
  return `/api/uploads/${storedName}`;
}
