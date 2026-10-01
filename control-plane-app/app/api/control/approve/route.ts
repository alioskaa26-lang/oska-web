import { getSql } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    jobId?: string;
    decision?: "approved" | "rejected";
    approvedBy?: string;
    note?: string;
  };

  const jobId = body.jobId;
  const decision = body.decision;

  if (!jobId || !decision) {
    return Response.json(
      { ok: false, error: "jobId and decision are required" },
      { status: 400 },
    );
  }

  const approvedBy = body.approvedBy ?? null;
  const note = body.note ?? null;
  const sql = getSql();

  const jobs = await sql`
    SELECT id, type, status, approval_status
    FROM oska_jobs
    WHERE id = ${jobId}
  `;

  if (jobs.length === 0) {
    return Response.json({ ok: false, error: "Job not found" }, { status: 404 });
  }

  const job = jobs[0];
  if (job.type !== "outbound_email" && job.type !== "outbound_whatsapp") {
    return Response.json(
      { ok: false, error: "Approval applies only to outbound jobs" },
      { status: 409 },
    );
  }

  const nextStatus = decision === "approved" ? "pending" : "cancelled";

  await sql.begin(async (tx) => {
    await tx`
      UPDATE oska_jobs
      SET approval_status = ${decision},
          status = ${nextStatus},
          next_run_at = CASE WHEN ${decision} = 'approved' THEN now() ELSE next_run_at END,
          locked_by = NULL,
          locked_at = NULL,
          updated_at = now()
      WHERE id = ${jobId}
    `;

    await tx`
      INSERT INTO oska_approvals (job_id, decision, approved_by, note)
      VALUES (${jobId}, ${decision}, ${approvedBy}, ${note})
    `;

    await tx`
      INSERT INTO oska_job_events (job_id, event_type, detail)
      VALUES (
        ${jobId},
        ${decision === "approved" ? "human_approved" : "human_rejected"},
        ${JSON.stringify({ approvedBy, note })}::jsonb
      )
    `;
  });

  return Response.json({ ok: true, jobId, decision });
}
