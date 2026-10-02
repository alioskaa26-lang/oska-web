export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "VOICE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const text = String(body?.text || "").trim().slice(0, 2200);
    if (!text) {
      return Response.json({ error: "TEXT_REQUIRED" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "shimmer",
        input: text,
        instructions:
          "Speak fluent Turkish in a refined adult Russian woman's voice with a subtle natural Russian accent. " +
          "Sound elegant, calm, warm, confident and futuristic, like a premium AI assistant. " +
          "Do not exaggerate the accent. Pronounce Turkish clearly. Address the user as 'Ali Bey' naturally.",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("JARVES_VOICE_ERROR", response.status, detail.slice(0, 500));
      return Response.json({ error: "VOICE_GENERATION_FAILED" }, { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("JARVES_VOICE_EXCEPTION", error);
    return Response.json({ error: "VOICE_EXCEPTION" }, { status: 500 });
  }
}
