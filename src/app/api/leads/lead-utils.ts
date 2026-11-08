import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20)
    .regex(/^[+]?[\d\s()-]+$/, "Digits, spaces and + only"),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  projectType: z.enum([
    "social",
    "commercial",
    "documentary",
    "music-video",
    "other",
  ]),
  budget: z
    .enum(["<2k", "2-5k", "5-15k", "15k+", "not-sure"])
    .optional()
    .or(z.literal("")),
  message: z.string().trim().max(1200).optional().or(z.literal("")),
});

export const TYPE_LABELS: Record<string, string> = {
  social: "Short-form / Social",
  commercial: "Commercial / Ad",
  documentary: "Long-form / YouTube",
  "music-video": "Music video",
  other: "Something else",
};

export const BUDGET_LABELS: Record<string, string> = {
  "<2k": "Under $2K",
  "2-5k": "$2K – $5K",
  "5-15k": "$5K – $15K",
  "15k+": "$15K+",
  "not-sure": "Not sure yet",
};

/* Builds the pre-filled WhatsApp handoff from a stored brief. */
export function buildWhatsAppUrl(lead: {
  name: string;
  email: string;
  whatsapp: string;
  company?: string | null;
  projectType: string;
  budget?: string | null;
  message?: string | null;
  id: string;
}): string {
  const number = (process.env.WHATSAPP_NUMBER || "8801782017981").replace(
    /\D/g,
    ""
  );
  const lines = [
    "NEW PROJECT BRIEF — BEHIND THE CUT",
    "--------------------------------",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp}`,
    lead.company ? `Brand / Project: ${lead.company}` : null,
    `Project type: ${TYPE_LABELS[lead.projectType] ?? lead.projectType}`,
    lead.budget ? `Budget: ${BUDGET_LABELS[lead.budget] ?? lead.budget}` : null,
    "--------------------------------",
    "The footage:",
    lead.message || "(no extra details)",
    "--------------------------------",
    `REF: ${lead.id.toUpperCase().slice(-8)}`,
    "(Sent from the portfolio brief)",
  ].filter(Boolean);
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
