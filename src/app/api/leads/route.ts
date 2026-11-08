import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/lib/db";
import {
  leadSchema,
  buildWhatsAppUrl,
} from "@/app/api/leads/lead-utils";

export async function POST(req: NextRequest) {
  try {
    const parsed = leadSchema.safeParse(await req.json());
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

    const { name, email, whatsapp, company, projectType, budget, message } =
      parsed.data;

    await ensureDb();
    const lead = await db.lead.create({
      data: {
        name,
        email,
        whatsapp,
        company: company || null,
        projectType,
        budget: budget || null,
        message: message || null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        waUrl: buildWhatsAppUrl(lead),
        receivedAt: lead.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Lead creation failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
