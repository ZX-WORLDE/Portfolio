import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { promises as fsp } from "fs";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import path from "path";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_TYPES,
  localUrlFor,
  safeStoredName,
  uploadMode,
  uploadsDir,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin media upload endpoint — three responsibilities:
 *
 *  GET   → tells the admin UI which backend is live
 *          ("blob" on Vercel with BLOB_READ_WRITE_TOKEN, else "local").
 *  POST (multipart/form-data) → local-disk upload: file + kind field.
 *          Streams to disk (no full buffering), validates extension +
 *          size, generates a traversal-proof stored name.
 *  POST (application/json)    → Vercel Blob client-token protocol used by
 *          @vercel/blob/client's upload(). The browser then streams the
 *          file straight to Blob storage, bypassing the serverless
 *          request-body limit entirely.
 *
 * Every method requires a valid admin session cookie.
 */

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

/** Kind-specific limits shared by both upload paths. */
function limitsFor(kind: string | null) {
  if (kind === "image") {
    return {
      allowedContentTypes: Object.values(IMAGE_TYPES),
      maximumSizeInBytes: MAX_IMAGE_BYTES,
    };
  }
  return {
    allowedContentTypes: Object.values(VIDEO_TYPES),
    maximumSizeInBytes: MAX_VIDEO_BYTES,
  };
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  return NextResponse.json({
    ok: true,
    mode: uploadMode(),
    vercel: process.env.VERCEL === "1",
  });
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const contentType = req.headers.get("content-type") ?? "";

  /* ---- Vercel Blob client-upload protocol (JSON body) ---- */
  if (contentType.includes("application/json")) {
    if (uploadMode() !== "blob") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Blob storage is not configured — set BLOB_READ_WRITE_TOKEN (see Storage → Blob in your Vercel dashboard).",
        },
        { status: 503 }
      );
    }
    const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid upload request." },
        { status: 400 }
      );
    }
    try {
      const json = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (_pathname, clientPayload) => {
          let kind: string | null = null;
          try {
            const parsed = JSON.parse(clientPayload ?? "null") as {
              kind?: string;
            } | null;
            kind = parsed?.kind ?? null;
          } catch {
            /* unknown payload → default (video) limits */
          }
          return limitsFor(kind);
        },
      });
      return NextResponse.json(json);
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error:
            err instanceof Error ? err.message : "Upload token generation failed.",
        },
        { status: 400 }
      );
    }
  }

  /* ---- Local-disk upload (multipart form: file + kind) ---- */
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload request." },
      { status: 400 }
    );
  }

  const kind = form.get("kind") === "image" ? "image" : "video";
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No file received." },
      { status: 400 }
    );
  }

  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        ok: false,
        error: `File exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB limit.`,
      },
      { status: 413 }
    );
  }

  const storedName = safeStoredName(file.name, kind);
  if (!storedName) {
    return NextResponse.json(
      {
        ok: false,
        error:
          kind === "image"
            ? "Unsupported image — use JPG, PNG or WebP."
            : "Unsupported video — use MP4, WebM or MOV.",
      },
      { status: 415 }
    );
  }

  const dest = path.join(uploadsDir(), storedName);
  try {
    await fsp.mkdir(uploadsDir(), { recursive: true });
    /* Stream to disk — never buffer a 200MB upload in memory. */
    await pipeline(
      Readable.fromWeb(
        file.stream() as unknown as NodeWebReadableStream<Uint8Array>
      ),
      createWriteStream(dest)
    );
  } catch (err) {
    console.error("Upload write failed:", err);
    await fsp.rm(dest, { force: true }).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "Could not save the file — try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, url: localUrlFor(storedName) });
}
