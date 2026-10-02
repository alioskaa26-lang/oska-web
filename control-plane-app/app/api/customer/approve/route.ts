import { getSql } from "@/lib/db";

export async function POST(request: Request) {
  const expected = process.env.OSKA_INTERNAL_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || actual !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as {
    actionId?: number;
    decision?: "approved" | "rejected";
    approvedBy?: string;
    note?: string;
  };

  if (!Number.isInteger(body.actionId) || !body.decision) {
    return Response.json(
      { ok: false, error: "actionId and decision are required" },
      { status: 400 },
    );
  }

  const sql = getSql();
  const rows = await sql`
    SELECT id, thread_id, action_type, status, approval_required, payload
    FROM oska_customer_actions
    WHERE id = ${body.actionId}
  `;

  if (rows.length === 0) {
    return Response.json({ ok: false, error: "ACTION_NOT_FOUND" }, { status: 404 });
  }

  const action = rows[0];
  if (!action.approval_required) {
    return Response.json({ ok: false, error: "APPROVAL_NOT_REQUIRED" }, { status: 409 });
  }
  if (action.status !== "pending_approval") {
    return Response.json(
      { ok: false, error: "ACTION_NOT_PENDING_APPROVAL", status: action.status },
      { status: 409 },
    );
  }

  const nextStatus = body.decision === "approved" ? "approved" : "rejected";
  const approvalMeta = {
    approvedBy: body.approvedBy ?? null,
    note: body.note ?? null,
    decision: body.decision,
    decidedAt: new Date().toISOString(),
  };

  await sql.begin(async (tx) => {
    await tx`
      UPDATE oska_customer_actions
      SET status = ${nextStatus},
          payload = payload || ${tx.json({ approval: approvalMeta })}::jsonb,
          updated_at = now()
      WHERE id = ${body.actionId}
    `;

    await tx`
      UPDATE oska_customer_threads
      SET status = CASE
            WHEN ${body.decision} = 'rejected' THEN 'waiting_human'
            ELSE status
          END,
          updated_at = now()
      WHERE id = ${action.thread_id}
    `;
  });

  return Response.json({
    ok: true,
    actionId: body.actionId,
    threadId: action.thread_id,
    actionType: action.action_type,
    decision: body.decision,
    outboundSent: false,
    nextStep:
      body.decision === "approved"
        ? "Approved draft is ready for a future channel adapter; nothing was sent automatically."
        : "Draft rejected; nothing was sent.",
  });
}
