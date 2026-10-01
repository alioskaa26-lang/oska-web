type OpenAIResponse = {
  id?: string;
  status?: string;
  model?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: unknown[];
    }>;
  }>;
  error?: { message?: string; code?: string };
};

export function extractOutputText(response: OpenAIResponse): string {
  const parts: string[] = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

export async function callOpenAI(args: {
  model: string;
  input: string;
  webSearch?: boolean;
  jsonSchema?: {
    name: string;
    description?: string;
    schema: Record<string, unknown>;
  };
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");

  const body: Record<string, unknown> = {
    model: args.model,
    input: args.input,
  };

  if (args.webSearch) {
    body.tools = [{ type: "web_search", search_context_size: "medium" }];
  }

  if (args.jsonSchema) {
    body.text = {
      format: {
        type: "json_schema",
        name: args.jsonSchema.name,
        description: args.jsonSchema.description,
        strict: true,
        schema: args.jsonSchema.schema,
      },
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(
      `OPENAI_HTTP_${response.status}:${data.error?.message ?? JSON.stringify(data).slice(0, 600)}`,
    );
  }

  const text = extractOutputText(data);
  return {
    id: data.id ?? null,
    status: data.status ?? null,
    model: data.model ?? args.model,
    text,
    raw: data,
  };
}
