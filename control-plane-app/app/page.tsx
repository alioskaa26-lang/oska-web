import { getSql } from "@/lib/db";
import VoiceStatus from "./VoiceStatus";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sql = getSql();
  const [counts, recent, providers] = await Promise.all([
    sql`
      SELECT status, count(*)::int AS count
      FROM oska_jobs
      GROUP BY status
      ORDER BY status
    `,
    sql`
      SELECT id, type, status, attempt_count, max_attempts, approval_status, updated_at
      FROM oska_jobs
      ORDER BY updated_at DESC
      LIMIT 12
    `,
    sql`
      SELECT provider, status, success_count, failure_count, last_seen_at
      FROM oska_provider_health
      WHERE provider IN ('zero-api-search','official-site-crawler')
      ORDER BY provider
    `,
  ]);

  const total = counts.reduce((sum, row) => sum + Number(row.count), 0);
  const completed = counts.find((row) => row.status === "completed")?.count ?? 0;
  const dead = counts.find((row) => row.status === "dead_letter")?.count ?? 0;
  const waiting = counts.find((row) => row.status === "waiting_approval")?.count ?? 0;

  return (
    <main className="jarvesMain">
      <section className="jarvesHero">
        <div className="jarvesGlow jarvesGlowOne" />
        <div className="jarvesGlow jarvesGlowTwo" />
        <p className="jarvesEyebrow">OSKA CORE · 7/24 BULUT KONTROL MERKEZİ</p>
        <h1>JARVES</h1>
        <p className="jarvesSub">Ali Bey için sesli operasyon asistanı</p>
        <VoiceStatus />
        <div className="jarvesStatusLine">
          <span className="statusPulse" />
          <span>Bulut sistemi aktif · Worker + Watchdog + Failover</span>
        </div>
      </section>

      <details className="technicalPanel">
        <summary>Teknik kontrol panelini aç</summary>
        <p className="muted technicalIntro">
          JARVES arayüzünün altında çalışan gerçek OSKA CORE durumu.
        </p>

        <div className="grid">
          <div className="card"><strong>Toplam görev</strong><p className="metric ok">{total}</p></div>
          <div className="card"><strong>Tamamlanan</strong><p className="metric ok">{completed}</p></div>
          <div className="card"><strong>Onay bekleyen</strong><p className="metric warn">{waiting}</p></div>
          <div className="card"><strong>Dead-letter</strong><p className={"metric " + (Number(dead) > 0 ? "warn" : "ok")}>{dead}</p></div>
        </div>

        <h2>Son görevler</h2>
        <div className="card tableWrap">
          <table>
            <thead><tr><th>ID</th><th>Tip</th><th>Durum</th><th>Deneme</th><th>Onay</th></tr></thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="muted">Henüz görev yok.</td></tr>
              ) : recent.map((job) => (
                <tr key={job.id}>
                  <td><code>{job.id}</code></td>
                  <td>{job.type}</td>
                  <td>{job.status}</td>
                  <td>{job.attempt_count}/{job.max_attempts}</td>
                  <td>{job.approval_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Sağlayıcı durumu</h2>
        <div className="card tableWrap">
          <table>
            <thead><tr><th>Sağlayıcı</th><th>Durum</th><th>Başarı</th><th>Hata</th><th>Son sinyal</th></tr></thead>
            <tbody>
              {providers.length === 0 ? (
                <tr><td colSpan={5} className="muted">Sağlayıcı sinyali henüz yok.</td></tr>
              ) : providers.map((p) => (
                <tr key={p.provider}>
                  <td>{p.provider}</td><td>{p.status}</td><td>{p.success_count}</td>
                  <td>{p.failure_count}</td><td>{String(p.last_seen_at ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Kesin kurallar</h2>
        <div className="rule">Aynı <code>jobId</code> ikinci kez yan etki oluşturmaz.</div>
        <div className="rule">Worker <code>FOR UPDATE SKIP LOCKED</code> ile tek sahipli görev alır.</div>
        <div className="rule">Bir sağlayıcı hata verirse diğerine otomatik geçilir.</div>
        <div className="rule">Doğrulayıcı PASS vermeden görev tamamlanmış sayılmaz.</div>
        <div className="rule">Mail / WhatsApp gönderimi insan onayı olmadan çalışmaz.</div>
      </details>
    </main>
  );
}
