import { freeOfficialContactEnrich } from "./free-enrich.mjs";

const EXCLUDED_DOMAINS = new Set([
  "akgunsilver.com",
  "theiasilver.com",
  "grandbazaarjewelers.com",
]);

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

function normalizeDomain(value) {
  try {
    const u = new URL(value.includes("://") ? value : `https://${value}`);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function unwrapDuckUrl(href) {
  try {
    const raw = href.startsWith("//") ? "https:" + href : href;
    const u = new URL(raw, "https://duckduckgo.com");
    const target = u.searchParams.get("uddg");
    return target ? decodeURIComponent(target) : u.toString();
  } catch {
    return null;
  }
}

async function searchDuck(query) {
  const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; OSKA-Lead-Research/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("FREE_SEARCH_HTTP_" + response.status);
  const html = await response.text();

  const results = [];
  const blocks = html.split('class="result results_links');
  for (const block of blocks.slice(1, 13)) {
    const link = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    const target = unwrapDuckUrl(link[1]);
    if (!target) continue;
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);
    results.push({
      url: target,
      title: stripTags(link[2]),
      snippet: stripTags(snippetMatch?.[1] || snippetMatch?.[2] || ""),
      searchUrl: url,
    });
  }
  return results;
}

function queriesFor(payload) {
  const geo = String(payload?.geography || "").toLowerCase();
  const mat = String(payload?.material || "").toLowerCase();
  const turkey = geo.includes("türkiye") || geo.includes("turkey");
  const turkeyLinked = String(payload?.turkeyPriority || "") === "turkey-linked";
  const brass = /brass|bronze|pirinç|bronz/.test(mat);
  const silver = /925|silver|gümüş|sterling/.test(mat);
  const variant = Math.abs(Number(payload?.searchVariant || 0)) % 10;

  const material = brass && silver
    ? turkey
      ? '("925 ayar gümüş" OR "pirinç takı" OR "bronz takı")'
      : '("sterling silver" OR "brass jewelry" OR "bronze jewelry")'
    : brass
      ? turkey
        ? '("pirinç takı" OR "bronz takı" OR "brass jewelry")'
        : '("brass jewelry" OR "bronze jewelry")'
      : turkey
        ? '("925 ayar gümüş" OR "gümüş takı" OR "sterling silver")'
        : '"925 sterling silver" jewelry';

  const turkeyPlaces = ["Türkiye","İstanbul","Ankara","İzmir","Bursa","Antalya","Türkiye","İstanbul","Türkiye","İstanbul"];
  const globalPlaces = ["","Europe","UAE","United Kingdom","United States","Germany","France","Italy","Netherlands","Middle East"];
  const place = turkey ? turkeyPlaces[variant] : globalPlaces[variant];

  const roleSets = [
    ["retailer stockist","multibrand boutique","jewelry store"],
    ["distributor wholesaler","importer jewelry","trade showroom"],
    ["mens jewelry retailer","premium accessories store","designer jewelry boutique"],
    ["private label jewelry buyer","jewelry sourcing","vendor supplier jewelry"],
    ["online jewelry store","ecommerce jewelry retailer","department store jewelry"],
    ["wholesale jewelry","B2B jewelry buyer","jewelry distributor"],
    ["concept store jewelry","luxury multibrand jewelry","fashion accessories buyer"],
    ["sterling silver bracelet shop","men bracelet retailer","silver jewelry stockist"],
    ["brass jewelry boutique","gold plated brass jewelry retailer","fashion jewelry wholesaler"],
    ["jewelry agent showroom","buying office jewelry","retail group jewelry"],
  ];

  const turkeyRoleSets = [
    ["takı mağazası","çok markalı takı mağazası","gümüş takı mağazası"],
    ["takı distribütörü","takı toptancısı","takı ithalatçısı"],
    ["erkek takı mağazası","premium aksesuar mağazası","tasarım takı butik"],
    ["özel marka takı alıcısı","takı satın alma","takı tedarikçisi"],
    ["online takı mağazası","e-ticaret takı mağazası","mağaza zinciri takı"],
    ["toptan takı","B2B takı alıcısı","takı distribütörü"],
    ["konsept mağaza takı","premium multibrand takı","moda aksesuar alıcısı"],
    ["925 gümüş bileklik mağazası","erkek bileklik mağazası","gümüş takı stokçusu"],
    ["pirinç takı mağazası","gold kaplama pirinç takı","moda takı toptancısı"],
    ["takı temsilcisi showroom","takı satın alma ofisi","perakende grubu takı"],
  ];

  const activeRoleSets = turkey ? turkeyRoleSets : roleSets;

  if (turkeyLinked) {
    const connectionTerms = [
      '"made in Turkey"',
      '"made in Türkiye"',
      '"sourced from Turkey"',
      '"sourcing from Turkey"',
      '"Istanbul" sourcing',
      '"Turkish jewelry" retailer',
      '"Turkish jewellery" stockist',
      '"Turkey supplier" jewelry',
      '"Turkish brand" jewelry',
      '"Turkey" importer jewelry',
    ];
    const connection = connectionTerms[variant];
    return activeRoleSets[variant]
      .map((role) => `${material} ${role} ${connection} ${place}`.trim())
      .concat(
        (payload?.customerTypes || [])
          .slice(0, 2)
          .map((type) => `${material} ${type} ${connection} ${place}`.trim())
      );
  }

  return activeRoleSets[variant]
    .map((role) => `${material} ${role} ${place}`.trim())
    .concat(
      (payload?.customerTypes || [])
        .slice(0, 2)
        .map((type) => `${material} ${type} ${place}`.trim())
    );
}

function materialTerms(payload) {
  const mat = String(payload?.material || "").toLowerCase();
  const terms = [];
  if (/925|silver|gümüş|sterling/.test(mat)) terms.push("925","sterling","silver","gümüş");
  if (/brass|bronze|pirinç|bronz/.test(mat)) terms.push("brass","bronze","pirinç","bronz");
  return terms.length ? terms : ["jewelry","jewellery","takı","mücevher"];
}

function detectTurkeyConnection(text) {
  const lower = String(text || "").toLowerCase();
  const patterns = [
    "made in turkey","made in türkiye","sourced from turkey","sourcing from turkey",
    "turkey supplier","turkish supplier","istanbul","turkish jewelry","turkish jewellery",
    "turkish brand","turkey-made","made in istanbul","manufactured in turkey",
    "crafted in turkey","crafted in istanbul","imported from turkey","from turkey"
  ];
  const hits = patterns.filter((p) => lower.includes(p));
  return { matched: hits.length > 0, hits };
}

function scoreText(text, payload) {
  const lower = text.toLowerCase();
  let score = 0;
  const terms = materialTerms(payload);
  if (terms.some(t => lower.includes(t))) score += 35;
  if (/retail|store|shop|stockist|boutique|multibrand|department store|e-commerce|ecommerce/.test(lower)) score += 20;
  if (/wholesale|distributor|importer|agent|showroom|supplier|vendor|buyer|buying/.test(lower)) score += 20;
  if (/bracelet|ring|necklace|earring|jewelry|jewellery|takı|mücevher/.test(lower)) score += 15;
  if (/international|shipping|delivery|in stock|add to cart|shop now/.test(lower)) score += 10;

  const turkeyConnection = detectTurkeyConnection(text);
  if (String(payload?.turkeyPriority || "") === "turkey-linked" && turkeyConnection.matched) {
    score += 25;
  }

  return Math.min(100, score);
}

// Read-only bounded fanout; results preserve query order for deterministic dedup.
async function mapConcurrent(items, limit, mapper) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(items.length, limit) }, async () => {
    while (next < items.length) {
      const index = next++;
      try { out[index] = await mapper(items[index], index); }
      catch { out[index] = null; }
    }
  }));
  return out;
}

