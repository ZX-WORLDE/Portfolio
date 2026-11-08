import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

const STATUSES = ["NEW", "REPLIED", "WON", "CLOSED"];

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
  const { status } = (await req.json().catch(() => ({}))) as {
    status?: string;
  };
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }
  try {
    await ensureDb();
    const lead = await db.lead.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    return serverError("Admin lead PATCH", err);
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
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError("Admin lead DELETE", err);
  }
}
