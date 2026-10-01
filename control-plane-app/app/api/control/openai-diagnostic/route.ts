import { callOpenAI } from "@/lib/openai";

export async function GET() {
  try {
    const result = await callOpenAI({
      model: process.env.OPENAI_TERRA_MODEL || "gpt-5.6-terra",
      input: "Search the web for the official OpenAI homepage and return one sentence confirming it.",
      webSearch: true,
    });
    return Response.json({
      ok: true,
      model: result.model,
      responseId: result.id,
      text: result.text,
    });
  } catch (error) {
    console.error("OPENAI_DIAGNOSTIC_ERROR", error instanceof Error ? error.message : String(error));
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 502 });
  }
}
