export async function GET() {
  const host = process.env.RAILWAY_PUBLIC_DOMAIN;
  const token = process.env.OSKA_INTERNAL_TOKEN;
  if (!host || !token) {
    return Response.json({ ok: false, error: "RUNTIME_CONFIG_MISSING" }, { status: 503 });
  }

  const response = await fetch(`https://${host}/api/internal/dispatch`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "x-oska-provider": "chatgpt-web",
      "x-oska-idempotency-key": "dispatch-canary-careofcarl-v1",
    },
    body: JSON.stringify({
      jobId: "dispatch-canary-careofcarl-v1",
      type: "lead_verify",
      payload: {
        company: "Care of Carl",
        domain: "careofcarl.com",
        country: "Sweden",
        goal: "Verify current B2B fit for premium 925 silver jewelry and current public decision-maker/contact evidence. Do not invent any contact details."
      }
    }),
    signal: AbortSignal.timeout(120000),
  });

  const text = await response.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }

  return Response.json({
    ok: response.ok,
    dispatcherStatus: response.status,
    dispatcherBody: body,
  }, { status: response.ok ? 200 : 502 });
}
