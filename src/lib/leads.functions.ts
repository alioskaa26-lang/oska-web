import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Lead intake for the wholesale RFQ and the catalogue request.
 *
 * Delivery is CONFIGURABLE: set LEADS_WEBHOOK_URL (for example an n8n webhook)
 * and the payload is forwarded there. Without it, the submission is validated
 * and logged only, and the UI tells the visitor that automatic delivery is not
 * connected yet. No endpoint is invented and no delivery is claimed.
 */
const leadSchema = z.object({
  kind: z.enum(["rfq", "catalogue"]),
  fullName: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  country: z.string().trim().max(120).optional().default(""),
  material: z.string().trim().max(80).optional().default(""),
  quantity: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  design: z.string().trim().max(200).optional().default(""),
  lang: z.enum(["en", "tr"]).default("en"),
  /** Anti-spam honeypot: must stay empty. */
  website: z.string().max(200).optional().default(""),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadResult = { status: "delivered" | "recorded" };

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }): Promise<LeadResult> => {
    // Honeypot filled -> silently accept without forwarding.
    if (data.website) return { status: "recorded" };

    const webhook = process.env["LEADS_WEBHOOK_URL"];
    const payload = {
      ...data,
      website: undefined,
      source: "oska-staging",
      receivedAt: new Date().toISOString(),
    };

    if (!webhook) {
      console.info("[lead] no LEADS_WEBHOOK_URL configured, recorded only:", {
        kind: payload.kind,
        company: payload.company,
      });
      return { status: "recorded" };
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`[lead] delivery failed [${response.status}]`);
      throw new Error(`Lead delivery failed [${response.status}]`);
    }
    return { status: "delivered" };
  });