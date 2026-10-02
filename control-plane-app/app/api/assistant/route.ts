import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { findKnowledge, normalizeQuestion } from "@/lib/oska-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function n(value: unknown) {
  return Number(value || 0);
}

function hasAny(q: string, words: string[]) {
  return words.some((word) => q.includes(word));
}

function collectUsefulStrings(value: unknown, depth = 0, out: string[] = []): string[] {
  if (depth > 4 || out.length >= 8 || value == null) return out;
  if (typeof value === "string") {
    const text = value.trim();
    if (text.length >= 20 && text.length <= 700 && !out.includes(text)) out.push(text);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 8)) collectUsefulStrings(item, depth + 1, out);
    return out;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const priority = ["summary","recommendation","recommendations","opportunity","opportunities","signal","signals","finding","findings","title","headline","rationale","why"];
    for (const key of priority) if (key in obj) collectUsefulStrings(obj[key], depth + 1, out);
    if (out.length < 5) {
      for (const [key, item] of Object.entries(obj)) {
        if (!priority.includes(key)) collectUsefulStrings(item, depth + 1, out);
        if (out.length >= 8) break;
      }
    }
  }
  return out;
}

async function liveSnapshot() {
  const sql = getSql();
  const [jobRows, leadRows, providerRows, latestRows] = await Promise.all([
    sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status='completed')::int AS completed,
        count(*) FILTER (WHERE status='running')::int AS running,
        count(*) FILTER (WHERE status='pending')::int AS pending,
        count(*) FILTER (WHERE status='retry')::int AS retry,
        count(*) FILTER (WHERE status='waiting_approval')::int AS waiting_approval,
        count(*) FILTER (WHERE status='dead_letter')::int AS dead_letter,
        count(*) FILTER (WHERE updated_at >= now() - interval '24 hours')::int AS updated_24h
      FROM oska_jobs
    `,
    sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status='contact_ready')::int AS contact_ready,
        count(*) FILTER (WHERE updated_at >= now() - interval '24 hours')::int AS updated_24h,
        count(*) FILTER (WHERE lower(COALESCE(material,'')) ~ '(925|sterling|silver|gümüş)')::int AS silver,
        count(*) FILTER (WHERE lower(COALESCE(material,'')) ~ '(brass|bronze|pirinç|bronz)')::int AS brass,
        count(*) FILTER (WHERE lower(trim(COALESCE(country,''))) IN ('türkiye','turkey'))::int AS turkey,
        count(*) FILTER (WHERE email IS NOT NULL)::int AS email_ready,
        count(*) FILTER (WHERE phone_whatsapp IS NOT NULL)::int AS whatsapp_ready
      FROM oska_leads
    `,
    sql`
      SELECT provider, status, success_count, failure_count, last_error, last_seen_at
      FROM oska_provider_health
      ORDER BY last_seen_at DESC NULLS LAST
      LIMIT 12
    `,
    sql`
      SELECT id, type, status, updated_at, completed_at, last_error
      FROM oska_jobs
      ORDER BY updated_at DESC
      LIMIT 8
    `,
  ]);

  return {
    jobs: jobRows[0] || {},
    leads: leadRows[0] || {},
    providers: providerRows,
    latest: latestRows,
  };
}

