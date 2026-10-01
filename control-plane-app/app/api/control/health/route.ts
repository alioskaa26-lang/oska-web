import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;

    const integrations = {
      dispatcher: Boolean(process.env.OSKA_AGENT_DISPATCH_URL),
      verifier: Boolean(process.env.OSKA_VERIFIER_URL),
      outbound: Boolean(process.env.OSKA_OUTBOUND_URL),
    };

    return Response.json({
      service: "oska-control-plane",
      version: "1.1.0",
      runtime: "railway-postgres-worker",
      database: "ok",
      readyForInfrastructure: true,
      readyForDiscovery: integrations.dispatcher && integrations.verifier,
      readyForOutbound:
        integrations.dispatcher && integrations.verifier && integrations.outbound,
      humanApprovalRequiredForOutbound: true,
      integrations,
    });
  } catch (error) {
    return Response.json(
      {
        service: "oska-control-plane",
        version: "1.1.0",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
