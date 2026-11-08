import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureDb } from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

const ALLOWED_KEYS = ["showreel_src", "showreel_poster", "showreel_label"];

const putSchema = z.object({
  showreel_src: z.string().trim().min(3).max(500).optional(),
  showreel_poster: z.string().trim().min(3).max(500).optional(),
  showreel_label: z.string().trim().min(2).max(60).optional(),
});

function serverError(where: string, err: unknown) {
  console.error(`${where} failed:`, err);
  return NextResponse.json(
    { ok: false, error: "Database unavailable — please retry in a moment." },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDb();
    const rows = await db.setting.findMany({
      where: { key: { in: ALLOWED_KEYS } },
    });
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    return serverError("Admin settings GET", err);
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const parsed = putSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" },
      { status: 400 }
    );
  }
  try {
    await ensureDb();
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    const rows = await db.setting.findMany({
      where: { key: { in: ALLOWED_KEYS } },
    });
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    return serverError("Admin settings PUT", err);
  }
}
