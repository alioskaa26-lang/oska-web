function decodeHtml(text) {
  return String(text || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(text) {
  return decodeHtml(String(text || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapDuckUrl(href) {
  try {
    const raw = href.startsWith("//") ? "https:" + href : href;
    const url = new URL(raw, "https://duckduckgo.com");
    const target = url.searchParams.get("uddg");
    return target ? decodeURIComponent(target) : url.toString();
  } catch {
    return null;
  }
}

async function searchDuck(query) {
  const searchUrl =
    "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  const response = await fetch(searchUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; OSKA-Marketing-Radar/1.0)",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("FREE_MARKETING_SEARCH_HTTP_" + response.status);

  const html = await response.text();
  const results = [];
  const blocks = html.split('class="result results_links');

  for (const block of blocks.slice(1, 10)) {
    const link = block.match(
      /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    if (!link) continue;
    const url = unwrapDuckUrl(link[1]);
    if (!url || /duckduckgo\.com/i.test(url)) continue;

    const snippetMatch = block.match(
      /class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i,
    );

    results.push({
      url,
      title: stripTags(link[2]),
      snippet: stripTags(snippetMatch?.[1] || snippetMatch?.[2] || ""),
      searchUrl,
    });
  }
  return results;
}

function queriesFor(type) {
  if (type === "content_brief") {
    return [
      "2026 men's jewelry trends sterling silver styling",
      "sterling silver jewelry buyer guide care styling",
      "Turkey handmade silver jewelry sourcing craftsmanship",
      "men's brooch maximalist accessories trend 2026",
    ];
  }

  if (type === "visibility_audit") {
    return [
      "premium men's silver jewelry collections online",
      "sterling silver jewelry wholesale supplier Turkey",
      "men's jewelry ecommerce collection storytelling",
      "B2B jewelry manufacturer Istanbul silver brass",
    ];
  }

  return [
    "2026 men's jewelry trends sterling silver wholesale retail",
    "2026 brass jewelry trends wholesale retail",
    "Turkey jewelry market sterling silver ecommerce 2026",
    "premium men's jewelry retailer silver bracelet trends 2026",
  ];
}

function impactFor(type) {
  if (type === "content_brief") {
    return "Can inform an internal OSKA content or collection-story brief after source review.";
  }
  if (type === "visibility_audit") {
    return "Can inform an internal SEO, positioning or discoverability test without changing live channels.";
  }
  return "Can inform an internal product, assortment or B2B buyer-opportunity test.";
}

function actionFor(type, title) {
  if (type === "content_brief") {
    return `Prepare an internal content brief around "${title}" and review before publishing.`;
  }
  if (type === "visibility_audit") {
    return `Compare OSKA's current messaging against "${title}" and prepare an internal optimization brief.`;
  }
  return `Validate "${title}" against OSKA's 925 silver/brass capabilities and current B2B buyer fit.`;
}

export async function freeMarketingResearch(type, payload = {}) {
  const raw = [];
  for (const query of queriesFor(type)) {
    try {
      raw.push(...(await searchDuck(query)));
    } catch {}
  }

  const byUrl = new Map();
  for (const item of raw) {
    if (!item.url || !item.title) continue;
    const key = item.url.replace(/[#?].*$/, "");
    if (!byUrl.has(key)) byUrl.set(key, item);
  }

  const selected = [...byUrl.values()].slice(0, 10);
  const findings = selected.map((item, index) => ({
    title: item.title,
    detail: item.snippet || "Current public search result identified for source-level review.",
    impact: impactFor(type),
    confidence: item.snippet ? "medium" : "low",
    rank: index + 1,
  }));

  const opportunities = findings.slice(0, 4).map((finding) => ({
    title: finding.title,
    action: actionFor(type, finding.title),
    requiresHumanApproval: false,
  }));

  const evidence = selected.map((item) => ({
    url: item.url,
    title: item.title,
    claim: item.snippet || "Source discovered by current public web search.",
    searchUrl: item.searchUrl,
  }));

  return {
    ok: evidence.length > 0,
    backend: "zero-api-duckduckgo-marketing",
    jobType: type,
    summary: evidence.length
      ? `Found ${evidence.length} current public sources for the OSKA ${type} lane without paid API.`
      : `No meaningful public source found for the OSKA ${type} lane in this cycle.`,
    findings,
    opportunities,
    evidence,
    context: {
      brand: payload?.brand || "OSKA Silver",
      turkeyFirst: payload?.rules?.turkeyFirst !== false,
      externalActionsBlocked: true,
    },
  };
}

async function isReachable(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; OSKA-Marketing-Verifier/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

export async function freeVerifyMarketingResearch(research) {
  const evidence = Array.isArray(research?.evidence) ? research.evidence : [];
  const validUrls = evidence.filter((item) => {
    try {
      const url = new URL(item?.url);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  });

  const uniqueHosts = new Set(
    validUrls.map((item) => {
      try {
        return new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    }).filter(Boolean),
  );

  const probes = await Promise.all(
    validUrls.slice(0, 4).map((item) => isReachable(item.url)),
  );
  const reachableCount = probes.filter(Boolean).length;

  const ok =
    research?.ok === true &&
    validUrls.length >= 3 &&
    uniqueHosts.size >= 2 &&
    reachableCount >= 1;

  return {
    ok,
    score: ok ? Math.min(90, 60 + validUrls.length * 3 + reachableCount * 5) : 40,
    reasons: [
      `${validUrls.length} syntactically valid evidence URLs.`,
      `${uniqueHosts.size} unique evidence hosts.`,
      `${reachableCount} of the first ${Math.min(4, validUrls.length)} evidence URLs reachable on verifier readback.`,
      "Research and verification ran without paid AI/API dependency.",
    ],
    verifiedUrls: validUrls.slice(0, 4).map((item) => item.url),
    warnings: [
      "Search snippets are discovery evidence; numeric or high-impact claims still require source-page confirmation before external use.",
    ],
  };
}
