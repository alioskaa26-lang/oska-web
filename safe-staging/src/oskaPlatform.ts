import { api, auth } from '@appdeploy/client';
import type { OskaLang } from './oskaLocale';

export type SiteConfig = Record<string, unknown>;

export type RFQPayload = {
  company: string;
  email: string;
  market?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  category?: string;
  materialFinish?: string;
  targetQuantity?: string;
  references?: string[];
  message: string;
  preferredContact?: string;
  consent?: boolean;
  website?: string;
};

export type ConciergePayload = {
  lang: OskaLang;
  route: string;
  productSlug?: string;
  shortlist: string[];
  message: string;
};

export type ConciergeResponse = {
  answer: string;
  certainty: 'verified' | 'needs_confirmation';
  handoff: 'none' | 'rfq' | 'whatsapp';
  suggestedRoutes: string[];
  whatsappUrl?: string;
};

export async function loadPublishedSiteConfig(): Promise<SiteConfig | null> {
  const { data } = await api.get('/api/site');
  const result = data as { config?: SiteConfig | null };
  return result.config ?? null;
}

export async function isAdminConfigured(): Promise<boolean> {
  const { data } = await api.get('/api/admin/configured');
  const result = data as { configured?: boolean };
  return Boolean(result.configured);
}

export async function adminSignIn() {
  return auth.signIn({ scope: 'openid email profile offline_access' });
}

export async function adminSignOut() {
  await auth.signOut();
}

export function adminIsSignedIn() {
  return auth.isSignedIn();
}

export async function saveSiteDraft(config: SiteConfig, note = '') {
  const { data } = await api.post('/api/admin/site/draft', { config, note });
  return data as { ok: true; versionId: string };
}

export async function publishSiteDraft(note = '') {
  const { data } = await api.post('/api/admin/site/publish', { note });
  return data as { ok: true; versionId: string };
}

export async function listSiteVersions() {
  const { data } = await api.get('/api/admin/site/versions');
  return data as { versions: Array<Record<string, unknown>> };
}

export async function rollbackSiteVersion(versionId: string) {
  const { data } = await api.post('/api/admin/site/rollback', { versionId });
  return data as { ok: true; versionId: string };
}

export async function submitRFQ(payload: RFQPayload) {
  const { data } = await api.post('/api/rfq', payload);
  return data as { stored: true; id: string };
}

export async function askConcierge(payload: ConciergePayload): Promise<ConciergeResponse> {
  const { data } = await api.post('/api/concierge', payload);
  return data as ConciergeResponse;
}
