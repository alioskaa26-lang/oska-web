function cleanUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

async function fetchPage(url, timeoutMs = 12000) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; OSKA-Site-QA/1.0)",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const contentType = response.headers.get("content-type") || "";
    const text = /text|html|xml|json/i.test(contentType)
      ? await response.text()
      : "";
    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url || url,
      contentType,
      text,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      contentType: "",
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractMeta(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || null;
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ||
    null;
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ||
    null;
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] || null;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  return { title, description, canonical, lang, h1Count };
}

function extractInternalLinks(html, baseUrl) {
  const out = new Set();
  const re = /<a\s+[^>]*href=["']([^"'#]+)["']/gi;
  let match;
  while ((match = re.exec(html))) {
    try {
      const url = new URL(match[1], baseUrl);
      const base = new URL(baseUrl);
      if (url.hostname !== base.hostname) continue;
      url.hash = "";
      if (!["http:", "https:"].includes(url.protocol)) continue;
      out.add(url.toString());
      if (out.size >= 20) break;
    } catch {}
  }
  return [...out];
}

export async function freeSiteQualityAudit(payload = {}) {
  const requested = cleanUrl(payload?.siteUrl || "https://oskasilver.com");
  const baseUrl = requested ? requested.toString() : "https://oskasilver.com/";
  const home = await fetchPage(baseUrl);
  const robots = await fetchPage(new URL("/robots.txt", baseUrl).toString());
  const sitemap = await fetchPage(new URL("/sitemap.xml", baseUrl).toString());

  const meta = extractMeta(home.text || "");
  const internalLinks = home.ok ? extractInternalLinks(home.text || "", home.finalUrl || baseUrl) : [];
  const linkChecks = await Promise.all(
    internalLinks.slice(0, 12).map(async (url) => {
      const result = await fetchPage(url, 9000);
      return { url, ok: result.ok, status: result.status, finalUrl: result.finalUrl };
    }),
  );

  const brokenLinks = linkChecks.filter((item) => !item.ok);
  const findings = [
    { check: "homepage", ok: home.ok, status: home.status, url: home.finalUrl },
    { check: "robots", ok: robots.ok, status: robots.status, url: robots.finalUrl },
    { check: "sitemap", ok: sitemap.ok, status: sitemap.status, url: sitemap.finalUrl },
    { check: "title", ok: Boolean(meta.title), value: meta.title },
    { check: "meta_description", ok: Boolean(meta.description), value: meta.description },
    { check: "canonical", ok: Boolean(meta.canonical), value: meta.canonical },
    { check: "html_lang", ok: Boolean(meta.lang), value: meta.lang },
    { check: "single_h1", ok: meta.h1Count === 1, value: meta.h1Count },
    { check: "sampled_internal_links", ok: brokenLinks.length === 0, value: linkChecks.length },
  ];

  return {
    ok: home.ok,
    backend: "zero-api-public-site-qa",
    siteUrl: baseUrl,
    summary: home.ok
      ? `Public OSKA web QA checked homepage, robots, sitemap and ${linkChecks.length} sampled internal links.`
      : "OSKA public homepage was not reachable during this QA cycle.",
    checkedCount: 3 + linkChecks.length,
    meta,
    findings,
    brokenLinks,
    linkChecks,
    externalActionsBlocked: true,
    note: "This checks the public web surface only. Unpublished Shopify preview QA requires an authenticated preview/browser adapter.",
  };
}

export async function freeVerifySiteQualityAudit(audit) {
  const home = await fetchPage(audit?.siteUrl || "https://oskasilver.com", 9000);
  const broken = Array.isArray(audit?.brokenLinks) ? audit.brokenLinks : [];
  const score = home.ok
    ? Math.max(50, 95 - Math.min(30, broken.length * 5) - (audit?.meta?.title ? 0 : 5) - (audit?.meta?.description ? 0 : 5))
    : 30;

  return {
    ok: home.ok,
    score,
    reasons: [
      home.ok ? "Homepage reachability independently rechecked." : "Homepage failed independent reachability recheck.",
      `${broken.length} broken sampled internal links reported by the audit.`,
      "Audit is read-only and cannot publish or mutate the storefront.",
    ],
  };
}
