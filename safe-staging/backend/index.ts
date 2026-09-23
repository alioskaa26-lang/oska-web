import {
  ai,
  db,
  error,
  json,
  requireAdminEmailAllowlist,
  requireAuth,
  router,
  secrets,
  type RouterContext,
  type RouterMiddleware,
} from '@appdeploy/sdk';

type SiteVersion = {
  config: Record<string, unknown>;
  status: 'draft' | 'published' | 'rollback';
  createdAt: string;
  actor?: string;
  note?: string;
};

type SitePointer = {
  draftId?: string;
  publishedId?: string;
  updatedAt: string;
};

type RFQBody = {
  company?: string;
  email?: string;
  market?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  category?: string;
  materialFinish?: string;
  targetQuantity?: string;
  references?: string[];
  message?: string;
  preferredContact?: string;
  consent?: boolean;
  website?: string;
};

type ConciergeBody = {
  lang?: 'en' | 'tr';
  route?: string;
  productSlug?: string;
  shortlist?: string[];
  message?: string;
};

type ConciergeStructuredReply = {
  answer: string;
  certainty: 'verified' | 'needs_confirmation';
  handoff: 'none' | 'rfq' | 'whatsapp';
  suggestedRoutes: string[];
};

const SITE_VERSIONS = 'oska_site_versions';
const SITE_POINTER = 'oska_site_pointer';
const RFQS = 'oska_rfqs';

async function getAdminEmails() {
  const names = await secrets.listSecretNames();
  if (!names.includes('OSKA_ADMIN_EMAILS')) return [];
  const raw = await secrets.readSecret('OSKA_ADMIN_EMAILS');
  return raw
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
}

const dynamicAdminGate: RouterMiddleware = async (ctx: RouterContext) => {
  const gate = requireAdminEmailAllowlist(await getAdminEmails());
  return gate(ctx);
};

async function readPointer() {
  const { items } = await db.list<SitePointer>(SITE_POINTER, { limit: 1 });
  return items[0] ?? null;
}

async function writePointer(next: SitePointer) {
  const current = await readPointer();
  if (!current) {
    const [id] = await db.add(SITE_POINTER, [next]);
    if (!id) throw new Error('site_pointer_create_failed');
    return id;
  }
  const [ok] = await db.update(SITE_POINTER, [{ id: current.id, record: next }]);
  if (!ok) throw new Error('site_pointer_update_failed');
  return current.id;
}

async function readVersion(id?: string) {
  if (!id) return null;
  const [record] = await db.get<SiteVersion>(SITE_VERSIONS, [id]);
  return record;
}

function cleanText(value: unknown, max: number) {
  return String(value ?? '').trim().slice(0, max);
}

function safeWhatsAppUrl(config: Record<string, unknown> | null) {
  const candidate = typeof config?.whatsappUrl === 'string' ? config.whatsappUrl.trim() : '';
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(candidate)) return candidate;
  return undefined;
}

const highRiskFactIntent = /(price|pricing|cost|usd|eur|try|fiyat|ücret|maliyet|moq|min(?:imum)? order|minimum sipariş|lead[ -]?time|termin|delivery time|stock|stok|capacity|kapasite|dimension|dimensions|ölçü|gram|weight|ağırlık|karat|carat)/i;

const unsupportedCommercialValue = /(?:[$€£]\s?\d|\d+(?:[.,]\d+)?\s?(?:USD|EUR|GBP|TRY|TL|adet|pcs?|pieces?|g|gram|grams?|kg|mm|cm|days?|weeks?|gün|hafta)\b|(?:moq|minimum order|minimum sipariş|lead[ -]?time|termin|stock|stok|capacity|kapasite|dimension|dimensions|ölçü|weight|ağırlık).{0,40}\d)/i;

function confirmationReply(lang: 'en' | 'tr') {
  return lang === 'tr'
    ? 'Bu bilgi doğrulanmış OSKA içeriğinde yer almıyor. Fiyat, MOQ, termin, stok, kapasite ve teknik spesifikasyonlar proje bazında teyit edilir; RFQ ile devam edebilirsiniz.'
    : 'That information is not present in verified OSKA content. Price, MOQ, lead time, stock, capacity and technical specifications are confirmed per project; please continue with an RFQ.';
}

