import { getSql } from "@/lib/db";
import { callOpenAI } from "@/lib/openai";

const channels = new Set(["site", "whatsapp", "phone", "email", "manual"]);

const customerSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "language", "intent", "confidence", "b2b", "customerSummary",
    "qualification", "productRouting", "rfqDraft", "appointment",
    "followUp", "replyDraft", "needsHuman", "humanApprovalRequired",
    "escalationReason", "nextAction"
  ],
  properties: {
    language: { type: "string" },
    intent: { type: "string" },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    b2b: { type: "boolean" },
    customerSummary: { type: "string" },
    qualification: {
      type: "object",
      additionalProperties: false,
      required: [
        "company", "country", "customerType", "material", "productInterest",
        "targetQuantity", "targetWeightGrams", "budget", "deliveryCountry",
        "timeline", "customProduction", "missingFields"
      ],
      properties: {
        company: { type: ["string", "null"] },
        country: { type: ["string", "null"] },
        customerType: { type: ["string", "null"] },
        material: { type: ["string", "null"] },
        productInterest: { type: ["string", "null"] },
        targetQuantity: { type: ["string", "null"] },
        targetWeightGrams: { type: ["string", "null"] },
        budget: { type: ["string", "null"] },
        deliveryCountry: { type: ["string", "null"] },
        timeline: { type: ["string", "null"] },
        customProduction: { type: ["boolean", "null"] },
        missingFields: { type: "array", items: { type: "string" } }
      }
    },
    productRouting: { type: "array", items: { type: "string" } },
    rfqDraft: {
      type: "object",
      additionalProperties: false,
      required: ["ready", "summary", "missingFields"],
      properties: {
        ready: { type: "boolean" },
        summary: { type: "string" },
        missingFields: { type: "array", items: { type: "string" } }
      }
    },
    appointment: {
      type: "object",
      additionalProperties: false,
      required: ["requested", "preferredChannel", "note"],
      properties: {
        requested: { type: "boolean" },
        preferredChannel: { type: ["string", "null"] },
        note: { type: ["string", "null"] }
      }
    },
    followUp: {
      type: "object",
      additionalProperties: false,
      required: ["recommended", "timing", "reason"],
      properties: {
        recommended: { type: "boolean" },
        timing: { type: ["string", "null"] },
        reason: { type: ["string", "null"] }
      }
    },
    replyDraft: { type: "string" },
    needsHuman: { type: "boolean" },
    humanApprovalRequired: { type: "boolean" },
    escalationReason: { type: ["string", "null"] },
    nextAction: { type: "string" }
  }
} as const;

