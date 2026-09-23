import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const testsPath = new URL('../tests/tests.json', import.meta.url);
let source = fs.readFileSync(appPath, 'utf8');

if (!source.includes("from './LiveConcierge'")) {
  const lucideEnd = "} from 'lucide-react';\n";
  if (!source.includes(lucideEnd)) throw new Error('lucide import anchor missing');
  source = source.replace(
    lucideEnd,
    `${lucideEnd}import { AdminPersistenceBridge } from './AdminPersistenceBridge';\nimport { LiveConcierge } from './LiveConcierge';\nimport { loadPublishedSiteConfig, submitRFQ } from './oskaPlatform';\nimport { oskaText } from './oskaLocale';\n`
  );
}

const contactStart = source.indexOf('function ContactPage({');
const contactEnd = source.indexOf('function PageHero({');
if (contactStart < 0 || contactEnd < 0 || contactEnd <= contactStart) throw new Error('ContactPage anchors missing');
const contactReplacement = `function ContactPage({\n  lang,\n  favorites,\n}: {\n  lang: Lang;\n  favorites: Set<string>;\n}) {\n  const text = oskaText(lang).rfq;\n  const [status, setStatus] = useState('');\n  const [busy, setBusy] = useState(false);\n  const saved = PRODUCTS.filter(p => favorites.has(p.slug)).map(p => p.code);\n\n  const submit = async (e: FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    if (busy) return;\n    const form = e.currentTarget;\n    const data = new FormData(form);\n    const company = String(data.get('company') || '').trim();\n    const email = String(data.get('email') || '').trim();\n    const message = String(data.get('message') || '').trim();\n    const consent = data.get('consent') === 'on';\n    if (!company || !/^\\S+@\\S+\\.\\S+$/.test(email) || !message || !consent) {\n      setStatus(text.validation);\n      return;\n    }\n    setBusy(true);\n    setStatus('');\n    try {\n      await submitRFQ({\n        company,\n        email,\n        name: String(data.get('name') || '').trim(),\n        phone: String(data.get('phone') || '').trim(),\n        whatsapp: String(data.get('whatsapp') || '').trim(),\n        market: String(data.get('market') || '').trim(),\n        category: String(data.get('category') || '').trim(),\n        materialFinish: String(data.get('materialFinish') || '').trim(),\n        targetQuantity: String(data.get('targetQuantity') || '').trim(),\n        preferredContact: String(data.get('preferredContact') || '').trim(),\n        references: saved,\n        message,\n        consent,\n        website: String(data.get('website') || ''),\n      });\n      setStatus(text.stored);\n      form.reset();\n    } catch {\n      setStatus(text.failed);\n    } finally {\n      setBusy(false);\n    }\n  };\n\n  return (\n    <main className=\"page\">\n      <PageHero eyebrow={text.eyebrow} title={text.title} body={text.body} />\n      <section className=\"section form-layout\">\n        <div>\n          <span className=\"eyebrow\">REQUEST FOR QUOTATION</span>\n          <h2>{text.introTitle}</h2>\n          <p>{text.introBody}</p>\n          {saved.length > 0 && (\n            <div className=\"shortlist-note\">\n              <Check size={16} /> {text.shortlist}: {saved.join(', ')}\n            </div>\n          )}\n        </div>\n        <form className=\"rfq-form\" onSubmit={submit} noValidate>\n          <label>{text.company}<input name=\"company\" /></label>\n          <label>{text.name}<input name=\"name\" /></label>\n          <label>{text.email}<input name=\"email\" type=\"email\" /></label>\n          <label>{text.phone}<input name=\"phone\" type=\"tel\" /></label>\n          <label>{text.whatsapp}<input name=\"whatsapp\" type=\"tel\" /></label>\n          <label>{text.market}<input name=\"market\" /></label>\n          <label>{text.category}<input name=\"category\" /></label>\n          <label>{text.materialFinish}<input name=\"materialFinish\" /></label>\n          <label>{text.targetQuantity}<input name=\"targetQuantity\" inputMode=\"numeric\" /></label>\n          <label>\n            {text.preferredContact}\n            <select name=\"preferredContact\" defaultValue=\"email\">\n              <option value=\"email\">{text.preferredEmail}</option>\n              <option value=\"whatsapp\">{text.preferredWhatsapp}</option>\n              <option value=\"phone\">{text.preferredPhone}</option>\n            </select>\n          </label>\n          <label className=\"rfq-message\">{text.message}<textarea name=\"message\" rows={5} /></label>\n          <label className=\"rfq-consent\"><input name=\"consent\" type=\"checkbox\" /> <span>{text.consent}</span></label>\n          <input name=\"website\" tabIndex={-1} autoComplete=\"off\" className=\"honeypot\" aria-hidden=\"true\" />\n          <button className=\"button dark\" type=\"submit\" disabled={busy}>\n            {busy ? text.saving : text.submit}<ArrowRight size={16} />\n          </button>\n          {status && <p className=\"form-status\" role=\"status\">{status}</p>}\n        </form>\n      </section>\n    </main>\n  );\n}\n\n`;
source = source.slice(0, contactStart) + contactReplacement + source.slice(contactEnd);