function normalizeConciergeReply(
  value: Partial<ConciergeStructuredReply> | null,
  lang: 'en' | 'tr',
  whatsappUrl?: string,
) {
  const fallback = confirmationReply(lang);
  const answer = cleanText(value?.answer, 1800);
  const unsafe = !answer || unsupportedCommercialValue.test(answer);
  const certainty = unsafe || value?.certainty !== 'verified' ? 'needs_confirmation' : 'verified';
  let handoff: ConciergeStructuredReply['handoff'] = value?.handoff === 'whatsapp' || value?.handoff === 'rfq' || value?.handoff === 'none'
    ? value.handoff
    : 'rfq';
  if (certainty === 'needs_confirmation' && handoff === 'none') handoff = 'rfq';
  if (handoff === 'whatsapp' && !whatsappUrl) handoff = 'rfq';
  const allowedRoutes = new Set([
    'home',
    'women',
    'men',
    'bracelets',
    'collections',
    'manufacturing',
    'private-label',
    'world',
    'search-page',
    'favorites',
    'contact',
  ]);
  const suggestedRoutes = Array.isArray(value?.suggestedRoutes)
    ? value.suggestedRoutes.filter(routeName => allowedRoutes.has(routeName)).slice(0, 3)
    : [];
  return {
    answer: unsafe ? fallback : answer,
    certainty,
    handoff,
    suggestedRoutes: certainty === 'needs_confirmation' && !suggestedRoutes.includes('contact')
      ? [...suggestedRoutes, 'contact'].slice(0, 3)
      : suggestedRoutes,
    whatsappUrl: handoff === 'whatsapp' ? whatsappUrl : undefined,
  };
}

