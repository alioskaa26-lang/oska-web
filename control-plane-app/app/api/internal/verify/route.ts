import { callOpenAI } from "@/lib/openai";

const verifySchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "score", "reasons", "verifiedUrls", "warnings"],
  properties: {
    ok: { type: "boolean" },
    score: { type: "integer", minimum: 0, maximum: 100 },
    reasons: { type: "array", items: { type: "string" } },
    verifiedUrls: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } }
  }
} as const;

export async function POST(request: Request) {
  const expected = process.env.OSKA_INTERNAL_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || actual !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { ok: false, error: "OPENAI_API_KEY_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const input = await request.json();
  const model = process.env.OPENAI_VERIFY_MODEL || "gpt-5.6-luna";

  const jobType = input?.job?.type || "unknown";
  const marketingTypes = new Set(["market_research", "content_brief", "visibility_audit"]);
  const taskRules = marketingTypes.has(jobType)
    ? `- Verify material factual claims and cited URLs independently.
- Reject invented trends, metrics, competitor facts or demand claims.
- Distinguish evidence-backed findings from creative recommendations.
- No publishing, ad spend, customer contact or external commitment is authorized by this verification.`
    : `- Reject invented or unsupported company/contact facts.
- A phone number is not WhatsApp unless a public source explicitly proves WhatsApp.
- A named buyer/decision maker must be current enough to be commercially useful.
- For a positive verdict, core company identity/domain/fit must be supported.`;

  const prompt = `You are the independent verifier for the OSKA Silver control plane.

Verify the supplied worker result independently using current web evidence.
Job type: ${jobType}

Hard rules:
- Do not trust the worker result merely because it is present.
- Prefer official/primary sources and strong current public evidence.
- Reject unsupported factual claims.
- Do not contact anyone, publish anything, spend money or make external commitments.
${taskRules}

Input:
${JSON.stringify(input, null, 2)}

Return a conservative verification result.`;

  try {
    const result = await callOpenAI({
      model,
      input: prompt,
      webSearch: true,
      jsonSchema: {
        name: "oska_verification",
        description: "Independent verification verdict for an OSKA lead research job.",
        schema: verifySchema as unknown as Record<string, unknown>,
      },
    });

    const parsed = result.text ? JSON.parse(result.text) : null;
    return Response.json({
      verifier: "openai-independent-web-verifier",
      model: result.model,
      responseId: result.id,
      ...parsed,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        score: 0,
        reasons: [],
        verifiedUrls: [],
        warnings: [error instanceof Error ? error.message : String(error)],
      },
      { status: 502 },
    );
  }
}
