import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureDb } from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

const patchSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120).optional(),
  tags: z.string().trim().min(2, "Tags are required").max(160).optional(),
  src: z.string().trim().min(3, "Video URL is required").max(500).optional(),
  poster: z.string().trim().min(3, "Poster URL is required").max(500).optional(),
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid cut" },
      { status: 400 }
    );
  }
  const { title, tags, src, poster, duration, featured, order } = parsed.data;
  try {
    await ensureDb();
    const cut = await db.cut.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(tags !== undefined && { tags }),
        ...(src !== undefined && { src }),
        ...(poster !== undefined && { poster }),
        ...(duration !== undefined && { duration: duration || undefined }),
        ...(featured !== undefined && { featured }),
        ...(order !== undefined && { order }),
      },
    });
    return NextResponse.json({ ok: true, cut });
  } catch (err) {
    return serverError("Admin cut PATCH", err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const { id } = await params;
  try {
    await ensureDb();
    await db.cut.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError("Admin cut DELETE", err);
  }
}