export const handler = router({
  'GET /api/_healthcheck': [async () => json({ ok: true, service: 'oska-web-foundation' })],

  'GET /api/site': [async () => {
    const pointer = await readPointer();
    const published = await readVersion(pointer?.publishedId);
    return json({ configured: Boolean(published), versionId: pointer?.publishedId ?? null, config: published?.config ?? null });
  }],

  'GET /api/admin/configured': [async () => {
    const emails = await getAdminEmails();
    return json({ configured: emails.length > 0 });
  }],

  'POST /api/admin/site/draft': [
    requireAuth(),
    dynamicAdminGate,
    async ctx => {
      const body = (ctx.body ?? {}) as { config?: unknown; note?: unknown };
      if (!body.config || typeof body.config !== 'object' || Array.isArray(body.config)) {
        return error('invalid_site_config', 400);
      }
      const record: SiteVersion = {
        config: body.config as Record<string, unknown>,
        status: 'draft',
        createdAt: new Date().toISOString(),
        actor: ctx.user?.email,
        note: cleanText(body.note, 500),
      };
      const [versionId] = await db.add(SITE_VERSIONS, [record]);
      if (!versionId) return error('draft_save_failed', 500);
      const pointer = await readPointer();
      await writePointer({ draftId: versionId, publishedId: pointer?.publishedId, updatedAt: new Date().toISOString() });
      return json({ ok: true, versionId });
    },
  ],

  'POST /api/admin/site/publish': [
    requireAuth(),
    dynamicAdminGate,
    async ctx => {
      const pointer = await readPointer();
      const draft = await readVersion(pointer?.draftId);
      if (!pointer?.draftId || !draft) return error('no_draft_to_publish', 409);
      const record: SiteVersion = {
        ...draft,
        status: 'published',
        createdAt: new Date().toISOString(),
        actor: ctx.user?.email,
        note: cleanText((ctx.body as { note?: unknown } | null)?.note, 500),
      };
      const [versionId] = await db.add(SITE_VERSIONS, [record]);
      if (!versionId) return error('publish_failed', 500);
      await writePointer({ draftId: pointer.draftId, publishedId: versionId, updatedAt: new Date().toISOString() });
      return json({ ok: true, versionId });
    },
  ],

  'GET /api/admin/site/versions': [
    requireAuth(),
    dynamicAdminGate,
    async () => {
      const { items } = await db.list<SiteVersion>(SITE_VERSIONS, { limit: 25 });
      const versions = items
        .map(({ id, status, createdAt, actor, note }) => ({ id, status, createdAt, actor, note }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json({ versions });
    },
  ],

  'POST /api/admin/site/rollback': [
    requireAuth(),
    dynamicAdminGate,
    async ctx => {
      const versionId = cleanText((ctx.body as { versionId?: unknown } | null)?.versionId, 100);
      const previous = await readVersion(versionId);
      if (!versionId || !previous) return error('version_not_found', 404);
      const rollback: SiteVersion = {
        ...previous,
        status: 'rollback',
        createdAt: new Date().toISOString(),
        actor: ctx.user?.email,
        note: `Rollback from ${versionId}`,
      };
      const [rollbackId] = await db.add(SITE_VERSIONS, [rollback]);
      if (!rollbackId) return error('rollback_failed', 500);
      const pointer = await readPointer();
      await writePointer({ draftId: pointer?.draftId, publishedId: rollbackId, updatedAt: new Date().toISOString() });
      return json({ ok: true, versionId: rollbackId });
    },
  ],

  'POST /api/rfq': [async ctx => {
    const body = (ctx.body ?? {}) as RFQBody;
    if (cleanText(body.website, 200)) return error('invalid_request', 400);
    const company = cleanText(body.company, 160);
    const emailAddress = cleanText(body.email, 240).toLowerCase();
    const message = cleanText(body.message, 4000);
    if (!company || !/^\S+@\S+\.\S+$/.test(emailAddress) || !message || body.consent !== true) {
      return error('invalid_rfq', 400);
    }
    const references = Array.isArray(body.references)
      ? body.references.map(value => cleanText(value, 80)).filter(Boolean).slice(0, 30)
      : [];
    const record = {
      company,
      email: emailAddress,
      market: cleanText(body.market, 120),
      name: cleanText(body.name, 160),
      phone: cleanText(body.phone, 80),
      whatsapp: cleanText(body.whatsapp, 80),
      category: cleanText(body.category, 120),
      materialFinish: cleanText(body.materialFinish, 200),
      targetQuantity: cleanText(body.targetQuantity, 100),
      references,
      message,
      preferredContact: cleanText(body.preferredContact, 80),
      consent: true,
      status: 'new',
      source: 'oska-web',
      createdAt: new Date().toISOString(),
    };
    const [id] = await db.add(RFQS, [record]);
    if (!id) return error('rfq_store_failed', 500);
    return json({ stored: true, id }, 201);
  }],

  'POST /api/concierge': [async ctx => {
    const body = (ctx.body ?? {}) as ConciergeBody;
    const lang = body.lang === 'tr' ? 'tr' : 'en';
    const message = cleanText(body.message, 1200);
    if (!message) return error('message_required', 400);
    const pointer = await readPointer();
    const published = await readVersion(pointer?.publishedId);
    const publicConfig = published?.config ?? null;
    const whatsappUrl = safeWhatsAppUrl(publicConfig);
    const shortlist = Array.isArray(body.shortlist)
      ? body.shortlist.map(value => cleanText(value, 80)).filter(Boolean).slice(0, 20)
      : [];
    const route = cleanText(body.route, 120) || 'home';
    const productSlug = cleanText(body.productSlug, 120);

    if (highRiskFactIntent.test(message)) {
      return json(normalizeConciergeReply({
        answer: confirmationReply(lang),
        certainty: 'needs_confirmation',
        handoff: whatsappUrl ? 'whatsapp' : 'rfq',
        suggestedRoutes: ['contact'],
      }, lang, whatsappUrl));
    }

    const verifiedCatalogue = [
      'OSK-PAN-01 Panther Bracelet — Panther collection — white/silver-tone visual variant',
      'OSK-PAN-02 Panther Bracelet — Panther collection — black/dark-detail visual variant',
      'OSK-MSH-01 Mesh Bracelet — Mesh collection — white/silver-tone visual variant',
      'OSK-MSH-02 Mesh Bracelet — Mesh collection — gold-tone visual variant',
      'OSK-MAN-01 Manhattan Mesh Bracelet — Mesh collection',
      'OSK-STA-01 Silver Station Mesh Bracelet — Signature collection',
    ].join('\n');
    const verifiedContext = JSON.stringify(publicConfig ?? {});

    try {
      const result = await ai.generate({
        system: `You are OSKA Concierge for a premium B2B jewelry catalogue. Reply only from the verified context below. Never invent or estimate price, MOQ, lead time, stock, capacity, dimensions, weight, material composition, stones, certifications or other technical specifications. If the requested fact is absent, clearly say it requires confirmation and recommend RFQ. Never imply retail checkout. Keep the answer concise, premium and helpful. Reply in ${lang === 'tr' ? 'Turkish' : 'English'}. Current route: ${route}. Current product slug: ${productSlug || 'none'}. Shortlist: ${shortlist.join(', ') || 'none'}. Verified catalogue:\n${verifiedCatalogue}\nPublished owner-approved site config:\n${verifiedContext}`,
        prompt: message,
        schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            certainty: { type: 'string', enum: ['verified', 'needs_confirmation'] },
            handoff: { type: 'string', enum: ['none', 'rfq', 'whatsapp'] },
            suggestedRoutes: { type: 'array', items: { type: 'string' } },
          },
          required: ['answer', 'certainty', 'handoff', 'suggestedRoutes'],
        },
        maxTokens: 500,
        temperature: 0.1,
        thinkingMode: 'FAST',
      });
      let parsed: Partial<ConciergeStructuredReply> | null = null;
      try {
        parsed = JSON.parse(result.text) as ConciergeStructuredReply;
      } catch {
        parsed = null;
      }
      return json(normalizeConciergeReply(parsed, lang, whatsappUrl));
    } catch {
      return json(normalizeConciergeReply({
        answer: confirmationReply(lang),
        certainty: 'needs_confirmation',
        handoff: whatsappUrl ? 'whatsapp' : 'rfq',
        suggestedRoutes: ['contact'],
      }, lang, whatsappUrl));
    }
  }],
});
