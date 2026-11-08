import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureDb } from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

export const cutSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  tags: z.string().trim().min(2, "Tags are required").max(160),
  src: z.string().trim().min(3, "Video URL is required").max(500),
  poster: z.string().trim().min(3, "Poster URL is required").max(500),
  duration: z.string().trim().max(12).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).max(999).optional(),
});

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

function serverError(where: string, err: unknown) {
  console.error(`${where} failed:`, err);
  return NextResponse.json(
    { ok: false, error: "Database unavailable — please retry in a moment." },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  try {
    await ensureDb();
    const cuts = await db.cut.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, cuts });
  } catch (err) {
    return serverError("Admin cuts GET", err);
  }
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const parsed = cutSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid cut" },
      { status: 400 }
    );
  }
  const { title, tags, src, poster, duration, featured, order } = parsed.data;
  try {
    await ensureDb();
    const cut = await db.cut.create({
      data: {
        title,
        tags,
        src,
        poster,
        duration: duration || "0:30",
        featured: featured ?? false,
        order: order ?? 99,
      },
    });
    return NextResponse.json({ ok: true, cut }, { status: 201 });
  } catch (err) {
    return serverError("Admin cuts POST", err);
  }
}