function statusAnswer(s: Awaited<ReturnType<typeof liveSnapshot>>) {
  const j = s.jobs;
  const l = s.leads;
  const activeProviderSet = new Set(["zero-api-search","official-site-crawler","zero-api-marketing"]);
  const activeProviders = s.providers.filter((p: any) => activeProviderSet.has(p.provider));
  const unhealthy = activeProviders.filter((p: any) => p.status === "degraded");
  const activeProviderNames = activeProviders
    .filter((p: any) => p.status === "healthy")
    .slice(0, 4)
    .map((p: any) => p.provider)
    .join(", ");

  const parts = [
    "Ali Bey, OSKA CORE genel durumunu kontrol ettim.",
    `Toplam ${n(j.total)} görev var; ${n(j.completed)} tamamlandı, ${n(j.running)} şu an çalışıyor, ${n(j.pending)} bekliyor, ${n(j.retry)} yeniden denemede.`,
    `Onay bekleyen ${n(j.waiting_approval)}, ölü kuyruğa düşen ${n(j.dead_letter)} görev var.`,
    `Müşteri havuzunda ${n(l.total)} kayıt bulunuyor. ${n(l.contact_ready)} tanesi iletişime hazır; son 24 saatte ${n(l.updated_24h)} müşteri kaydı güncellendi.`,
    `925/gümüş tarafında ${n(l.silver)}, pirinç/bronz tarafında ${n(l.brass)}, Türkiye tarafında ${n(l.turkey)} kayıt var.`,
    `E-posta bulunan ${n(l.email_ready)}, doğrulanmış WhatsApp/telefon bulunan ${n(l.whatsapp_ready)} kayıt var.`,
  ];

  if (unhealthy.length) {
    parts.push(`Sorunlu veya zayıf görünen sağlayıcılar: ${unhealthy.slice(0,4).map((p:any) => p.provider).join(", ")}.`);
  } else if (activeProviderNames) {
    parts.push(`Aktif sağlayıcılar çalışıyor: ${activeProviderNames}.`);
  }

  parts.push("Dışa gönderim ve yayın gibi işlemler insan onayı olmadan yapılmıyor.");
  return parts.join(" ");
}

function leadAnswer(s: Awaited<ReturnType<typeof liveSnapshot>>) {
  const l = s.leads;
  return [
    "Ali Bey, müşteri avı canlı durumu:",
    `Toplam ${n(l.total)} müşteri kaydı var.`,
    `İletişime hazır ${n(l.contact_ready)} kayıt bulunuyor.`,
    `925/gümüş ${n(l.silver)}, pirinç/bronz ${n(l.brass)}, Türkiye ${n(l.turkey)} kayıt.`,
    `Son 24 saatte ${n(l.updated_24h)} kayıt güncellendi; ${n(l.email_ready)} kayıtta e-posta, ${n(l.whatsapp_ready)} kayıtta telefon veya WhatsApp var.`,
    "Türkiye önceliği, güçlü e-ticaret, yüksek fiyat ve replenishment sinyali kuralları devam ediyor.",
  ].join(" ");
}

function providerAnswer(s: Awaited<ReturnType<typeof liveSnapshot>>) {
  const activeSet = new Set(["zero-api-search","official-site-crawler","zero-api-marketing"]);
  const active = s.providers.filter((p:any) => activeSet.has(p.provider));
  if (!active.length) return "Ali Bey, aktif sağlayıcı sağlık kaydı henüz yok.";
  const lines = active.slice(0,6).map((p:any) => {
    const label = p.status === "healthy"
      ? "sağlıklı"
      : p.status === "stale"
        ? "son sinyal eski; aktif iş yoksa normal"
        : p.status === "degraded"
          ? "sorunlu"
          : String(p.status || "bilinmiyor");
    return `${p.provider}: ${label}; başarı ${n(p.success_count)}, hata ${n(p.failure_count)}`;
  });
  return "Ali Bey, ajan ve sağlayıcı durumu. " + lines.join(". ") + ". Watchdog sıkışan işleri geri kazanıyor; failover kuralı aktif.";
}

