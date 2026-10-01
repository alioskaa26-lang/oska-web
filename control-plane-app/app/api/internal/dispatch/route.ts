import { callOpenAI } from "@/lib/openai";

const leadSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "jobType", "summary", "leads", "evidence"],
  properties: {
    ok: { type: "boolean" },
    jobType: { type: "string" },
    summary: { type: "string" },
    leads: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "company", "domain", "country", "category", "material",
          "decisionMaker", "role", "email", "phoneWhatsapp",
          "signals", "sourceUrls"
        ],
        properties: {
          company: { type: ["string", "null"] },
          domain: { type: ["string", "null"] },
          country: { type: ["string", "null"] },
          category: { type: ["string", "null"] },
          material: { type: ["string", "null"] },
          decisionMaker: { type: ["string", "null"] },
          role: { type: ["string", "null"] },
          email: { type: ["string", "null"] },
          phoneWhatsapp: { type: ["string", "null"] },
          signals: { type: "array", items: { type: "string" } },
          sourceUrls: { type: "array", items: { type: "string" } }
        }
      }
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["url", "title", "claim"],
        properties: {
          url: { type: "string" },
          title: { type: "string" },
          claim: { type: "string" }
        }
      }
    }
  }
} as const;

function buildPrompt(job: any, provider: string) {
  const coreRules = [
    "You are an OSKA Silver B2B lead research worker.",
    "Priority: Türkiye first, then global.",
    "Focus on premium 925 silver and brass/bronze jewelry opportunities.",
    "Strong signals: ecommerce strength, high retail pricing, stock/replenishment, international shipping, wholesale/distributor/buyer/sourcing relevance.",
    "Do not invent emails, WhatsApp numbers, decision makers, domains, or evidence.",
    "A normal phone number must not be labelled WhatsApp unless a public source explicitly proves WhatsApp.",
    "Prefer official company sites, official contact/vendor pages, reputable business profiles, and current sources.",
    "Return only evidence you can support with URLs.",
    "Do not send any message or contact anyone."
  ].join("\n");

  return `${coreRules}

Provider route requested: ${provider}
Job ID: ${job.jobId}
Job type: ${job.type}
Payload:
${JSON.stringify(job.payload, null, 2)}

Perform the requested research now. For lead_discovery, return strong B2B prospects. For lead_verify, verify the supplied company and commercial fit. For contact_enrich, find public official company contact details and named buyer/procurement/merchandising/sourcing/leadership contacts where available.`;
}

async function openAIProvider(job: any, provider: string) {
  const model =
    provider === "openai-sol"
      ? (process.env.OPENAI_SOL_MODEL || "gpt-5.6-sol")
      : provider === "openai-luna"
        ? (process.env.OPENAI_LUNA_MODEL || "gpt-5.6-luna")
        : (process.env.OPENAI_TERRA_MODEL || "gpt-5.6-terra");

  const result = await callOpenAI({
    model,
    input: buildPrompt(job, provider),
    webSearch: true,
    jsonSchema: {
      name: "oska_lead_research",
      description: "Evidence-grounded OSKA lead discovery, verification or contact enrichment result.",
      schema: leadSchema as unknown as Record<string, unknown>,
    },
  });

  const parsed = result.text ? JSON.parse(result.text) : null;
  return {
    backend: "openai-responses-web-search",
    provider,
    model: result.model,
    responseId: result.id,
    ...parsed,
  };
}

function notConfigured(provider: string, variable: string) {
  return Response.json(
    { ok: false, provider, error: `${provider.toUpperCase().replaceAll("-", "_")}_NOT_CONFIGURED`, missing: variable },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  const expected = process.env.OSKA_INTERNAL_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || actual !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const provider = request.headers.get("x-oska-provider") || "openai-terra";
  const job = await request.json();

  try {
    if (provider === "chatgpt-web" || provider === "openai-terra" || provider === "openai-sol" || provider === "openai-luna") {
      if (!process.env.OPENAI_API_KEY) return notConfigured(provider, "OPENAI_API_KEY");
      const data = await openAIProvider(job, provider === "chatgpt-web" ? "openai-terra" : provider);
      return Response.json({ ok: true, ...data });
    }

    if (provider === "parallel-search") {
      return notConfigured(provider, "PARALLEL_API_KEY");
    }

    if (provider === "tinyfish") {
      return notConfigured(provider, "TINYFISH_API_KEY");
    }

    if (provider === "exa") {
      return notConfigured(provider, "EXA_API_KEY");
    }

    return Response.json({ ok: false, provider, error: "UNKNOWN_PROVIDER" }, { status: 400 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        provider,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
