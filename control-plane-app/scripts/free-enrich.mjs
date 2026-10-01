const CONTACT_TERMS = [
  "contact","contact-us","iletisim","iletişim","about","about-us","team",
  "wholesale","vendor","supplier","suppliers","partner","become-a-partner",
  "corporate","kurumsal","bize-ulasin","bize-ulaşın"
];

const COMMON_PATHS = [
  "/","/contact","/contact-us","/iletisim","/iletisim/","/pages/contact",
  "/pages/contact-us","/about","/about-us","/wholesale","/vendor",
  "/suppliers","/become-a-partner"
];

function normalizeDomain(value) {
  if (!value || typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function decodeBasicEntities(text) {
  return text
    .replace(/&#64;|&commat;/gi, "@")
    .replace(/&#46;|&period;/gi, ".")
    .replace(/&amp;/gi, "&");
}

function cleanEmail(value) {
  if (!value) return null;
  const email = decodeURIComponent(String(value))
    .replace(/^mailto:/i, "")
    .split("?")[0]
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return null;
  if (/(example\.com|sentry|wixpress|shopify|cloudflare|noreply|no-reply)/i.test(email)) return null;
  return email;
}

function emailRank(email) {
  const local = email.split("@")[0];
  if (/buyer|buying|purchase|purchasing|procurement|wholesale|vendor/.test(local)) return 0;
  if (/sales|business|commercial|b2b/.test(local)) return 1;
  if (/info|hello|contact|office/.test(local)) return 2;
  if (/support|care|customer/.test(local)) return 4;
  return 3;
}

function extractEmails(html) {
  const found = new Set();

  for (const match of html.matchAll(/mailto:([^"'<>\s]+)/gi)) {
    const email = cleanEmail(match[1]);
    if (email) found.add(email);
  }

  const text = decodeBasicEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

  for (const match of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    const email = cleanEmail(match[0]);
    if (email) found.add(email);
  }

  return [...found].sort((a,b) => emailRank(a) - emailRank(b));
}

function extractWhatsapp(html) {
  const candidates = [];

  for (const match of html.matchAll(/https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send)\/[^"'<>\s]*/gi)) {
    candidates.push(match[0]);
  }

  for (const match of html.matchAll(/https?:\/\/wa\.me\/(\d{7,15})/gi)) {
    candidates.push(`https://wa.me/${match[1]}`);
  }

  for (const match of html.matchAll(/api\.whatsapp\.com\/send\?[^"'<>\s]*phone=(\d{7,15})/gi)) {
    candidates.push(`https://wa.me/${match[1]}`);
  }

  return [...new Set(candidates)][0] || null;
}

function discoverContactLinks(html, baseUrl) {
  const urls = new Set();
  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(match[1], baseUrl);
      if (u.origin !== new URL(baseUrl).origin) continue;
      const s = (u.pathname + " " + u.search).toLowerCase();
      if (CONTACT_TERMS.some(term => s.includes(term))) {
        u.hash = "";
        urls.add(u.toString());
      }
    } catch {}
  }
  return [...urls];
}

async function fetchHtml(url, timeoutMs = 8000) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; OSKA-Contact-Research/1.0)",
        "accept": "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const type = response.headers.get("content-type") || "";
    if (!response.ok || !type.includes("text/html")) return null;
    const html = await response.text();
    return {
      url: response.url || url,
      html: html.slice(0, 1_500_000),
    };
  } catch {
    return null;
  }
}

export async function freeOfficialContactEnrich(domain) {
  const host = normalizeDomain(domain);
  if (!host) {
    return {
      live: false,
      email: null,
      phoneWhatsapp: null,
      sourceUrls: [],
      pagesChecked: 0,
    };
  }

  let home = await fetchHtml(`https://${host}/`);
  if (!home) home = await fetchHtml(`https://www.${host}/`);
  if (!home) {
    return {
      live: false,
      email: null,
      phoneWhatsapp: null,
      sourceUrls: [],
      pagesChecked: 0,
    };
  }

  const origin = new URL(home.url).origin;
  const candidates = new Set([home.url]);

  for (const url of discoverContactLinks(home.html, home.url)) {
    candidates.add(url);
    if (candidates.size >= 6) break;
  }

  for (const path of COMMON_PATHS) {
    if (candidates.size >= 6) break;
    try { candidates.add(new URL(path, origin).toString()); } catch {}
  }

  const urls = [...candidates].slice(0, 6);
  const pages = [home];
  const extraUrls = urls.filter((url) => url !== home.url);
  const extraPages = await Promise.all(extraUrls.map((url) => fetchHtml(url)));
  for (const page of extraPages) {
    if (page) pages.push(page);
  }

  const emails = new Set();
  let whatsapp = null;
  const evidence = [];

  for (const page of pages) {
    const pageEmails = extractEmails(page.html);
    for (const email of pageEmails) emails.add(email);

    const wa = extractWhatsapp(page.html);
    if (!whatsapp && wa) whatsapp = wa;

    if (pageEmails.length || wa) evidence.push(page.url);
  }

  const sortedEmails = [...emails].sort((a,b) => emailRank(a) - emailRank(b));

  return {
    live: true,
    email: sortedEmails[0] || null,
    emails: sortedEmails,
    phoneWhatsapp: whatsapp,
    sourceUrls: evidence.length ? evidence : [home.url],
    pagesChecked: pages.length,
  };
}
