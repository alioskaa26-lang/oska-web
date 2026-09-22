import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  Heart,
  Menu,
  MessageCircle,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

type Lang = 'en' | 'tr';
type Product = {
  slug: string;
  name: string;
  code: string;
  collection: string;
  finish: string;
  variant: string;
  story: string;
};

const PRODUCTS: Product[] = [
  {
    slug: 'panther-bracelet-silver',
    name: 'Panther Bracelet',
    code: 'OSK-PAN-01',
    collection: 'Panther',
    finish: 'White',
    variant: 'Silver tone',
    story:
      'Sculptural panther language developed for a strong, contemporary bracelet silhouette.',
  },
  {
    slug: 'panther-bracelet-black',
    name: 'Panther Bracelet',
    code: 'OSK-PAN-02',
    collection: 'Panther',
    finish: 'Black',
    variant: 'Dark detail',
    story:
      'A darker finish study within the Panther family, presented as a product-specific variant.',
  },
  {
    slug: 'mesh-bracelet-white',
    name: 'Mesh Bracelet',
    code: 'OSK-MSH-01',
    collection: 'Mesh',
    finish: 'White',
    variant: 'Silver tone',
    story:
      'Articulated mesh construction focused on movement, hand feel and a clean profile.',
  },
  {
    slug: 'mesh-bracelet-gold',
    name: 'Mesh Bracelet',
    code: 'OSK-MSH-02',
    collection: 'Mesh',
    finish: 'Gold',
    variant: 'Gold tone',
    story:
      'The same articulated family translated into a warm finish without changing the site palette.',
  },
  {
    slug: 'manhattan-mesh',
    name: 'Manhattan Mesh Bracelet',
    code: 'OSK-MAN-01',
    collection: 'Mesh',
    finish: 'White',
    variant: 'Silver tone',
    story:
      'A structured bracelet concept balancing architectural geometry with flexible construction.',
  },
  {
    slug: 'silver-station-mesh',
    name: 'Silver Station Mesh Bracelet',
    code: 'OSK-STA-01',
    collection: 'Signature',
    finish: 'White',
    variant: 'Silver tone',
    story:
      'A station-led bracelet concept for clients seeking a refined, repeatable collection language.',
  },
];

const PRODUCT_STORY_TR: Record<string, string> = {
  'panther-bracelet-silver':
    'Güçlü ve çağdaş bir bileklik silüeti için geliştirilen heykelsi Panther tasarım dili.',
  'panther-bracelet-black':
    'Panther ailesinin daha koyu bitişli yorumu; ürüne özel varyant olarak sunulur.',
  'mesh-bracelet-white':
    'Hareket, elde his ve temiz profil odağında geliştirilen eklemli mesh konstrüksiyon.',
  'mesh-bracelet-gold':
    'Aynı eklemli ürün ailesinin site paletini değiştirmeden sıcak tonda yorumlanmış versiyonu.',
  'manhattan-mesh':
    'Mimari geometriyi esnek konstrüksiyonla dengeleyen yapılandırılmış bileklik yaklaşımı.',
  'silver-station-mesh':
    'Rafine ve tekrarlanabilir koleksiyon dili arayan markalar için station odaklı bileklik yaklaşımı.',
};

const getProductStory = (product: Product, lang: Lang) =>
  lang === 'tr' ? PRODUCT_STORY_TR[product.slug] ?? product.story : product.story;

const copy = {
  en: {
    announcement:
      'Istanbul atelier · B2B catalogue · Private label & production',
    nav: [
      'Women',
      'Men',
      'Collections',
      'Manufacturing',
      'Private Label',
      'OSKA World',
    ],
    heroEyebrow: 'CRAFTED IN ISTANBUL',
    heroTitle: 'Jewelry made for\nlasting partnerships.',
    heroBody:
      'A premium B2B catalogue for collections, private-label development and controlled production.',
    heroCta: 'Discover collections',
    quote: 'Request quotation',
    discover: 'Discover the Collection',
    categories: 'Shop by Category',
    forBrands: 'For Brands',
    atelier: 'The Art of Making',
    serviceTitle: 'At your service',
    assistant: 'OSKA Digital Guide',
    assistantHint:
      'Verified site guidance — no invented pricing, MOQ or lead-time.',
  },
  tr: {
    announcement: 'İstanbul atölyesi · B2B katalog · Private label ve üretim',
    nav: [
      'Kadın',
      'Erkek',
      'Koleksiyonlar',
      'Üretim',
      'Private Label',
      'OSKA Dünyası',
    ],
    heroEyebrow: 'İSTANBUL’DA ÜRETİLDİ',
    heroTitle: 'Kalıcı iş ortaklıkları\niçin mücevher.',
    heroBody:
      'Koleksiyon, private-label geliştirme ve kontrollü üretim için premium B2B katalog.',
    heroCta: 'Koleksiyonları keşfet',
    quote: 'Teklif iste',
    discover: 'Koleksiyonu Keşfet',
    categories: 'Kategoriye Göre Keşfet',
    forBrands: 'Markalar İçin',
    atelier: 'Üretim Sanatı',
    serviceTitle: 'Size nasıl yardımcı olabiliriz?',
    assistant: 'OSKA Dijital Rehber',
    assistantHint:
      'Doğrulanmış site yönlendirmesi — fiyat, MOQ veya termin uydurmaz.',
  },
};

