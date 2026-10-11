import { z } from "zod";

// Pure research/QA guard. This module NEVER writes Queue, contacts customers or calls a provider.
const blockedHosts = new Set([
  "trendyol.com","hepsiburada.com","amazon.com","amazon.com.tr",
  "etsy.com","shopier.com","hipicon.com","beymen.com","n11.com",
  "pazarama.com","ciceksepeti.com","pttavm.com","ebay.com",
  "wolfandbadger.com","instagram.com","facebook.com","tiktok.com",
  "linkedin.com","pinterest.com","youtube.com","google.com",
]);
const excludedNames = ["akgun silver","else silver","demir bijuteri","demir bujuteri","tekbir","else tespihane","else tesbihane"];
const metals = [
  "sterling_925","solid_gold_9k","solid_gold_10k",
  "solid_gold_14k","solid_gold_18k","fine_silver",
  "vermeil","brass","bronze",
];
export const publicLeadSchema = z.object({
  company: z.string().trim().min(2),
  legalName: z.string().trim().optional(),
  domain: z.string().trim().min(4),
  brand: z.string().trim().optional(),
  country: z.string().trim().min(2),
  itemUrl: z.url(),
  evidenceUrls: z.array(z.url()).min(1).max(15),
  verifiedMetal: z.enum(metals),
  currentItem: z.boolean(),
  independentSeller: z.boolean(),
  independentSourcingEvidence: z.boolean().default(false),
  b2bEconomicEvidence: z.boolean().default(false),
  grandBazaarFocused: z.boolean().default(false),
  makerOnly: z.boolean().default(false),
}).strict();

export function normalizedFirm(value) {
  return String(value || "").normalize("NFKD").toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ı]/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
}
export function actualApex(value) {
  try {
    const raw = String(value || "").trim();
    const url = new URL(raw.includes("://") ? raw : "https://" + raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
    if (!host.includes(".") || host === "localhost" || host.endsWith(".local") ||
        /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) return null;
    if ([...blockedHosts].some(blocked => host === blocked || host.endsWith("." + blocked))) return null;
    return host;
  } catch { return null; }
}
export function sameFirm(a, b) {
  const aa = actualApex(a.domain);
  const bb = actualApex(b.domain);
  if (aa && bb && aa === bb) return true;
  const namesA = [a.legalName, a.company].map(normalizedFirm).filter(Boolean);
  const namesB = [b.legalName, b.company].map(normalizedFirm).filter(Boolean);
  // Name overlap is a review alert, not an automatic merge across countries.
  return Boolean(a.country && b.country &&
    normalizedFirm(a.country) === normalizedFirm(b.country) &&
    namesA.some(x => namesB.includes(x)));
}
export function assessPublicLead(raw, known = []) {
  const parsed = publicLeadSchema.safeParse(raw);
  if (!parsed.success) return {status:"SOURCE_SEED",reason:"SCHEMA_INVALID",issues:parsed.error.issues.map(x=>x.path.join("."))};
  const candidate = parsed.data;
  const apex = actualApex(candidate.domain);
  if (!apex || !candidate.independentSeller) return {status:"SOURCE_SEED",reason:"TRUE_RETAILER_APEX_UNPROVEN"};
  const name = normalizedFirm(candidate.company + " " + (candidate.legalName || ""));
  if (candidate.grandBazaarFocused || excludedNames.some(x => name.includes(x))) return {status:"REJECT",reason:"EXCLUDED_FIRM"};
  if (known.some(existing=>sameFirm(candidate,existing))) return {status:"DUPLICATE_REJECT",reason:"EXISTING_LEGAL_FIRM_OR_APEX"};
  const itemApex = actualApex(candidate.itemUrl);
  if (itemApex !== apex || !candidate.currentItem || !candidate.evidenceUrls.includes(candidate.itemUrl))
    return {status:"SOURCE_SEED",reason:"CURRENT_SAME_SELLER_ITEM_UNPROVEN"};
  if (candidate.makerOnly && !candidate.independentSourcingEvidence)
    return {status:"LOW_PRIORITY",reason:"NO_EVIDENCED_OUTSIDE_BUYING"};
  // Evidence sufficient to queue an independent verification, never to assert a sale.
  if (!candidate.independentSourcingEvidence && !candidate.b2bEconomicEvidence)
    return {status:"QUALIFICATION_REVIEW",reason:"B2B_FIT_NOT_ESTABLISHED"};
  return {status:"VERIFIER_PENDING",reason:"REQUIRES_INDEPENDENT_QUEUE_DEDUP_AND_PASS",apex};
}
