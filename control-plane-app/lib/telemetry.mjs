// Optional telemetry, disabled by default. Never send raw lead, buyer, prompt or secret.
let sentry;
let tracing;
let otelSdk;
let initialized = false;
const nameOnly = value => String(value || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0,80);

export async function initOskaTelemetry(service = "oska-worker") {
  if (initialized) return { enabled:Boolean(sentry || tracing) };
  initialized = true;
  if (process.env.OSKA_TELEMETRY_ENABLED !== "true") return { enabled:false,reason:"OWNER_GATE_OFF" };

  if (process.env.SENTRY_DSN && process.env.OSKA_SENTRY_ENABLED === "true") {
    const sdk = await import("@sentry/node");
    sdk.init({
      dsn:process.env.SENTRY_DSN,
      environment:process.env.NODE_ENV || "preview",
      release:process.env.OSKA_RUNTIME_REV || undefined,
      sendDefaultPii:false,
      tracesSampleRate:0,
      beforeSend(event) {
        delete event.request;
        delete event.user;
        event.breadcrumbs = [];
        event.extra = {};
        event.contexts = {};
        return event;
      },
    });
    sentry = sdk;
  }
  if (process.env.OSKA_LANGFUSE_ENABLED === "true" &&
      process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { LangfuseSpanProcessor } = await import("@langfuse/otel");
    tracing = await import("@langfuse/tracing");
    otelSdk = new NodeSDK({
      spanProcessors:[new LangfuseSpanProcessor()],
    });
    otelSdk.start();
  }
  return {enabled:Boolean(sentry || tracing),sentry:Boolean(sentry),langfuse:Boolean(tracing),service:nameOnly(service)};
}

export function reportSafeFailure(kind, stage = "unknown") {
  // Never pass the raw error object, evidence URL, company, email or payload.
  if (!sentry) return;
  sentry.captureMessage("OSKA_" + nameOnly(kind), {
    level:"error",
    tags:{stage:nameOnly(stage)},
  });
}

export async function withOskaObservation(name, callback) {
  if (!tracing) return callback();
  return tracing.startActiveObservation(nameOnly(name), async () => callback());
}

export async function flushOskaTelemetry() {
  if (otelSdk) await otelSdk.shutdown();
  if (sentry) await sentry.flush(1000);
}