const customerVerifySchema = {
  type: "object",
  additionalProperties: false,
  required: ["safe", "score", "warnings", "forceHuman"],
  properties: {
    safe: { type: "boolean" },
    score: { type: "integer", minimum: 0, maximum: 100 },
    warnings: { type: "array", items: { type: "string" } },
    forceHuman: { type: "boolean" }
  }
} as const;

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const expected = process.env.OSKA_INTERNAL_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || actual !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as {
    threadId?: string;
    channel?: string;
    externalCustomerKey?: string;
    message?: string;
    customer?: {
      company?: string;
      contactName?: string;
      country?: string;
      language?: string;
    };
  };

  const channel = cleanText(body.channel);
  const message = cleanText(body.message);
  if (!channel || !channels.has(channel) || !message) {
    return Response.json(
      { ok: false, error: "Valid channel and message are required" },
      { status: 400 },
    );
  }

  const sql = getSql();
  let threadId = cleanText(body.threadId);
  const externalKey = cleanText(body.externalCustomerKey);

  if (threadId) {
    const rows = await sql`SELECT id FROM oska_customer_threads WHERE id = ${threadId}`;
    if (rows.length === 0) {
      return Response.json({ ok: false, error: "THREAD_NOT_FOUND" }, { status: 404 });
    }
  } else if (externalKey) {
    const rows = await sql`
      SELECT id FROM oska_customer_threads
      WHERE channel = ${channel} AND external_customer_key = ${externalKey}
      LIMIT 1
    `;
    threadId = rows[0]?.id ?? null;
  }

  if (!threadId) {
    threadId = crypto.randomUUID();
    await sql`
      INSERT INTO oska_customer_threads (
        id, channel, external_customer_key, company, contact_name, country, language
      ) VALUES (
        ${threadId}, ${channel}, ${externalKey},
        ${cleanText(body.customer?.company)},
        ${cleanText(body.customer?.contactName)},
        ${cleanText(body.customer?.country)},
        ${cleanText(body.customer?.language)}
      )
    `;
  }

  await sql`
    INSERT INTO oska_customer_messages (thread_id, direction, channel, body, metadata)
    VALUES (
      ${threadId}, 'inbound', ${channel}, ${message},
      ${sql.json({ source: "customer-intake-api" })}
    )
  `;

  const historyRows = await sql`
    SELECT direction, body
    FROM oska_customer_messages
    WHERE thread_id = ${threadId}
    ORDER BY created_at DESC
    LIMIT 20
  `;
  const history = [...historyRows]
    .reverse()
    .map((row) => `${row.direction}: ${row.body}`)
    .join("\n");

  const prompt = `You are OSKA CORE's supervised B2B jewelry customer-intake specialist.

Business context:
- OSKA is an Istanbul jewelry designer/manufacturer.
- Core materials: 925 silver, brass/bronze, gold, lab-grown diamond capable.
- Core directions include Panther, Tennis, Chainmail, moving/millemeli styles and custom production.
- Primary commercial use: B2B catalog, RFQ and relationship building.
- Türkiye is important, but customers may be global.
- Never invent stock, price, discount, delivery promise, payment term, production capacity, certification or product availability.
- Never claim a phone number is WhatsApp unless the channel already proves it.
- If the customer asks for price, discount, payment terms, delivery commitment or custom-production commitment, collect the missing facts and prepare an RFQ draft instead of making a commitment.
- Every customer-facing response is only a draft. HUMAN APPROVAL IS REQUIRED before anything is sent.
- If intent is ambiguous or confidence is low, escalate instead of guessing.
- Keep the reply concise, professional and in the customer's language when clear.

Qualification fields to collect when relevant:
company/store, country, buyer type, material, product type/collection, target quantity or gram target, budget/price target, delivery country, timeline, custom-production need.

Conversation:
${history}

Latest inbound message:
${message}

Return a structured analysis and a customer-facing reply draft. humanApprovalRequired must be true.`;

  const result = await callOpenAI({
    model: process.env.OSKA_CUSTOMER_AI_MODEL || process.env.OPENAI_LUNA_MODEL || "gpt-5.6-luna",
    input: prompt,
    jsonSchema: {
      name: "oska_customer_intake",
      description: "Supervised OSKA customer qualification, routing and RFQ drafting result.",
      schema: customerSchema as unknown as Record<string, unknown>,
    },
  });

  const parsed = result.text ? JSON.parse(result.text) : null;
  if (!parsed) {
    return Response.json({ ok: false, error: "EMPTY_AI_RESULT" }, { status: 502 });
  }

  // Server-side hard gate: AI cannot disable approval.
  parsed.humanApprovalRequired = true;

  let verifier = {
    safe: false,
    score: 0,
    warnings: ["Verifier did not run."],
    forceHuman: true,
    model: null as string | null,
    responseId: null as string | null,
  };

  try {
    const verifyResult = await callOpenAI({
      model:
        process.env.OSKA_CUSTOMER_VERIFY_MODEL ||
        process.env.OPENAI_VERIFY_MODEL ||
        "gpt-5.6-luna",
      input: `You are OSKA CORE's independent customer-response verifier.

Review the structured customer analysis and reply draft below.
Hard rules:
- No invented stock, price, discount, delivery date, payment term, certification, production capacity or product availability.
- No commercial commitment may be made without human approval.
- Ambiguous intent, weak confidence, missing core RFQ fields, or a potentially risky promise must force human review.
- The response must stay professional and relevant to a B2B jewelry conversation.
- Human approval is mandatory in all cases; your forceHuman flag is for extra escalation, not permission to auto-send.

Candidate:
${JSON.stringify(parsed, null, 2)}

Return a conservative safety/quality verdict.`,
      jsonSchema: {
        name: "oska_customer_verification",
        description: "Independent safety and quality verdict for an OSKA customer draft.",
        schema: customerVerifySchema as unknown as Record<string, unknown>,
      },
    });

    const verdict = verifyResult.text ? JSON.parse(verifyResult.text) : null;
    if (verdict) {
      verifier = {
        ...verdict,
        model: verifyResult.model,
        responseId: verifyResult.id,
      };
    }
  } catch (error) {
    verifier.warnings = [
      error instanceof Error ? error.message : String(error),
    ];
  }

  if (!verifier.safe || verifier.forceHuman || verifier.score < 80) {
    parsed.needsHuman = true;
    parsed.escalationReason =
      parsed.escalationReason ||
      `Independent verifier escalation: ${verifier.warnings.join("; ") || "low confidence"}`;
  }

  const status =
    parsed.needsHuman ? "waiting_human" :
    parsed.rfqDraft?.ready ? "rfq_draft" :
    parsed.b2b ? "qualified" : "qualifying";

  await sql.begin(async (tx) => {
    await tx`
      UPDATE oska_customer_threads
      SET company = COALESCE(${cleanText(parsed.qualification?.company)}, company),
          country = COALESCE(${cleanText(parsed.qualification?.country)}, country),
          language = COALESCE(${cleanText(parsed.language)}, language),
          b2b = ${Boolean(parsed.b2b)},
          status = ${status},
          last_intent = ${cleanText(parsed.intent)},
          last_summary = ${cleanText(parsed.customerSummary)},
          updated_at = now()
      WHERE id = ${threadId}
    `;

    await tx`
      INSERT INTO oska_customer_messages (thread_id, direction, channel, body, metadata)
      VALUES (
        ${threadId}, 'assistant_draft', ${channel}, ${String(parsed.replyDraft || "")},
        ${tx.json({
          model: result.model,
          responseId: result.id,
          approvalRequired: true,
          confidence: parsed.confidence,
          intent: parsed.intent,
          verifier,
        })}
      )
    `;

    await tx`
      INSERT INTO oska_customer_actions (
        thread_id, action_type, status, approval_required, payload
      ) VALUES (
        ${threadId}, 'reply_draft', 'pending_approval', true,
        ${tx.json({
          channel,
          replyDraft: parsed.replyDraft,
          intent: parsed.intent,
          confidence: parsed.confidence,
          nextAction: parsed.nextAction,
        })}
      )
    `;

    if (parsed.rfqDraft?.ready) {
      await tx`
        INSERT INTO oska_customer_actions (
          thread_id, action_type, status, approval_required, payload
        ) VALUES (
          ${threadId}, 'rfq_draft', 'pending_approval', true,
          ${tx.json(parsed.rfqDraft)}
        )
      `;
    }

    if (parsed.appointment?.requested) {
      await tx`
        INSERT INTO oska_customer_actions (
          thread_id, action_type, status, approval_required, payload
        ) VALUES (
          ${threadId}, 'appointment_request', 'pending_approval', true,
          ${tx.json(parsed.appointment)}
        )
      `;
    }

    if (parsed.followUp?.recommended) {
      await tx`
        INSERT INTO oska_customer_actions (
          thread_id, action_type, status, approval_required, payload
        ) VALUES (
          ${threadId}, 'followup_draft', 'pending_approval', true,
          ${tx.json(parsed.followUp)}
        )
      `;
    }

    if (parsed.needsHuman) {
      await tx`
        INSERT INTO oska_customer_actions (
          thread_id, action_type, status, approval_required, payload
        ) VALUES (
          ${threadId}, 'escalation', 'pending_approval', true,
          ${tx.json({
            reason: parsed.escalationReason,
            summary: parsed.customerSummary,
          })}
        )
      `;
    }
  });

  return Response.json({
    ok: true,
    threadId,
    channel,
    model: result.model,
    analysis: parsed,
    verifier,
    outboundSent: false,
    approvalRequired: true,
  });
}
