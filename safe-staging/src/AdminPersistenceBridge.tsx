import { useEffect, useState } from 'react';
import {
  adminIsSignedIn,
  adminSignIn,
  adminSignOut,
  isAdminConfigured,
  loadPublishedSiteConfig,
  publishSiteDraft,
  saveSiteDraft,
} from './oskaPlatform';
import { oskaText, type OskaLang } from './oskaLocale';

export function AdminPersistenceBridge<T extends object>({
  lang,
  value,
  onLoad,
}: {
  lang: OskaLang;
  value: T;
  onLoad: (value: T) => void;
}) {
  const text = oskaText(lang).admin;
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [signedIn, setSignedIn] = useState(() => adminIsSignedIn());
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isAdminConfigured().then(setConfigured).catch(() => setConfigured(false));
  }, []);

  const act = async (task: () => Promise<void>) => {
    setBusy(true);
    setStatus('');
    try {
      await task();
    } catch {
      setStatus(text.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="visual-editor-persistence" aria-label={text.title}>
      <div>
        <strong>{text.title}</strong>
        <small>{configured ? text.persistenceReady : text.persistenceLocked}</small>
      </div>
      <div className="visual-editor-persistence-actions">
        {!signedIn ? (
          <button
            className="button outline"
            disabled={!configured || busy}
            onClick={() => act(async () => { await adminSignIn(); setSignedIn(true); })}
          >
            {text.signIn}
          </button>
        ) : (
          <>
            <button
              className="button outline"
              disabled={busy}
              onClick={() => act(async () => {
                const next = await loadPublishedSiteConfig();
                if (next) onLoad(next as unknown as T);
              })}
            >
              {text.loadPublished}
            </button>
            <button
              className="button outline"
              disabled={busy}
              onClick={() => act(async () => {
                await saveSiteDraft(value as unknown as Record<string, unknown>);
                setStatus(text.draftSaved);
              })}
            >
              {text.serverDraft}
            </button>
            <button
              className="button dark"
              disabled={busy}
              onClick={() => act(async () => {
                await saveSiteDraft(value as unknown as Record<string, unknown>);
                await publishSiteDraft();
                setStatus(text.published);
              })}
            >
              {text.publish}
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => act(async () => { await adminSignOut(); setSignedIn(false); })}
            >
              {text.signOut}
            </button>
          </>
        )}
      </div>
      {status && <p className="form-status" role="status">{status}</p>}
    </section>
  );
}