export async function freeDiscovery(payload, knownDomains = new Set()) {
  const searchQueries = queriesFor(payload);
  const searchResults = await mapConcurrent(searchQueries, 3, async (query) => {
    try { return await searchDuck(query); } catch { return []; }
  });
  const raw = searchResults.flatMap((batch) => Array.isArray(batch) ? batch : []);

  const byDomain = new Map();
  for (const item of raw) {
    const domain = normalizeDomain(item.url);
    if (!domain || domain.endsWith("duckduckgo.com")) continue;
    if (EXCLUDED_DOMAINS.has(domain) || knownDomains.has(domain)) continue;
    if (!byDomain.has(domain)) byDomain.set(domain, { ...item, domain });
  }

  const targetLimit = Math.max(1, Math.min(8, Number(payload?.limit || 6)));
  // Score before fetching 6-page contact crawls to avoid unnecessary I/O.
  const screened = [...byDomain.values()]
    .map(item => ({ ...item, preScore: scoreText(`${item.title} ${item.snippet}`, payload) }))
    .filter(item => item.preScore >= 35)
    .slice(0, 18);

  const outcomes = await mapConcurrent(screened, 4, async (item) => {
    const contact = await freeOfficialContactEnrich(item.domain);
    if (!contact.live) return null;
    const searchText = `${item.title} ${item.snippet}`;
    const turkeyConnection = detectTurkeyConnection(searchText);
    return {
      company: item.title
        .replace(/\s+[|–—-]\s+.*$/, "")
        .replace(/\bOfficial Site\b/gi, "")
        .trim() || item.domain,
      domain: item.domain,
      country: payload?.geography || null,
      category: (payload?.customerTypes || []).join(" / ") || null,
      material: payload?.material || null,
      decisionMaker: null,
      role: null,
      email: contact.email || null,
      phoneWhatsapp: contact.phoneWhatsapp || null,
      signals: [
        "Discovered via zero-API web search.",
        "Official domain reachable.",
        `Deterministic commercial-fit score: ${item.preScore}.`,
        String(payload?.turkeyPriority || "") === "domestic"
          ? "Turkey domestic priority lane."
          : String(payload?.turkeyPriority || "") === "turkey-linked"
            ? turkeyConnection.matched
              ? `Turkey connection detected: ${turkeyConnection.hits.join(", ")}.`
              : "Turkey-linked priority lane; explicit connection evidence still requires confirmation."
            : "General global lane.",
      ],
      sourceUrls: [...new Set([item.url, ...(contact.sourceUrls || [])])],
      deterministicScore: item.preScore,
      searchEvidence: {
        title: item.title,
        snippet: item.snippet,
        searchUrl: item.searchUrl,
      },
    };
  });
  const candidates = outcomes.filter(Boolean).slice(0, targetLimit);

  return {
    ok: candidates.length > 0,
    backend: "zero-api-duckduckgo-official-site",
    summary: `Found ${candidates.length} deterministic candidates without paid API.`,
    leads: candidates,
    evidence: candidates.flatMap(c => (c.sourceUrls || []).map(url => ({
      url,
      title: c.company,
      claim: c.signals.join(" "),
    }))),
  };
}

export async function freeVerifyCandidate(candidate, payload) {
  if (!candidate?.domain) {
    return { ok: false, score: 0, reasons: ["Candidate has no usable domain."], verifiedUrls: [], warnings: [] };
  }

  const contact = await freeOfficialContactEnrich(candidate.domain);
  if (!contact.live) {
    return { ok: false, score: 0, reasons: ["Official domain was not reachable."], verifiedUrls: [], warnings: [] };
  }

  const base = Number(candidate.deterministicScore || 50);
  let score = base;
  if (contact.email) score += 10;
  if (contact.phoneWhatsapp) score += 5;
  score = Math.min(100, score);

  return {
    ok: score >= 55,
    score,
    reasons: [
      "Candidate was found by zero-API public web search.",
      "Official company domain was reachable.",
      contact.email ? "Official-site email found." : "No official-site email found yet.",
      contact.phoneWhatsapp ? "Explicit official-site WhatsApp link found." : "No explicit WhatsApp link found.",
    ],
    verifiedUrls: contact.sourceUrls || [],
    warnings: ["Deterministic verifier used because paid AI provider is unavailable."],
    mergedContact: contact,
  };
}