const routeMap: Record<string, string> = {
  Women: 'women',
  Kadın: 'women',
  Men: 'men',
  Erkek: 'men',
  Collections: 'collections',
  Koleksiyonlar: 'collections',
  Manufacturing: 'manufacturing',
  Üretim: 'manufacturing',
  'Private Label': 'private-label',
  'OSKA World': 'world',
  'OSKA Dünyası': 'world',
};

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'home';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (next: string) => {
    window.location.hash = `#/${next}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return { route, go };
}

function MediaBlock({
  label,
  verified = false,
  tall = false,
}: {
  label: string;
  verified?: boolean;
  tall?: boolean;
}) {
  return (
    <div
      className={`media-block ${tall ? 'tall' : ''} ${verified ? 'verified' : ''}`}
      aria-label={label}
    >
      <span className="media-mark">OSKA</span>
      <span className="media-label">{label}</span>
    </div>
  );
}

function ProductCard({
  product,
  favorites,
  toggleFavorite,
  open,
}: {
  product: Product;
  favorites: Set<string>;
  toggleFavorite: (slug: string) => void;
  open: (slug: string) => void;
}) {
  const saved = favorites.has(product.slug);
  return (
    <article className="product-card">
      <button
        className="product-media"
        onClick={() => open(product.slug)}
        aria-label={`Open ${product.name}`}
      >
        <MediaBlock
          label={`${product.collection} · ${product.finish}`}
          verified
        />
      </button>
      <button
        className={`heart-button ${saved ? 'saved' : ''}`}
        onClick={() => toggleFavorite(product.slug)}
        aria-label={
          saved
            ? `Remove ${product.name} from favorites`
            : `Save ${product.name} to favorites`
        }
        aria-pressed={saved}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button className="product-meta" onClick={() => open(product.slug)}>
        <span className="eyebrow">{product.collection}</span>
        <strong>{product.name}</strong>
        <span>
          {product.finish} · {product.code}
        </span>
      </button>
    </article>
  );
}

function Header({
  lang,
  setLang,
  favoritesCount,
  go,
}: {
  lang: Lang;
  setLang: (v: Lang) => void;
  favoritesCount: number;
  go: (r: string) => void;
}) {
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const closeDrawer = () => {
    setOpen(false);
    requestAnimationFrame(() => menuTriggerRef.current?.focus());
  };
  const closeSearch = () => {
    setSearchOpen(false);
    requestAnimationFrame(() => searchTriggerRef.current?.focus());
  };

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (searchOpen) closeSearch();
      else if (open) closeDrawer();
      setActiveMenu(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, searchOpen]);

  useEffect(() => {
    if (!open && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, searchOpen]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return (
    <>
      <div className="announcement">{t.announcement}</div>
      <header className="site-header">
        <div className="header-row">
          <button
            ref={searchTriggerRef}
            className="icon-button search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label={lang === 'en' ? 'Search' : 'Ara'}
          >
            <Search size={20} />
          </button>
          <button
            className="brand"
            onClick={() => go('home')}
            aria-label="OSKA SILVER home"
          >
            <span>OSKA</span>
            <small>SILVER</small>
          </button>
          <div className="header-tools">
            <button
              className="lang-button"
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
              aria-label={lang === 'en' ? 'Change language' : 'Dili değiştir'}
            >
              <Globe2 size={16} /> {lang.toUpperCase()}
            </button>
            <button
              className="icon-button header-favorites"
              onClick={() => go('favorites')}
              aria-label={
                lang === 'en'
                  ? `Favorites, ${favoritesCount} saved`
                  : `Favoriler, ${favoritesCount} kayıtlı`
              }
            >
              <Heart size={19} />
              <span className="count">{favoritesCount}</span>
            </button>
            <button
              className="text-button desktop-only"
              onClick={() => go('contact')}
            >
              {t.quote}
            </button>
            <button
              ref={menuTriggerRef}
              className="icon-button mobile-menu-button"
              onClick={() => setOpen(true)}
              aria-label={lang === 'en' ? 'Open menu' : 'Menüyü aç'}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
        <div className="desktop-nav-shell" onMouseLeave={() => setActiveMenu(null)}>
          <nav
            className="desktop-nav"
            aria-label={lang === 'en' ? 'Primary navigation' : 'Ana navigasyon'}
          >
            {t.nav.map(item => (
              <button
                key={item}
                onClick={() => {
                  go(routeMap[item]);
                  setActiveMenu(null);
                }}
                onMouseEnter={() => setActiveMenu(item)}
                onFocus={() => setActiveMenu(item)}
                aria-expanded={activeMenu === item}
              >
                {item}
              </button>
            ))}
          </nav>
          {activeMenu && (
            <div className="mega-menu" aria-label={`${activeMenu} menu`}>
              <div className="mega-menu-grid">
                <div className="mega-intro">
                  <span className="eyebrow">OSKA SILVER</span>
                  <h2>{activeMenu}</h2>
                  <p>
                    {lang === 'en'
                      ? 'Move from collection discovery to verified product detail, development capability and RFQ without a retail checkout detour.'
                      : 'Perakende ödeme akışına sapmadan koleksiyon keşfinden doğrulanmış ürün detayına, üretim kabiliyetine ve RFQ’ya ilerleyin.'}
                  </p>
                </div>
                <div className="mega-column">
                  <span className="mega-label">{lang === 'en' ? 'Categories' : 'Kategoriler'}</span>
                  {[
                    [lang === 'en' ? 'Bracelets' : 'Bileklik', 'bracelets'],
                    [lang === 'en' ? 'Rings' : 'Yüzük', 'rings'],
                    [lang === 'en' ? 'Necklaces' : 'Kolye', 'necklaces'],
                    [lang === 'en' ? 'Earrings' : 'Küpe', 'earrings'],
                  ].map(([label, route]) => (
                    <button key={label} onClick={() => { go(route); setActiveMenu(null); }}>
                      {label}<ArrowRight size={14} />
                    </button>
                  ))}
                </div>
                <div className="mega-column">
                  <span className="mega-label">{lang === 'en' ? 'Collections' : 'Koleksiyonlar'}</span>
                  {['Panther', 'Mesh', 'Signature'].map(label => (
                    <button key={label} onClick={() => { go('collections'); setActiveMenu(null); }}>
                      {label}<ArrowRight size={14} />
                    </button>
                  ))}
                </div>
                <div className="mega-column">
                  <span className="mega-label">{lang === 'en' ? 'For brands' : 'Markalar için'}</span>
                  {[
                    [lang === 'en' ? 'Manufacturing' : 'Üretim', 'manufacturing'],
                    ['Private Label', 'private-label'],
                    [lang === 'en' ? 'Contact / RFQ' : 'İletişim / RFQ', 'contact'],
                  ].map(([label, route]) => (
                    <button key={label} onClick={() => { go(route); setActiveMenu(null); }}>
                      {label}<ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      {open && (
        <div
          className="drawer-backdrop"
          onMouseDown={e => e.target === e.currentTarget && closeDrawer()}
        >
          <aside
            ref={drawerRef}
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'en' ? 'Mobile navigation' : 'Mobil navigasyon'}
            onKeyDown={event => {
              if (event.key !== 'Tab') return;
              const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
              );
              if (!focusable?.length) return;
              const first = focusable.item(0);
              const last = focusable.item(focusable.length - 1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <div className="drawer-head">
              <span className="eyebrow">OSKA SILVER</span>
              <button
                className="icon-button"
                onClick={closeDrawer}
                aria-label={lang === 'en' ? 'Close menu' : 'Menüyü kapat'}
              >
                <X size={22} />
              </button>
            </div>
            <button
              className="drawer-search"
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={18} /> {lang === 'en' ? 'Search' : 'Ara'}
            </button>
            <div className="drawer-links">
              {t.nav.map(item => (
                <button
                  key={item}
                  onClick={() => {
                    go(routeMap[item]);
                    setOpen(false);
                  }}
                >
                  {item}
                  <ArrowRight size={18} />
                </button>
              ))}
            </div>
            <div className="drawer-actions">
              <button
                className="drawer-favorites"
                onClick={() => {
                  go('favorites');
                  setOpen(false);
                }}
              >
                <Heart size={17} />
                {lang === 'en'
                  ? `Favorites (${favoritesCount})`
                  : `Favoriler (${favoritesCount})`}
              </button>
              <button
                onClick={() => {
                  go('contact');
                  setOpen(false);
                }}
              >
                {t.quote}
              </button>
              <button onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}>
                {lang === 'en' ? 'Türkçe' : 'English'}
              </button>
            </div>
          </aside>
        </div>
      )}
      {searchOpen && (
        <SearchOverlay lang={lang} close={closeSearch} go={go} />
      )}
    </>
  );
}

function SearchOverlay({
  lang,
  close,
  go,
}: {
  lang: Lang;
  close: () => void;
  go: (r: string) => void;
}) {
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const results = PRODUCTS.filter(p =>
    `${p.name} ${p.code} ${p.collection} ${p.finish}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'en' ? 'Site search' : 'Site araması'}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable.item(0);
        const last = focusable.item(focusable.length - 1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="search-panel" ref={panelRef}>
        <div className="search-head">
          <Search size={20} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Search products, collections, services'
                : 'Ürün, koleksiyon veya hizmet ara'
            }
          />
          <button
            className="icon-button"
            onClick={close}
            aria-label={lang === 'en' ? 'Close search' : 'Aramayı kapat'}
          >
            <X size={22} />
          </button>
        </div>
        <div className="search-results">
          {query.length < 2 ? (
            <p className="muted">
              {lang === 'en'
                ? 'Try “Panther”, “Mesh”, “Private Label” or a product code.'
                : '“Panther”, “Mesh”, “Private Label” veya ürün kodu deneyin.'}
            </p>
          ) : results.length ? (
            results.map(p => (
              <button
                key={p.slug}
                onClick={() => {
                  go(`product/${p.slug}`);
                  close();
                }}
              >
                <span>{p.name}</span>
                <small>
                  {p.code} · {p.finish}
                </small>
              </button>
            ))
          ) : (
            <p className="muted">
              {lang === 'en'
                ? 'No verified catalogue match.'
                : 'Doğrulanmış katalog eşleşmesi yok.'}
            </p>
          )}
          <div className="search-destinations">
            <button
              onClick={() => {
                go('manufacturing');
                close();
              }}
            >
              {lang === 'en' ? 'Manufacturing' : 'Üretim'}
            </button>
            <button
              onClick={() => {
                go('private-label');
                close();
              }}
            >
              Private Label
            </button>
            <button
              onClick={() => {
                go('contact');
                close();
              }}
            >
              RFQ / Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPage({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const results = normalized.length < 2
    ? PRODUCTS
    : PRODUCTS.filter(product =>
        `${product.name} ${product.code} ${product.collection} ${product.finish}`
          .toLowerCase()
          .includes(normalized)
      );
  return (
    <main className="page">
      <PageHero
        eyebrow="SEARCH"
        title={lang === 'en' ? 'Find a product or a production path.' : 'Ürün veya üretim yolunu bulun.'}
        body={
          lang === 'en'
            ? 'Search verified catalogue references, then continue to manufacturing, private label or RFQ when the brief is broader than one product.'
            : 'Doğrulanmış katalog referanslarını arayın; brief tek ürünün ötesindeyse üretim, private label veya RFQ akışına geçin.'
        }
      />
      <section className="section search-page-layout">
        <div className="search-page-field">
          <Search size={20} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={lang === 'en' ? 'Search Panther, Mesh, code or finish' : 'Panther, Mesh, kod veya kaplama ara'}
            aria-label={lang === 'en' ? 'Search catalogue' : 'Katalogda ara'}
          />
        </div>
        <div className="search-page-grid" aria-live="polite">
          {results.map(product => (
            <button key={product.slug} onClick={() => go(`product/${product.slug}`)}>
              <span className="eyebrow">{product.collection}</span>
              <strong>{product.name}</strong>
              <small>{product.code} · {product.finish}</small>
              <ArrowRight size={16} />
            </button>
          ))}
          {!results.length && (
            <div className="empty-search">
              <p>{lang === 'en' ? 'No verified catalogue match.' : 'Doğrulanmış katalog eşleşmesi yok.'}</p>
              <button className="button dark" onClick={() => go('contact')}>
                {lang === 'en' ? 'Continue with RFQ' : 'RFQ ile devam et'}
              </button>
            </div>
          )}
        </div>
        <div className="search-service-row">
          <button onClick={() => go('manufacturing')}>{lang === 'en' ? 'Manufacturing' : 'Üretim'}<ArrowRight size={15} /></button>
          <button onClick={() => go('private-label')}>Private Label<ArrowRight size={15} /></button>
          <button onClick={() => go('contact')}>{lang === 'en' ? 'Contact / RFQ' : 'İletişim / RFQ'}<ArrowRight size={15} /></button>
        </div>
      </section>
    </main>
  );
}

function Hero({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const t = copy[lang];
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`hero ${paused ? 'paused' : ''}`}
      aria-label={lang === 'en' ? 'Single hero video region' : 'Tek hero video alanı'}
    >
      <div className="hero-safe-media" aria-hidden="true">
        <div className="hero-grain" />
      </div>
      <div className="hero-copy">
        <span className="eyebrow light">{t.heroEyebrow}</span>
        <h1>
          {t.heroTitle.split('\n').map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p>{t.heroBody}</p>
        <div className="hero-actions">
          <button className="button light" onClick={() => go('collections')}>
            {t.heroCta}
            <ArrowRight size={16} />
          </button>
          <button className="button ghost-light" onClick={() => go('contact')}>
            {t.quote}
          </button>
        </div>
      </div>
      <button
        className="hero-control"
        onClick={() => setPaused(!paused)}
        aria-label={lang === 'en' ? (paused ? 'Play hero' : 'Pause hero') : (paused ? 'Hero videoyu oynat' : 'Hero videoyu duraklat')}
      >
        {paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
      <div className="staging-media-note">
        SINGLE HERO · EXISTING MEDIA CONTRACT PRESERVED
      </div>
    </section>
  );
}

function Home({
  lang,
  go,
  favorites,
  toggleFavorite,
}: {
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
}) {
  const t = copy[lang];
  return (
    <>
      <Hero lang={lang} go={go} />
      <section className="section product-rail-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">PANTHER · MESH · SIGNATURE</span>
            <h2>{t.discover}</h2>
          </div>
          <button className="link-button" onClick={() => go('bracelets')}>
            View all <ArrowRight size={16} />
          </button>
        </div>
        <div className="product-rail">
          {PRODUCTS.slice(0, 4).map(p => (
            <ProductCard
              key={p.slug}
              product={p}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              open={slug => go(`product/${slug}`)}
            />
          ))}
        </div>
      </section>
      <section className="editorial split-editorial">
        <MediaBlock
          label={lang === 'en' ? 'OSKA-owned Panther editorial media slot' : 'OSKA Panther editorial medya alanı'}
          verified
          tall
        />
        <div className="editorial-copy">
          <span className="eyebrow">PANTHER COLLECTION</span>
          <h2>
            {lang === 'en'
              ? 'A sculptural signature, built for movement.'
              : 'Hareket için tasarlanmış heykelsi bir imza.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'A focused bracelet language that combines strong silhouettes, surface detail and controlled finish variants.'
              : 'Güçlü siluetleri, yüzey detayını ve kontrollü renk varyantlarını bir araya getiren odaklı bileklik dili.'}
          </p>
          <button className="link-button" onClick={() => go('collections')}>
            Explore Panther <ArrowRight size={16} />
          </button>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">PRODUCT FAMILIES</span>
            <h2>{t.categories}</h2>
          </div>
        </div>
        <div className="category-grid">
          <button onClick={() => go('bracelets')} className="category-card">
            <MediaBlock label={lang === 'en' ? 'Verified bracelet catalogue media' : 'Doğrulanmış bileklik katalog medyası'} verified />
            <strong>{lang === 'en' ? 'Bracelets' : 'Bileklik'}</strong>
            <span>
              {lang === 'en' ? 'View catalogue' : 'Kataloğu gör'}{' '}
              <ArrowRight size={15} />
            </span>
          </button>
          {['rings', 'necklaces', 'earrings'].map(key => (
            <button key={key} onClick={() => go(key)} className="category-card">
              <MediaBlock label={lang === 'en' ? 'Verified category media pending' : 'Doğrulanmış kategori medyası bekleniyor'} />
              <strong>
                {key === 'rings'
                  ? lang === 'en'
                    ? 'Rings'
                    : 'Yüzük'
                  : key === 'necklaces'
                    ? lang === 'en'
                      ? 'Necklaces'
                      : 'Kolye'
                    : lang === 'en'
                      ? 'Earrings'
                      : 'Küpe'}
              </strong>
              <span>
                {lang === 'en'
                  ? 'Manufacturing capability'
                  : 'Üretim kabiliyeti'}{' '}
                <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="editorial full-editorial dark-editorial">
        <div className="editorial-copy wide">
          <span className="eyebrow light">MESH / ARTICULATED</span>
          <h2>
            {lang === 'en'
              ? 'Engineering movement into metal.'
              : 'Metale hareket kazandırmak.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Flexible constructions, repeatable finishing and a production workflow built around approved samples.'
              : 'Esnek konstrüksiyonlar, tekrarlanabilir yüzey kalitesi ve onaylı numune etrafında kurulan üretim akışı.'}
          </p>
          <button className="button light" onClick={() => go('manufacturing')}>
            Manufacturing <ArrowRight size={16} />
          </button>
        </div>
      </section>
      <section className="section brand-section">
        <div className="brand-copy">
          <span className="eyebrow">{t.forBrands.toUpperCase()}</span>
          <h2>
            {lang === 'en'
              ? 'From brief to production, one controlled workflow.'
              : 'Brief’ten üretime, tek kontrollü iş akışı.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Private-label development, CAD coordination, sampling, approval, production, QC and packing coordination.'
              : 'Private label geliştirme, CAD koordinasyonu, numune, onay, üretim, kalite kontrol ve paketleme koordinasyonu.'}
          </p>
          <button className="button dark" onClick={() => go('private-label')}>
            {t.forBrands}
            <ArrowRight size={16} />
          </button>
        </div>
        <MediaBlock
          label={lang === 'en' ? 'Grand Bazaar workshop / craft media slot' : 'Kapalıçarşı atölye / zanaat medya alanı'}
          tall
        />
      </section>
      <section className="section process-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">ISTANBUL ATELIER</span>
            <h2>{t.atelier}</h2>
          </div>
        </div>
        <div className="process-grid">
          {[
            'Brief',
            'CAD / Development',
            'Sample',
            'Approval',
            'Production',
            'QC & Packing',
          ].map((step, i) => (
            <article key={step}>
              <span>0{i + 1}</span>
              <h3>{step}</h3>
              <p>
                {lang === 'en'
                  ? 'Verified project information advances to the next controlled stage.'
                  : 'Doğrulanmış proje bilgisi bir sonraki kontrollü aşamaya geçer.'}
              </p>
            </article>
          ))}
        </div>
      </section>
      <ServiceSection lang={lang} go={go} />
    </>
  );
}

function AudiencePage({
  type,
  lang,
  go,
}: {
  type: 'women' | 'men';
  lang: Lang;
  go: (r: string) => void;
}) {
  const title =
    type === 'women'
      ? lang === 'en'
        ? 'Women'
        : 'Kadın'
      : lang === 'en'
        ? 'Men'
        : 'Erkek';
  return (
    <main className="page">
      <PageHero
        eyebrow={title.toUpperCase()}
        title={
          lang === 'en'
            ? `${title} — collection-led discovery`
            : `${title} — koleksiyon odaklı keşif`
        }
        body={
          lang === 'en'
            ? 'Browse verified bracelet catalogue pieces and category-specific production capabilities without fabricated inventory.'
            : 'Doğrulanmış bileklik ürünlerini ve uydurma envanter olmadan kategori bazlı üretim kabiliyetlerini keşfedin.'
        }
      />
      <section className="section">
        <div className="category-grid">
          <button className="category-card" onClick={() => go('bracelets')}>
            <MediaBlock label="Verified bracelet catalogue media" verified />
            <strong>{lang === 'en' ? 'Bracelets' : 'Bileklik'}</strong>
            <span>
              Catalogue <ArrowRight size={15} />
            </span>
          </button>
          {['rings', 'necklaces', 'earrings'].map(r => (
            <button key={r} className="category-card" onClick={() => go(r)}>
              <MediaBlock label={lang === 'en' ? 'Category-specific media pending' : 'Kategoriye özel medya bekleniyor'} />
              <strong>
                {r === 'rings'
                  ? lang === 'en'
                    ? 'Rings'
                    : 'Yüzük'
                  : r === 'necklaces'
                    ? lang === 'en'
                      ? 'Necklaces'
                      : 'Kolye'
                    : lang === 'en'
                      ? 'Earrings'
                      : 'Küpe'}
              </strong>
              <span>
                {lang === 'en' ? 'Capability' : 'Kabiliyet'}{' '}
                <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="editorial split-editorial">
        <MediaBlock label={lang === 'en' ? `${title} editorial media slot` : `${title} editorial medya alanı`} tall />
        <div className="editorial-copy">
          <span className="eyebrow">OSKA COLLECTIONS</span>
          <h2>
            {lang === 'en'
              ? 'Product families first, then specification.'
              : 'Önce ürün ailesi, sonra spesifikasyon.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Use the catalogue to shortlist direction, then move into finish, dimensions, sample and production discussion.'
              : 'Katalogdan tasarım yönünü belirleyin; ardından kaplama, ölçü, numune ve üretim görüşmesine geçin.'}
          </p>
          <button className="button dark" onClick={() => go('contact')}>
            {copy[lang].quote}
          </button>
        </div>
      </section>
    </main>
  );
}

function BraceletsPage({
  lang,
  go,
  favorites,
  toggleFavorite,
}: {
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
}) {
  const [finish, setFinish] = useState('All');
  const [collection, setCollection] = useState('All');
  const [sort, setSort] = useState('curated');
  const filtered = useMemo(() => {
    let items = PRODUCTS.filter(
      p =>
        (finish === 'All' || p.finish === finish) &&
        (collection === 'All' || p.collection === collection)
    );
    if (sort === 'name')
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'reference')
      items = [...items].sort((a, b) => a.code.localeCompare(b.code));
    return items;
  }, [finish, collection, sort]);
  return (
    <main className="page">
      <PageHero
        eyebrow={lang === 'en' ? 'BRACELETS' : 'BİLEKLİK'}
        title={
          lang === 'en'
            ? 'Bracelets — verified catalogue'
            : 'Bileklik — doğrulanmış katalog'
        }
        body={
          lang === 'en'
            ? 'Panther, mesh and signature bracelet references available for B2B review.'
            : 'B2B inceleme için Panther, mesh ve signature bileklik referansları.'
        }
      />
      <section className="section plp-section">
        <div className="plp-toolbar">
          <div className="filter-title">
            <SlidersHorizontal size={18} />
            <strong>{lang === 'en' ? 'Filter' : 'Filtre'}</strong>
            <span>
              {filtered.length} {lang === 'en' ? 'results' : 'sonuç'}
            </span>
          </div>
          <div className="filter-controls">
            <label>
              {lang === 'en' ? 'Finish' : 'Kaplama'}
              <select value={finish} onChange={e => setFinish(e.target.value)}>
                <option value="All">{lang === 'en' ? 'All' : 'Tümü'}</option>
                {[...new Set(PRODUCTS.map(p => p.finish))].map(f => (
                  <option key={f} value={f}>
                    {lang === 'en'
                      ? f
                      : ({ White: 'Beyaz', Black: 'Siyah', Gold: 'Altın' } as Record<string, string>)[f] ?? f}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {lang === 'en' ? 'Collection' : 'Koleksiyon'}
              <select
                value={collection}
                onChange={e => setCollection(e.target.value)}
              >
                <option value="All">{lang === 'en' ? 'All' : 'Tümü'}</option>
                {[...new Set(PRODUCTS.map(p => p.collection))].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              {lang === 'en' ? 'Sort' : 'Sırala'}
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="curated">{lang === 'en' ? 'Curated' : 'Seçkili'}</option>
                <option value="name">{lang === 'en' ? 'Name' : 'İsim'}</option>
                <option value="reference">{lang === 'en' ? 'Reference' : 'Referans'}</option>
              </select>
            </label>
          </div>
        </div>
        <div className="product-grid">
          {filtered.map(p => (
            <ProductCard
              key={p.slug}
              product={p}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              open={slug => go(`product/${slug}`)}
            />
          ))}
        </div>
      </section>
      <ServiceSection lang={lang} go={go} />
    </main>
  );
}

function CapabilityPage({
  kind,
  lang,
  go,
}: {
  kind: 'rings' | 'necklaces' | 'earrings';
  lang: Lang;
  go: (r: string) => void;
}) {
  const names = {
    rings: ['Rings', 'Yüzük'],
    necklaces: ['Necklaces', 'Kolye'],
    earrings: ['Earrings', 'Küpe'],
  } as const;
  const title = names[kind][lang === 'en' ? 0 : 1];
  return (
    <main className="page">
      <PageHero
        eyebrow={title.toUpperCase()}
        title={
          lang === 'en'
            ? `${title} — design & manufacturing capability`
            : `${title} — tasarım ve üretim kabiliyeti`
        }
        body={
          lang === 'en'
            ? 'This category remains capability-led until verified OSKA inventory and category-correct media are loaded.'
            : 'Doğrulanmış OSKA envanteri ve kategoriye doğru medya yüklenene kadar bu sayfa üretim kabiliyeti odaklıdır.'
        }
      />
      <section className="section capability-layout">
        <MediaBlock
          label={
            lang === 'en'
              ? `${title} verified media pending`
              : `${title} için doğrulanmış medya bekleniyor`
          }
          tall
        />
        <div>
          <span className="eyebrow">
            {lang === 'en' ? 'TRUTHFUL CATALOGUE STATE' : 'DOĞRULANMIŞ KATALOG DURUMU'}
          </span>
          <h2>
            {lang === 'en'
              ? 'No fabricated inventory.'
              : 'Uydurma envanter yok.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'We can present category-specific development, sampling and production discussions without mislabeling bracelet imagery as another category.'
              : 'Bileklik görselini başka kategoriymiş gibi göstermeden kategori bazlı geliştirme, numune ve üretim görüşmesi sunabiliriz.'}
          </p>
          <ol className="numbered-list">
            <li>
              <span>01</span>
              {lang === 'en'
                ? 'Share brief / reference'
                : 'Brief / referans paylaşımı'}
            </li>
            <li>
              <span>02</span>
              {lang === 'en'
                ? 'Develop specification'
                : 'Spesifikasyon geliştirme'}
            </li>
            <li>
              <span>03</span>
              {lang === 'en' ? 'Review sample' : 'Numune inceleme'}
            </li>
            <li>
              <span>04</span>
              {lang === 'en' ? 'Approve production' : 'Üretim onayı'}
            </li>
          </ol>
          <button className="button dark" onClick={() => go('contact')}>
            {copy[lang].quote}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

function ProductPage({
  slug,
  lang,
  go,
  favorites,
  toggleFavorite,
}: {
  slug: string;
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
}) {
  const product = PRODUCTS.find(p => p.slug === slug) ?? PRODUCTS[0];
  const related = PRODUCTS.filter(
    p =>
      p.slug !== product.slug &&
      (p.collection === product.collection || p.name === product.name)
  ).slice(0, 3);
  const saved = favorites.has(product.slug);
  return (
    <main className="pdp">
      <div className="pdp-gallery">
        <MediaBlock
          label={
            lang === 'en'
              ? `${product.name} · primary product media`
              : `${product.name} · ana ürün medyası`
          }
          verified
          tall
        />
        <div className="gallery-pair">
          <MediaBlock label={lang === 'en' ? '45° view' : '45° görünüm'} verified />
          <MediaBlock label={lang === 'en' ? 'Macro detail' : 'Makro detay'} verified />
        </div>
        <MediaBlock label={lang === 'en' ? 'Construction / clasp detail' : 'Konstrüksiyon / kilit detayı'} verified tall />
      </div>
      <aside className="pdp-panel">
        <button className="back-link" onClick={() => go('bracelets')}>
          <ArrowLeft size={15} /> {lang === 'en' ? 'Bracelets' : 'Bileklikler'}
        </button>
        <span className="eyebrow">{product.collection}</span>
        <div className="pdp-title-row">
          <h1>{product.name}</h1>
          <button
            className={`heart-button static ${saved ? 'saved' : ''}`}
            onClick={() => toggleFavorite(product.slug)}
            aria-label={
              lang === 'en'
                ? saved
                  ? 'Remove from favorites'
                  : 'Save to favorites'
                : saved
                  ? 'Favorilerden çıkar'
                  : 'Favorilere ekle'
            }
            aria-pressed={saved}
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="reference">
          {product.code} · {product.finish}
        </p>
        <p>{getProductStory(product, lang)}</p>
        <div className="variant-block">
          <span className="eyebrow">
            {lang === 'en' ? 'FINISH / VARIANT' : 'KAPLAMA / VARYANT'}
          </span>
          <div className="variant-row">
            {PRODUCTS.filter(p => p.name === product.name).map(v => (
              <button
                key={v.slug}
                onClick={() => go(`product/${v.slug}`)}
                className={v.slug === product.slug ? 'active' : ''}
              >
                <span className={`swatch swatch-${v.finish.toLowerCase()}`} />
                {v.finish}
              </button>
            ))}
          </div>
          <small>
            {lang === 'en'
              ? 'Variant changes only this product route and gallery.'
              : 'Varyant yalnızca bu ürün rotasını ve galerisini değiştirir.'}
          </small>
        </div>
        <div className="pdp-actions">
          <button className="button dark" onClick={() => go('contact')}>
            {lang === 'en' ? 'Request a quotation' : 'Teklif iste'}
            <ArrowRight size={16} />
          </button>
          <button className="button outline" onClick={() => go('contact')}>
            {lang === 'en' ? 'Request sample' : 'Numune iste'}
          </button>
          <button className="link-button" onClick={() => go('private-label')}>
            {lang === 'en' ? 'Produce for my brand' : 'Markam için üret'}{' '}
            <ArrowRight size={15} />
          </button>
        </div>
        {[
          ['story', lang === 'en' ? 'Story' : 'Hikâye'],
          ['details', lang === 'en' ? 'Details' : 'Detaylar'],
          ['materials', lang === 'en' ? 'Materials' : 'Malzemeler'],
          ['dimensions', lang === 'en' ? 'Dimensions / Size' : 'Ölçüler / Beden'],
          ['craftsmanship', lang === 'en' ? 'Craftsmanship' : 'İşçilik'],
          [
            'customization',
            lang === 'en'
              ? 'Customization / Private Label'
              : 'Özelleştirme / Private Label',
          ],
        ].map(([key, label]) => (
          <details key={key} className="disclosure">
            <summary>
              {label}
              <ChevronDown size={16} />
            </summary>
            <p>
              {key === 'materials' || key === 'dimensions'
                ? lang === 'en'
                  ? 'Confirmed per approved specification / order. No unverified claims are shown in staging.'
                  : 'Onaylı spesifikasyon / siparişe göre doğrulanır. Staging’de doğrulanmamış bilgi gösterilmez.'
                : getProductStory(product, lang)}
            </p>
          </details>
        ))}
      </aside>
      <section className="section pdp-related">
        <div className="section-head">
          <div>
            <span className="eyebrow">{lang === 'en' ? 'RELATED' : 'BENZER ÜRÜNLER'}</span>
            <h2>
              {lang === 'en' ? 'You may also like' : 'Bunları da inceleyin'}
            </h2>
          </div>
        </div>
        <div className="product-grid compact">
          {related.map(p => (
            <ProductCard
              key={p.slug}
              product={p}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              open={s => go(`product/${s}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CollectionsPage({
  lang,
  go,
}: {
  lang: Lang;
  go: (r: string) => void;
}) {
  return (
    <main className="page">
      <PageHero
        eyebrow="COLLECTIONS"
        title={
          lang === 'en'
            ? 'A clear collection architecture.'
            : 'Net bir koleksiyon mimarisi.'
        }
        body={
          lang === 'en'
            ? 'Panther, Mesh and Signature act as navigable product families rather than decorative labels.'
            : 'Panther, Mesh ve Signature yalnız dekoratif başlık değil, gezilebilir ürün aileleri olarak çalışır.'
        }
      />
      <section className="section collection-list">
        {['Panther', 'Mesh', 'Signature'].map((name, index) => (
          <article key={name}>
            <MediaBlock
              label={`${name} collection owned-media slot`}
              verified={index < 2}
              tall
            />
            <div>
              <span className="eyebrow">0{index + 1}</span>
              <h2>{name}</h2>
              <p>
                {lang === 'en'
                  ? 'A focused collection story, verified products and a clear path to quotation.'
                  : 'Odaklı koleksiyon hikâyesi, doğrulanmış ürünler ve teklife net geçiş.'}
              </p>
              <button className="link-button" onClick={() => go('bracelets')}>
                View products <ArrowRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function ManufacturingPage({
  lang,
  go,
}: {
  lang: Lang;
  go: (r: string) => void;
}) {
  return (
    <main className="page">
      <PageHero
        eyebrow="MANUFACTURING"
        title={
          lang === 'en'
            ? 'Controlled development from brief to QC.'
            : 'Brief’ten kalite kontrole kontrollü geliştirme.'
        }
        body={
          lang === 'en'
            ? 'A production story built around approved specifications, samples and repeatable quality — without unsupported capacity or lead-time claims.'
            : 'Desteksiz kapasite veya termin iddiası olmadan, onaylı spesifikasyon, numune ve tekrarlanabilir kalite etrafında kurulan üretim hikâyesi.'
        }
      />
      <section className="section capability-layout">
        <MediaBlock label={lang === 'en' ? 'OSKA workshop media slot' : 'OSKA atölye medya alanı'} tall />
        <div>
          <span className="eyebrow">WORKFLOW</span>
          <h2>
            {lang === 'en' ? 'Six controlled stages.' : 'Altı kontrollü aşama.'}
          </h2>
          <ol className="numbered-list">
            {[
              'Brief',
              'CAD / Design development',
              'Sample',
              'Approval',
              'Production',
              'QC & Packing',
            ].map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <button className="button dark" onClick={() => go('contact')}>
            {copy[lang].quote}
          </button>
        </div>
      </section>
      <section className="editorial full-editorial dark-editorial">
        <div className="editorial-copy wide">
          <span className="eyebrow light">MATERIAL / FINISH / DETAIL</span>
          <h2>
            {lang === 'en'
              ? 'Specifications before promises.'
              : 'Önce spesifikasyon, sonra taahhüt.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Material, finish, dimensions, stones, MOQ and timing are confirmed per project — not guessed on the website.'
              : 'Malzeme, kaplama, ölçü, taş, MOQ ve termin proje bazında doğrulanır; web sitesinde tahmin edilmez.'}
          </p>
        </div>
      </section>
    </main>
  );
}

function PrivateLabelPage({
  lang,
  go,
}: {
  lang: Lang;
  go: (r: string) => void;
}) {
  return (
    <main className="page">
      <PageHero
        eyebrow="PRIVATE LABEL / OEM"
        title={
          lang === 'en'
            ? 'Built for brands that need a production partner.'
            : 'Üretim partneri arayan markalar için.'
        }
        body={
          lang === 'en'
            ? 'Use OSKA as a development and manufacturing partner while retaining control over specification and approvals.'
            : 'Spesifikasyon ve onay kontrolünü koruyarak OSKA’yı geliştirme ve üretim partneri olarak kullanın.'
        }
      />
      <section className="section process-section">
        <div className="process-grid four">
          {['Brief', 'Develop', 'Approve sample', 'Produce'].map((s, i) => (
            <article key={s}>
              <span>0{i + 1}</span>
              <h3>{s}</h3>
              <p>
                {lang === 'en'
                  ? 'Move forward only when project information is confirmed.'
                  : 'Yalnız proje bilgileri doğrulandığında bir sonraki aşamaya geçilir.'}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial split-editorial">
        <MediaBlock
          label={lang === 'en' ? 'Private-label workshop / sample review media slot' : 'Private-label atölye / numune inceleme medya alanı'}
          tall
        />
        <div className="editorial-copy">
          <span className="eyebrow">FOR BRANDS</span>
          <h2>
            {lang === 'en'
              ? 'One route from reference to RFQ.'
              : 'Referanstan RFQ’ya tek rota.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Share category, desired material/finish, target quantity and project context. Unknowns remain marked for confirmation.'
              : 'Kategori, hedef malzeme/kaplama, adet ve proje bağlamını paylaşın. Bilinmeyenler doğrulama için açık bırakılır.'}
          </p>
          <button className="button dark" onClick={() => go('contact')}>
            {copy[lang].quote}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

function WorldPage({ lang }: { lang: Lang }) {
  return (
    <main className="page">
      <PageHero
        eyebrow="OSKA WORLD"
        title={
          lang === 'en'
            ? 'Istanbul craft, presented without cliché.'
            : 'İstanbul zanaatı, klişesiz bir anlatımla.'
        }
        body={
          lang === 'en'
            ? 'Grand Bazaar workshop detail, tools, hands and secular craft context create the cultural layer.'
            : 'Kapalıçarşı atölye detayları, aletler, eller ve seküler zanaat bağlamı kültürel katmanı oluşturur.'
        }
      />
      <section className="section gallery-editorial">
        <MediaBlock label={lang === 'en' ? 'Grand Bazaar passage / craft texture' : 'Kapalıçarşı geçit / zanaat dokusu'} tall />
        <MediaBlock label={lang === 'en' ? 'Jeweler tools / bench' : 'Kuyumcu aletleri / tezgâh'} tall />
        <MediaBlock label={lang === 'en' ? 'Atelier hands / detail' : 'Atölye elleri / detay'} tall />
      </section>
    </main>
  );
}

function FavoritesPage({
  lang,
  go,
  favorites,
  toggleFavorite,
}: {
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
}) {
  const items = PRODUCTS.filter(p => favorites.has(p.slug));
  return (
    <main className="page">
      <PageHero
        eyebrow="SHORTLIST"
        title={
          lang === 'en'
            ? 'Favorites / client shortlist'
            : 'Favoriler / müşteri kısa listesi'
        }
        body={
          lang === 'en'
            ? 'Saved locally in this browser. Nothing is uploaded until you submit an RFQ.'
            : 'Bu tarayıcıda yerel olarak saklanır. RFQ göndermeden hiçbir şey yüklenmez.'
        }
      />
      <section className="section">
        {items.length ? (
          <div className="product-grid">
            {items.map(p => (
              <ProductCard
                key={p.slug}
                product={p}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                open={s => go(`product/${s}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={28} />
            <h2>
              {lang === 'en'
                ? 'Your shortlist is empty.'
                : 'Kısa listeniz boş.'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Save products from the catalogue, then return here for a focused RFQ conversation.'
                : 'Katalogdan ürünleri kaydedin, ardından odaklı RFQ görüşmesi için buraya dönün.'}
            </p>
            <button className="button dark" onClick={() => go('bracelets')}>
              {lang === 'en' ? 'Browse bracelets' : 'Bileklikleri incele'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ContactPage({
  lang,
  favorites,
}: {
  lang: Lang;
  favorites: Set<string>;
}) {
  const [status, setStatus] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (
      !String(data.get('company') || '').trim() ||
      !String(data.get('email') || '').includes('@') ||
      !String(data.get('message') || '').trim()
    ) {
      setStatus(
        lang === 'en'
          ? 'Please complete company, a valid email and project message.'
          : 'Firma, geçerli e-posta ve proje mesajını tamamlayın.'
      );
      return;
    }
    setStatus(
      lang === 'en'
        ? 'Staging: RFQ transport is intentionally not connected. No request was sent.'
        : 'Staging: RFQ gönderim bağlantısı bilinçli olarak bağlı değil. Talep gönderilmedi.'
    );
  };
  const saved = PRODUCTS.filter(p => favorites.has(p.slug))
    .map(p => p.code)
    .join(', ');
  return (
    <main className="page">
      <PageHero
        eyebrow="CONTACT / RFQ"
        title={
          lang === 'en'
            ? 'Start with the project brief.'
            : 'Proje brief’i ile başlayın.'
        }
        body={
          lang === 'en'
            ? 'A truthful staging form: no fake success and no unverified contact channel.'
            : 'Dürüst staging formu: sahte başarı mesajı ve doğrulanmamış iletişim kanalı yok.'
        }
      />
      <section className="section form-layout">
        <div>
          <span className="eyebrow">REQUEST FOR QUOTATION</span>
          <h2>
            {lang === 'en' ? 'Tell us what you need.' : 'İhtiyacınızı anlatın.'}
          </h2>
          <p>
            {lang === 'en'
              ? 'Company, market, category, material/finish direction, quantity and context help frame the next step.'
              : 'Firma, pazar, kategori, malzeme/kaplama yönü, adet ve bağlam sonraki adımı netleştirir.'}
          </p>
          {saved && (
            <div className="shortlist-note">
              <Check size={16} />{' '}
              {lang === 'en'
                ? 'Shortlist references'
                : 'Kısa liste referansları'}
              : {saved}
            </div>
          )}
        </div>
        <form className="rfq-form" onSubmit={submit} noValidate>
          <label>
            {lang === 'en' ? 'Company' : 'Firma'}
            <input name="company" />
          </label>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <label>
            {lang === 'en' ? 'Country / market' : 'Ülke / pazar'}
            <input name="market" />
          </label>
          <label>
            {lang === 'en' ? 'Project message' : 'Proje mesajı'}
            <textarea name="message" rows={5} />
          </label>
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="honeypot"
            aria-hidden="true"
          />
          <button className="button dark" type="submit">
            {copy[lang].quote}
            <ArrowRight size={16} />
          </button>
          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

function ServiceSection({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const t = copy[lang];
  const items = [
    [lang === 'en' ? 'Request Quotation' : 'Teklif İste', 'contact'],
    [lang === 'en' ? 'Request Sample' : 'Numune İste', 'contact'],
    [lang === 'en' ? 'Request Catalogue' : 'Katalog İste', 'contact'],
    [
      lang === 'en' ? 'Private Label Consultation' : 'Private Label Görüşmesi',
      'private-label',
    ],
  ];
  return (
    <section className="service-section">
      <div>
        <span className="eyebrow">
          {lang === 'en' ? 'CONCIERGE / B2B' : 'B2B HİZMET / DESTEK'}
        </span>
        <h2>{t.serviceTitle}</h2>
      </div>
      <div className="service-links">
        {items.map(([label, route]) => (
          <button key={label} onClick={() => go(route)}>
            {label}
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}

function Footer({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const [compact, setCompact] = useState(() =>
    window.matchMedia('(max-width: 820px)').matches
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const groups = [
    [
      lang === 'en' ? 'Collections' : 'Koleksiyonlar',
      [
        [lang === 'en' ? 'Bracelets' : 'Bileklikler', 'bracelets'],
        [lang === 'en' ? 'Women' : 'Kadın', 'women'],
        [lang === 'en' ? 'Men' : 'Erkek', 'men'],
        [lang === 'en' ? 'Collections' : 'Koleksiyonlar', 'collections'],
      ],
    ],
    [
      lang === 'en' ? 'For Brands' : 'Markalar İçin',
      [
        ['Private Label', 'private-label'],
        [lang === 'en' ? 'Manufacturing' : 'Üretim', 'manufacturing'],
        [lang === 'en' ? 'Request Quote' : 'Teklif İste', 'contact'],
      ],
    ],
    [
      lang === 'en' ? 'OSKA World' : 'OSKA Dünyası',
      [
        [lang === 'en' ? 'Istanbul Atelier' : 'İstanbul Atölyesi', 'world'],
        [lang === 'en' ? 'Materials / Specs' : 'Malzeme / Teknik', 'manufacturing'],
      ],
    ],
    [
      lang === 'en' ? 'Support' : 'Destek',
      [
        [lang === 'en' ? 'Favorites' : 'Favoriler', 'favorites'],
        [lang === 'en' ? 'Search' : 'Arama', 'search-page'],
        [lang === 'en' ? 'Contact / RFQ' : 'İletişim / RFQ', 'contact'],
      ],
    ],
  ] as const;
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span>OSKA</span>
        <small>SILVER</small>
        <p>
          {lang === 'en'
            ? 'Premium B2B jewellery development and catalogue experience.'
            : 'Premium B2B mücevher geliştirme ve katalog deneyimi.'}
        </p>
      </div>
      <div className="footer-groups">
        {groups.map(([title, links]) => (
          <details key={title} open={!compact}>
            <summary>
              {title}
              <ChevronDown size={15} />
            </summary>
            {links.map(([label, route]) => (
              <button key={label} onClick={() => go(route)}>
                {label}
              </button>
            ))}
          </details>
        ))}
      </div>
      <div className="footer-bottom">
        <span>Istanbul · Türkiye</span>
        <span>EN / TR</span>
        <span>
          {lang === 'en'
            ? 'Staging concept · no production publish'
            : 'Staging konsepti · production yayını yok'}
        </span>
      </div>
    </footer>
  );
}

function DigitalGuide({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="guide">
      <button
        className="guide-trigger"
        onClick={() => setOpen(!open)}
        aria-label={
          lang === 'en'
            ? open
              ? 'Close digital guide'
              : 'Open digital guide'
            : open
              ? 'Dijital rehberi kapat'
              : 'Dijital rehberi aç'
        }
      >
        <MessageCircle size={21} />
      </button>
      {open && (
        <div className="guide-panel">
          <div className="guide-head">
            <div>
              <span className="eyebrow">{copy[lang].assistant}</span>
              <p>{copy[lang].assistantHint}</p>
            </div>
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label={lang === 'en' ? 'Close digital guide' : 'Dijital rehberi kapat'}
            >
              <X size={18} />
            </button>
          </div>
          <div className="guide-actions">
            {[
              [
                lang === 'en' ? 'Show bracelets' : 'Bileklikleri göster',
                'bracelets',
              ],
              ['Panther', 'collections'],
              ['Private label', 'private-label'],
              [lang === 'en' ? 'Manufacturing' : 'Üretim', 'manufacturing'],
              [lang === 'en' ? 'Request quote' : 'Teklif iste', 'contact'],
            ].map(([label, route]) => (
              <button
                key={label}
                onClick={() => {
                  go(route);
                  setOpen(false);
                }}
              >
                {label}
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { route, go } = useHashRoute();
  const [lang, setLangState] = useState<Lang>(() =>
    localStorage.getItem('oska-lang') === 'tr' ? 'tr' : 'en'
  );
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('oska-favorites') || '[]'))
  );
  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem('oska-lang', next);
    document.documentElement.lang = next;
  };
  const toggleFavorite = (slug: string) =>
    setFavorites(current => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      localStorage.setItem('oska-favorites', JSON.stringify([...next]));
      return next;
    });
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const content = (() => {
    if (route === 'home')
      return (
        <Home
          lang={lang}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      );
    if (route === 'women' || route === 'men')
      return <AudiencePage type={route} lang={lang} go={go} />;
    if (route === 'bracelets')
      return (
        <BraceletsPage
          lang={lang}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      );
    if (route === 'rings' || route === 'necklaces' || route === 'earrings')
      return <CapabilityPage kind={route} lang={lang} go={go} />;
    if (route === 'collections') return <CollectionsPage lang={lang} go={go} />;
    if (route === 'manufacturing')
      return <ManufacturingPage lang={lang} go={go} />;
    if (route === 'private-label')
      return <PrivateLabelPage lang={lang} go={go} />;
    if (route === 'world') return <WorldPage lang={lang} />;
    if (route === 'favorites')
      return (
        <FavoritesPage
          lang={lang}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      );
    if (route === 'contact')
      return <ContactPage lang={lang} favorites={favorites} />;
    if (route === 'search-page') return <SearchPage lang={lang} go={go} />;
    if (route.startsWith('product/'))
      return (
        <ProductPage
          slug={route.split('/')[1]}
          lang={lang}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      );
    return (
      <Home
        lang={lang}
        go={go}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    );
  })();
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {lang === 'en' ? 'Skip to content' : 'İçeriğe geç'}
      </a>
      <Header
        lang={lang}
        setLang={setLang}
        favoritesCount={favorites.size}
        go={go}
      />
      <div id="main">{content}</div>
      <Footer lang={lang} go={go} />
      <DigitalGuide lang={lang} go={go} />
    </div>
  );
}

export default App;
