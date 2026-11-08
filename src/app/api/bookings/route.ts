import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureDb } from "@/lib/db";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  projectType: z.enum([
    "commercial",
    "music-video",
    "documentary",
    "social",
    "other",
  ]),
  budget: z
    .enum(["<2k", "2-5k", "5-15k", "15k+", "not-sure"])
    .optional()
    .or(z.literal("")),
  message: z.string().trim().max(1200).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsed.error.issues[0]?.message ?? "Please check the form fields.",
        },
        { status: 400 }
      );
    }

    const { name, email, company, projectType, budget, message } = parsed.data;

    await ensureDb();
    const booking = await db.booking.create({
      data: {
        name,
        email,
        company: company || null,
        projectType,
        budget: budget || null,
        message: message || null,
      },
    });

    return NextResponse.json(
      { ok: true, id: booking.id, receivedAt: booking.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking creation failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
