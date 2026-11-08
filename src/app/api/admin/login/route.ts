import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  clearAttempts,
  createToken,
  recordAttempt,
  tooManyAttempts,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in 10 minutes." },
      { status: 429 }
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  /* Production without ADMIN_PASSWORD configured → locked, by design. */
  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin is locked: set the ADMIN_PASSWORD environment variable in your hosting dashboard, then redeploy.",
      },
      { status: 503 }
    );
  }

  if (!checkPassword(password)) {
    recordAttempt(ip);
    return NextResponse.json(
      { ok: false, error: "Wrong password." },
      { status: 401 }
    );
  }

  clearAttempts(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
