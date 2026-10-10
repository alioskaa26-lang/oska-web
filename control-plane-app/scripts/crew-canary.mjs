import postgres from "postgres";

// OSKA CORE — cloud crew canary v0.1
// Read-only verifier: uses the existing Railway watchdog and Postgres, no new service.
// No writes, no AI/model API, no outbound messages, no Shopify changes.
const startedAtUtc = new Date().toISOString();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("OSKA_CREW_CANARY_ERROR", JSON.stringify({startedAtUtc, reason:"DATABASE_URL_MISSING"}));
  process.exit(1);
}
const sql = postgres(dbUrl,{max:1, connect_timeout:10, idle_timeout:5, prepare:false});

function hostOf(input) {
  try {
    const raw=String(input||"").trim();
    if(!raw) return null;
    const u = new URL(raw.includes("://")?raw:"https://"+raw);
    const h=u.hostname.toLowerCase().replace(/^www\./,"");
    if(!["https:","http:"].includes(u.protocol))return null;
    if(!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(h) || h.length<4 || h.length>250)return null;
    if(/(?:^|\.)(?:localhost|local|internal|example|test|invalid)$/.test(h))return null;
    if(/^\d+\.\d+\.\d+\.\d+$/.test(h))return null;
    return h;
  } catch{return null;}
}
function verifiedSourceUrls(value){
  if(!Array.isArray(value))return 0;
  return value.filter(v=>{
    try{const url=new URL(String(v));return url.protocol==="https:" && !!hostOf(url.hostname);}
    catch{return false;}
  }).length;
}
async function checkHome(domain,email){
  const host=hostOf(domain);
  if(!host)return {reachable:false,reason:"invalid_domain"};
  try{
    const r=await fetch("https://"+host+"/",{
      redirect:"follow",
      signal:AbortSignal.timeout(7000),
      headers:{"user-agent":"OSKA-Independent-ReadOnly-Canary/1.0","accept":"text/html"},
    });
    const ct=r.headers.get("content-type")||"";
    const landed=hostOf(r.url);
    const sameDomain=landed===host || (landed && landed.endsWith("."+host));
    const reachable=r.ok && sameDomain && ct.includes("text/html");
    const body=reachable ? (await r.text()).slice(0,300000).toLowerCase():"";
    return {
      reachable:!!reachable,
      status:r.status,
      sameDomain:!!sameDomain,
      emailOnHomepage:!!email && body.includes(String(email).toLowerCase())
    };
  }catch(e){return {reachable:false,reason:String(e).slice(0,100)};}
}
try{
  const [leadCounts] = await sql`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status='contact_ready')::int AS contact_ready,
      count(*) FILTER (WHERE first_seen_at >= now()-interval '24 hours')::int AS new_unique_24h,
      count(*) FILTER (WHERE last_verified_at >= now()-interval '24 hours')::int AS refreshed_24h,
      count(*) FILTER (WHERE lower(coalesce(material,'')) ~ '(gold|altın|altin|14k|18k)')::int AS gold,
      count(*) FILTER (WHERE lower(coalesce(material,'')) ~ '(925|silver|gümüş|sterling)')::int AS silver,
      count(*) FILTER (WHERE status='contact_ready' AND jsonb_array_length(source_urls)=0)::int AS contact_ready_without_source
    FROM oska_leads`;
  const [jobCounts] = await sql`
    SELECT count(*) FILTER (WHERE type='source_research' AND status='completed' AND completed_at >= now()-interval '24 hours')::int AS source_jobs_24h,
      count(*) FILTER (WHERE type='lead_discovery' AND status='completed' AND completed_at >= now()-interval '24 hours')::int AS discovery_jobs_24h,
      count(*) FILTER (WHERE type='lead_verify' AND status='completed' AND completed_at >= now()-interval '24 hours')::int AS verified_jobs_24h,
      count(*) FILTER (WHERE status='dead_letter')::int AS dead_letter
    FROM oska_jobs`;
  const repeated=await sql`
    SELECT domain,count(*)::int AS n FROM oska_leads
    WHERE domain IS NOT NULL AND trim(domain)<>''
    GROUP BY lower(trim(domain)),domain HAVING count(*)>1 ORDER BY n DESC LIMIT 3`;
  const samples=await sql`
    SELECT company,domain,country,email,phone_whatsapp,source_urls,verification_score
    FROM oska_leads
    WHERE status='contact_ready' AND domain IS NOT NULL AND trim(domain)<>''
    ORDER BY last_verified_at DESC LIMIT 3`;
  const evidence=await Promise.all(samples.map(async row=>{
    const h=hostOf(row.domain);
    const probe=await checkHome(h,row.email);
    const sourceCount=verifiedSourceUrls(row.source_urls);
    const contactPresent=!!(row.email||row.phone_whatsapp);
    return {
      company:row.company,domain:h,country:row.country,
      publicSources:sourceCount,contactPresent,homepage:probe,recordedScore:row.verification_score,
      homepageProvenContact:!!row.email && !!probe.emailOnHomepage && sourceCount>0
    };
  }));
  const independentContactProof=evidence.filter(r=>r.homepageProvenContact).length;
  const result={
    observedAtUtc:new Date().toISOString(),
    manager:"OSKA CORE",
    specialists:["lead-count-auditor","source-evidence-checker","contact-proof-verifier"],
    mode:"READ_ONLY_NO_MODEL_SPEND",
    health:independentContactProof===3?"PASS":"NEEDS_VERIFICATION",
    leadCounts,jobCounts,
    sampleSize:evidence.length,
    independentlyProvenOnHomepage:independentContactProof,
    sampleResults:evidence,
    duplicateDomainGroups:repeated.length,
    safeguards:{dbWrites:0,customerMessages:0,siteChanges:0,aiApiCalls:0},
    limitations:"Only homepage is checked; missing homepage email is NOT evidence the contact is invalid."
  };
  console.log("OSKA_CREW_CANARY_RESULT",JSON.stringify(result));
} catch(e) {
  console.error("OSKA_CREW_CANARY_ERROR",JSON.stringify({observedAtUtc:new Date().toISOString(),error:String(e).slice(0,350)}));
  process.exitCode=1;
} finally { await sql.end({timeout:5}); }
