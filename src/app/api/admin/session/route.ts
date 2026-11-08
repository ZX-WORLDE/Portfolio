import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authed = verifyToken(req.cookies.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ ok: true, authed });
}