const guideStart = source.indexOf('function DigitalGuide({');
const guideEnd = source.indexOf('function ManualControlPanel({');
if (guideStart < 0 || guideEnd < 0 || guideEnd <= guideStart) throw new Error('DigitalGuide anchors missing');
const guideReplacement = `function DigitalGuide({\n  lang,\n  go,\n  route,\n  favorites,\n}: {\n  lang: Lang;\n  go: (r: string) => void;\n  route: string;\n  favorites: Set<string>;\n}) {\n  const shortlist = PRODUCTS.filter(product => favorites.has(product.slug)).map(product => product.code);\n  return <LiveConcierge lang={lang} route={route} shortlist={shortlist} go={go} />;\n}\n\n`;
source = source.slice(0, guideStart) + guideReplacement + source.slice(guideEnd);

const manualInit = "  const [manual, setManualState] = useState<ManualSettings>(() => readManualSettings());";
if (!source.includes(manualInit)) throw new Error('manual init anchor missing');
source = source.replace(
  manualInit,
  "  const [manual, setManualState] = useState<ManualSettings>(() => route === 'admin' ? readManualSettings() : DEFAULT_MANUAL_SETTINGS);"
);

const setManualBlock = `  const setManual = (next: ManualSettings) => {\n    setManualState(next);\n    localStorage.setItem(MANUAL_SETTINGS_KEY, JSON.stringify(next));\n  };`;
if (!source.includes(setManualBlock)) throw new Error('setManual anchor missing');
source = source.replace(
  setManualBlock,
  `${setManualBlock}\n  useEffect(() => {\n    if (route === 'admin') return;\n    let active = true;\n    loadPublishedSiteConfig()\n      .then(config => {\n        if (active && config) {\n          setManualState({ ...DEFAULT_MANUAL_SETTINGS, ...(config as Partial<ManualSettings>) });\n        }\n      })\n      .catch(() => undefined);\n    return () => { active = false; };\n  }, [route]);`
);

const editorHeaderEnd = `      </header>\n\n      <div className=\"visual-editor-workspace\">`;
if (!source.includes(editorHeaderEnd)) throw new Error('visual editor header anchor missing');
source = source.replace(
  editorHeaderEnd,
  `      </header>\n\n      <AdminPersistenceBridge lang={lang} value={manual} onLoad={next => setManual(next)} />\n\n      <div className=\"visual-editor-workspace\">`
);

const guideCall = '<DigitalGuide lang={lang} go={go} />';
if (!source.includes(guideCall)) throw new Error('DigitalGuide call anchor missing');
source = source.replace(
  guideCall,
  '<DigitalGuide lang={lang} go={go} route={route} favorites={favorites} />'
);

fs.writeFileSync(appPath, source);

const tests = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
const guideTest = tests.find(test => test.name === 'Search the verified catalogue and use the digital guide');
if (guideTest) {
  guideTest.name = 'Search the verified catalogue and use grounded OSKA Concierge';
  guideTest.covers = ['search page', 'verified search results', 'grounded concierge', 'RFQ fallback'];
  guideTest.description = 'Verifies verified catalogue search remains available and the live concierge never fabricates unverified commercial facts.';
  guideTest.steps = ['Open Search from the footer and search for Panther', 'Open a verified Panther result', 'Open OSKA Concierge and ask for an unverified price or MOQ'];
  guideTest.expected = 'The verified Panther product opens, then the concierge refuses to invent the requested commercial fact and offers the RFQ handoff.';
}
fs.writeFileSync(testsPath, JSON.stringify(tests, null, 2) + '\n');