async function latestResearchAnswer() {
  const sql = getSql();
  const rows = await sql`
    SELECT id, type, status, result, last_error, updated_at
    FROM oska_jobs
    WHERE id LIKE 'jarves-research-%'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const job = rows[0];
  if (!job) return "Ali Bey, JARVES tarafından başlatılmış bir araştırma henüz yok.";
  if (job.status !== "completed") {
    return `Ali Bey, son araştırma görevi ${job.status} durumda. Görev kodu ${job.id}. Tamamlanınca sonucunu buradan okuyabilirim.`;
  }
  const strings = collectUsefulStrings(job.result);
  if (!strings.length) {
    return `Ali Bey, son araştırma tamamlandı fakat kısa özet üretilemedi. Görev kodu ${job.id}.`;
  }
  return "Ali Bey, son araştırmanın sonucu: " + strings.slice(0,5).join(" ");
}

async function queueResearch(question: string) {
  const sql = getSql();
  const id = `jarves-research-${Date.now()}-${randomUUID().slice(0,8)}`;
  await sql`
    INSERT INTO oska_jobs (
      id, type, payload, status, priority,
      preferred_providers, max_attempts, approval_status
    )
    VALUES (
      ${id},
      'market_research',
      ${sql.json({
        source: "jarves",
        brand: "OSKA Silver",
        userQuestion: question,
        goal: question,
        rules: {
          turkeyFirst: true,
          requireCurrentEvidenceUrls: true,
          noPublish: true,
          noAdSpend: true,
          noCustomerContact: true,
          humanApprovalForExternalActions: true
        }
      })},
      'pending',
      220,
      '[]'::jsonb,
      3,
      'not_required'
    )
  `;
  await sql`
    INSERT INTO oska_job_events (job_id, event_type, detail)
    VALUES (${id}, 'queued_by_jarves', ${sql.json({ question })})
  `;
  return id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = String(body?.question || "").trim().slice(0, 1600);
    if (!question) return Response.json({ ok:false, error:"QUESTION_REQUIRED" }, { status:400 });

    const q = normalizeQuestion(question.replace(/\bjarv[ei]s\b/gi, ""));
    const snapshot = await liveSnapshot();

    if (hasAny(q, ["ajan","provider","sağlayıcı","failover","watchdog","worker","yedek araç","kredi bitti"])) {
      return Response.json({ ok:true, mode:"providers", answer:providerAnswer(snapshot) });
    }

    if (hasAny(q, ["sistem ne durumda","genel durum","sistem durumu","core ne durumda","oska ne durumda","sistem nasıl","durum nedir","son durum"])) {
      return Response.json({ ok:true, mode:"live-status", answer:statusAnswer(snapshot) });
    }

    if (hasAny(q, ["müşteri avı","müşteri durumu","müşteriler","potansiyel müşteri","lead","alıcı","buyer"])) {
      return Response.json({ ok:true, mode:"leads", answer:leadAnswer(snapshot) });
    }

    if (hasAny(q, ["araştırma sonucu","araştırma ne oldu","araştırma bitti","son araştırma","ne buldun"])) {
      return Response.json({ ok:true, mode:"research-result", answer:await latestResearchAnswer() });
    }

    const researchIntent = hasAny(q, [
      "araştır","araştırma yap","internetten bak","pazarı tara","trendleri tara",
      "yeni müşteri bul","yeni alıcı bul","kimler satıyor","rakipleri bul","fırsat bul",
      "güncel bilgi","pazar araştır"
    ]);

    if (researchIntent) {
      const id = await queueResearch(question);
      return Response.json({
        ok:true,
        mode:"research-queued",
        jobId:id,
        answer:`Ali Bey, araştırmayı başlattım. Türkiye öncelikli güncel kaynaklarla tarama yapılıyor. Görev kodu ${id}. Biraz sonra “araştırma ne oldu?” diye sorabilirsiniz.`
      });
    }

    const knowledge = findKnowledge(q, 3);
    if (knowledge.length) {
      const answer = "Ali Bey, kayıtlı OSKA bilgisine göre: " +
        knowledge.map((x) => x.summary).join(" ") +
        " Canlı rakam isterseniz ayrıca sistem veya müşteri durumunu sorabilirsiniz.";
      return Response.json({ ok:true, mode:"knowledge", answer, knowledgeIds:knowledge.map(x=>x.id) });
    }

    const id = await queueResearch(question);
    return Response.json({
      ok:true,
      mode:"auto-research",
      jobId:id,
      answer:`Ali Bey, bu sorunun cevabı mevcut OSKA kayıtlarında net değil. Tahmin etmek yerine araştırmayı otomatik başlattım. Görev kodu ${id}. Sonucu hazır olunca okuyabilirim.`
    });
  } catch (error) {
    console.error("JARVES_ASSISTANT_ERROR", error);
    return Response.json(
      { ok:false, answer:"Ali Bey, JARVES asistan katmanında geçici bir hata oluştu. OSKA CORE çalışmaya devam ediyor." },
      { status:500 }
    );
  }
}
