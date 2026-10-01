import { callOpenAI } from "@/lib/openai";

export async function GET() {
  try {
    const result = await callOpenAI({
      model: process.env.OPENAI_LUNA_MODEL || "gpt-5.6-luna",
      input: "Search the web for the official OpenAI homepage and return ok=true plus a short note.",
      webSearch: true,
      jsonSchema: {
        name: "oska_openai_canary",
        description: "Minimal OpenAI web-search canary.",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["ok", "note"],
          properties: {
            ok: { type: "boolean" },
            note: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      ok: true,
      model: result.model,
      responseId: result.id,
      text: result.text,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
