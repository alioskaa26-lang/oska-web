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
  const brass = /brass|bronze|pirinç|bronz/.test(mat);
  const silver = /925|silver|gümüş|sterling/.test(mat);

  const place = turkey ? "Turkey" : "";
  const material = brass && silver
    ? '"sterling silver" OR brass jewelry'
    : brass
      ? 'brass jewelry OR bronze jewelry'
      : '"925 sterling silver" jewelry';

  return [
    `${material} retailer stockist ${place}`.trim(),
    `${material} distributor wholesaler ${place}`.trim(),
    `${material} multibrand jewelry store ${place}`.trim(),
  ];
}

function materialTerms(payload) {
  const mat = String(payload?.material || "").toLowerCase();
  const terms = [];
  if (/925|silver|gümüş|sterling/.test(mat)) terms.push("925","sterling","silver","gümüş");
  if (/brass|bronze|pirinç|bronz/.test(mat)) terms.push("brass","bronze","pirinç","bronz");
  return terms.length ? terms : ["jewelry","jewellery","takı","mücevher"];
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
  return Math.min(100, score);
}

export async function freeDiscovery(payload, knownDomains = new Set()) {
  const raw = [];
  for (const query of queriesFor(payload)) {
    try {
      raw.push(...await searchDuck(query));
    } catch {}
  }

  const byDomain = new Map();
  for (const item of raw) {
    const domain = normalizeDomain(item.url);
    if (!domain) continue;
    if (domain.endsWith("duckduckgo.com")) continue;
    if (EXCLUDED_DOMAINS.has(domain)) continue;
    if (knownDomains.has(domain)) continue;
    if (!byDomain.has(domain)) byDomain.set(domain, { ...item, domain });
  }

  const targetLimit = Math.max(1, Math.min(8, Number(payload?.limit || 6)));
  const candidates = [];

  for (const item of [...byDomain.values()].slice(0, 18)) {
    const contact = await freeOfficialContactEnrich(item.domain);
    if (!contact.live) continue;

    const searchText = `${item.title} ${item.snippet}`;
    const score = scoreText(searchText, payload);
    if (score < 35) continue;

    candidates.push({
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
        `Deterministic commercial-fit score: ${score}.`,
      ],
      sourceUrls: [...new Set([item.url, ...(contact.sourceUrls || [])])],
      deterministicScore: score,
      searchEvidence: {
        title: item.title,
        snippet: item.snippet,
        searchUrl: item.searchUrl,
      },
    });

    if (candidates.length >= targetLimit) break;
  }

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
