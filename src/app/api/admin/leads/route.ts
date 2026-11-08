import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDb();
    const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    console.error("Admin leads GET failed:", err);
    return NextResponse.json(
      { ok: false, error: "Database unavailable — please retry in a moment." },
      { status: 503 }
    );
  }
}
