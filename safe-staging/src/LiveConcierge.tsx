import { FormEvent, useState } from 'react';
import { ArrowRight, MessageCircle, X } from 'lucide-react';
import { askConcierge, type ConciergeResponse } from './oskaPlatform';
import { oskaText, type OskaLang } from './oskaLocale';

export function LiveConcierge({
  lang,
  route,
  shortlist,
  go,
}: {
  lang: OskaLang;
  route: string;
  shortlist: string[];
  go: (route: string) => void;
}) {
  const text = oskaText(lang).concierge;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<ConciergeResponse | null>(null);
  const [failed, setFailed] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const next = await askConcierge({ lang, route, shortlist, message: clean });
      setReply(next);
    } catch {
      setReply(null);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guide live-concierge">
      <button
        className="guide-trigger"
        onClick={() => setOpen(value => !value)}
        aria-label={
          open
            ? lang === 'en'
              ? 'Close OSKA Concierge'
              : 'OSKA Concierge kapat'
            : lang === 'en'
              ? 'Open OSKA Concierge'
              : 'OSKA Concierge aç'
        }
      >
        <MessageCircle size={21} />
      </button>
      {open && (
        <div className="guide-panel" role="dialog" aria-label={text.title}>
          <div className="guide-head">
            <div>
              <span className="eyebrow">{text.title}</span>
              <p>{text.subtitle}</p>
            </div>
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label={lang === 'en' ? 'Close' : 'Kapat'}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={submit} className="concierge-form">
            <textarea
              rows={3}
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder={text.placeholder}
              maxLength={1200}
            />
            <button className="button dark" type="submit" disabled={busy || !message.trim()}>
              {busy ? text.thinking : text.send}
            </button>
          </form>
          {(reply || failed) && (
            <div className="concierge-answer" aria-live="polite">
              <p>{failed ? text.error : reply?.answer}</p>
              {!failed && reply?.certainty === 'needs_confirmation' && <small>{text.fallback}</small>}
              <div className="guide-actions">
                {(failed || reply?.handoff === 'rfq' || reply?.certainty === 'needs_confirmation') && (
                  <button
                    onClick={() => {
                      go('contact');
                      setOpen(false);
                    }}
                  >
                    {text.rfq}
                    <ArrowRight size={15} />
                  </button>
                )}
                {reply?.handoff === 'whatsapp' && reply.whatsappUrl && (
                  <a href={reply.whatsappUrl} target="_blank" rel="noreferrer">
                    {text.whatsapp}
                    <ArrowRight size={15} />
                  </a>
                )}
                {reply?.suggestedRoutes.map(suggested => (
                  <button
                    key={suggested}
                    onClick={() => {
                      go(suggested);
                      setOpen(false);
                    }}
                  >
                    {suggested.replace(/-/g, ' ')}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
