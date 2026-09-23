import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import { AdminPersistenceBridge } from './AdminPersistenceBridge';
import { LiveConcierge } from './LiveConcierge';
import { loadPublishedSiteConfig, submitRFQ } from './oskaPlatform';
import { oskaText } from './oskaLocale';

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
      'Özel Etiket',
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

type HomeSectionKey =
  | 'hero'
  | 'primaryRail'
  | 'pantherEditorial'
  | 'categories'
  | 'meshEditorial'
  | 'secondaryRail'
  | 'brand'
  | 'explore'
  | 'process'
  | 'service';

type CategoryKey = 'bracelets' | 'rings' | 'necklaces' | 'earrings';

type CustomSection = {
  id: string;
  visible: boolean;
  titleTr: string;
  titleEn: string;
  bodyTr: string;
  bodyEn: string;
  mediaUrl: string;
  route: string;
};

type ManualSettings = {
  defaultLang: Lang;
  showHero: boolean;
  showPrimaryRail: boolean;
  showPantherEditorial: boolean;
  showCategories: boolean;
  showMeshEditorial: boolean;
  showSecondaryRail: boolean;
  showBrand: boolean;
  showExplore: boolean;
  showProcess: boolean;
  showService: boolean;
  showGenderLinks: boolean;
  sectionOrder: HomeSectionKey[];
  sectionScale: Record<HomeSectionKey, number>;
  sectionSpacing: Record<HomeSectionKey, number>;
  categoryScale: Record<CategoryKey, number>;
  categoryPositionY: Record<CategoryKey, number>;
  categoryMedia: Record<CategoryKey, string>;
  categoryStoryTr: Record<CategoryKey, string>;
  categoryStoryEn: Record<CategoryKey, string>;
  primaryProductCount: number;
  secondaryProductCount: number;
  productRailCardWidth: number;
  productRailGap: number;
  heroTitleTr: string;
  heroTitleEn: string;
  heroBodyTr: string;
  heroBodyEn: string;
  heroMediaUrl: string;
  heroHeightDesktop: number;
  heroHeightTablet: number;
  heroHeightMobile: number;
  heroObjectFit: 'cover' | 'contain';
  heroPositionX: number;
  heroPositionY: number;
  aiEditNote: string;
  customSections: CustomSection[];
};

const HOME_SECTION_KEYS: HomeSectionKey[] = [
  'hero',
  'primaryRail',
  'pantherEditorial',
  'categories',
  'meshEditorial',
  'secondaryRail',
  'brand',
  'explore',
  'process',
  'service',
];

const DEFAULT_MANUAL_SETTINGS: ManualSettings = {
  defaultLang: 'tr',
  showHero: true,
  showPrimaryRail: true,
  showPantherEditorial: true,
  showCategories: true,
  showMeshEditorial: true,
  showSecondaryRail: true,
  showBrand: true,
  showExplore: true,
  showProcess: true,
  showService: true,
  showGenderLinks: true,
  sectionOrder: [...HOME_SECTION_KEYS],
  sectionScale: {
    hero: 100,
    primaryRail: 100,
    pantherEditorial: 100,
    categories: 100,
    meshEditorial: 100,
    secondaryRail: 100,
    brand: 100,
    explore: 100,
    process: 100,
    service: 100,
  },
  sectionSpacing: {
    hero: 0,
    primaryRail: 0,
    pantherEditorial: 0,
    categories: 0,
    meshEditorial: 0,
    secondaryRail: 0,
    brand: 0,
    explore: 0,
    process: 0,
    service: 0,
  },
  categoryScale: { bracelets: 100, rings: 100, necklaces: 100, earrings: 100 },
  categoryPositionY: { bracelets: 0, rings: 0, necklaces: 0, earrings: 0 },
  categoryMedia: {
    bracelets: '/assets/categories/bracelets.webp',
    rings: '/assets/categories/rings.webp',
    necklaces: '/assets/categories/necklaces.webp',
    earrings: '/assets/categories/earrings.webp',
  },
  categoryStoryTr: {
    bracelets: 'Panther detayları, güçlü duruş ve karakterli yüzeylerle geliştirilen bileklik seçkisi.',
    rings: 'Heykelsi formlar, dengeli oranlar ve karakterli yüzeylerle geliştirilen yüzük seçkisi.',
    necklaces: 'Zincir, pendant ve oran dengesiyle geliştirilen kolye seçkisi.',
    earrings: 'Hafiflik, hareket ve modern ışıltıyla geliştirilen küpe seçkisi.',
  },
  categoryStoryEn: {
    bracelets: 'A bracelet edit shaped by Panther details, strong presence and characterful surfaces.',
    rings: 'A ring edit shaped by sculptural forms, balanced proportions and characterful surfaces.',
    necklaces: 'A necklace edit built around chain, pendant and proportion.',
    earrings: 'An earring edit shaped by lightness, movement and modern brilliance.',
  },
  primaryProductCount: 5,
  secondaryProductCount: 5,
  productRailCardWidth: 240,
  productRailGap: 18,
  heroTitleTr: 'Kalıcı iş ortaklıkları\niçin mücevher.',
  heroTitleEn: 'Jewelry made for\nlasting partnerships.',
  heroBodyTr: 'Koleksiyon, private-label geliştirme ve kontrollü üretim için premium B2B katalog.',
  heroBodyEn: 'A premium B2B catalogue for collections, private-label development and controlled production.',
  heroMediaUrl: '',
  heroHeightDesktop: 720,
  heroHeightTablet: 620,
  heroHeightMobile: 540,
  heroObjectFit: 'cover',
  heroPositionX: 50,
  heroPositionY: 50,
  aiEditNote: '',
  customSections: [],
};

const MANUAL_SETTINGS_KEY = 'oska-manual-controls-v4';

function readManualSettings(): ManualSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(MANUAL_SETTINGS_KEY) || '{}');
    return {
      ...DEFAULT_MANUAL_SETTINGS,
      ...saved,
      sectionOrder: Array.isArray(saved.sectionOrder)
        ? [...saved.sectionOrder, ...HOME_SECTION_KEYS.filter(key => !saved.sectionOrder.includes(key))]
        : [...HOME_SECTION_KEYS],
      sectionScale: { ...DEFAULT_MANUAL_SETTINGS.sectionScale, ...(saved.sectionScale || {}) },
      sectionSpacing: { ...DEFAULT_MANUAL_SETTINGS.sectionSpacing, ...(saved.sectionSpacing || {}) },
      categoryScale: { ...DEFAULT_MANUAL_SETTINGS.categoryScale, ...(saved.categoryScale || {}) },
      categoryPositionY: { ...DEFAULT_MANUAL_SETTINGS.categoryPositionY, ...(saved.categoryPositionY || {}) },
      categoryMedia: { ...DEFAULT_MANUAL_SETTINGS.categoryMedia, ...(saved.categoryMedia || {}) },
      categoryStoryTr: { ...DEFAULT_MANUAL_SETTINGS.categoryStoryTr, ...(saved.categoryStoryTr || {}) },
      categoryStoryEn: { ...DEFAULT_MANUAL_SETTINGS.categoryStoryEn, ...(saved.categoryStoryEn || {}) },
      primaryProductCount: Number(saved.primaryProductCount ?? DEFAULT_MANUAL_SETTINGS.primaryProductCount),
      secondaryProductCount: Number(saved.secondaryProductCount ?? DEFAULT_MANUAL_SETTINGS.secondaryProductCount),
      productRailCardWidth: Number(saved.productRailCardWidth ?? DEFAULT_MANUAL_SETTINGS.productRailCardWidth),
      productRailGap: Number(saved.productRailGap ?? DEFAULT_MANUAL_SETTINGS.productRailGap),
      heroTitleTr: saved.heroTitleTr ?? DEFAULT_MANUAL_SETTINGS.heroTitleTr,
      heroTitleEn: saved.heroTitleEn ?? DEFAULT_MANUAL_SETTINGS.heroTitleEn,
      heroBodyTr: saved.heroBodyTr ?? DEFAULT_MANUAL_SETTINGS.heroBodyTr,
      heroBodyEn: saved.heroBodyEn ?? DEFAULT_MANUAL_SETTINGS.heroBodyEn,
      heroMediaUrl: saved.heroMediaUrl ?? DEFAULT_MANUAL_SETTINGS.heroMediaUrl,
      heroHeightDesktop: Number(saved.heroHeightDesktop ?? DEFAULT_MANUAL_SETTINGS.heroHeightDesktop),
      heroHeightTablet: Number(saved.heroHeightTablet ?? DEFAULT_MANUAL_SETTINGS.heroHeightTablet),
      heroHeightMobile: Number(saved.heroHeightMobile ?? DEFAULT_MANUAL_SETTINGS.heroHeightMobile),
      heroObjectFit: saved.heroObjectFit === 'contain' ? 'contain' : 'cover',
      heroPositionX: Number(saved.heroPositionX ?? DEFAULT_MANUAL_SETTINGS.heroPositionX),
      heroPositionY: Number(saved.heroPositionY ?? DEFAULT_MANUAL_SETTINGS.heroPositionY),
      aiEditNote: saved.aiEditNote ?? DEFAULT_MANUAL_SETTINGS.aiEditNote,
      customSections: Array.isArray(saved.customSections) ? saved.customSections : [],
    };
  } catch {
    return DEFAULT_MANUAL_SETTINGS;
  }
}

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
  'Özel Etiket': 'private-label',
  'OSKA World': 'world',
  'OSKA Dünyası': 'world',
};

type MegaLink = [string, string];
type MegaColumn = { label: string; links: MegaLink[] };

function getMegaMenu(route: string, lang: Lang): {
  title: string;
  intro: string;
  columns: MegaColumn[];
} {
  const tr = lang === 'tr';
  const categoryLinks = (audience?: 'women' | 'men'): MegaLink[] => [
    [tr ? 'Bileklikler' : 'Bracelets', audience ? `${audience}/bracelets` : 'bracelets'],
    [tr ? 'Yüzükler' : 'Rings', audience ? `${audience}/rings` : 'rings'],
    [tr ? 'Kolyeler' : 'Necklaces', audience ? `${audience}/necklaces` : 'necklaces'],
    [tr ? 'Küpeler' : 'Earrings', audience ? `${audience}/earrings` : 'earrings'],
  ];

  if (route === 'women') {
    return {
      title: tr ? 'Kadın' : 'Women',
      intro: tr
        ? 'Kadın koleksiyonlarını ürün ailesine göre doğrudan keşfedin.'
        : 'Explore women’s collections directly by product family.',
      columns: [
        { label: tr ? 'Kadın kategorileri' : 'Women by category', links: categoryLinks('women') },
        {
          label: tr ? 'Koleksiyonlar' : 'Collections',
          links: [['Panther', 'collections'], ['Mesh', 'collections'], ['Signature', 'collections']],
        },
        {
          label: tr ? 'Markalar için' : 'For brands',
          links: [[tr ? 'Üretim' : 'Manufacturing', 'manufacturing'], [tr ? 'Özel Etiket' : 'Private Label', 'private-label'], ['RFQ', 'contact']],
        },
      ],
    };
  }

  if (route === 'men') {
    return {
      title: tr ? 'Erkek' : 'Men',
      intro: tr
        ? 'Erkek koleksiyonlarını ürün ailesine göre doğrudan keşfedin.'
        : 'Explore men’s collections directly by product family.',
      columns: [
        { label: tr ? 'Erkek kategorileri' : 'Men by category', links: categoryLinks('men') },
        {
          label: tr ? 'Koleksiyonlar' : 'Collections',
          links: [['Panther', 'collections'], ['Mesh', 'collections'], ['Signature', 'collections']],
        },
        {
          label: tr ? 'Markalar için' : 'For brands',
          links: [[tr ? 'Üretim' : 'Manufacturing', 'manufacturing'], [tr ? 'Özel Etiket' : 'Private Label', 'private-label'], ['RFQ', 'contact']],
        },
      ],
    };
  }

  if (route === 'collections') {
    return {
      title: tr ? 'Koleksiyonlar' : 'Collections',
      intro: tr
        ? 'Panther, Mesh ve Signature ürün ailelerini tek merkezden keşfedin.'
        : 'Explore Panther, Mesh and Signature product families from one place.',
      columns: [
        {
          label: tr ? 'Öne çıkanlar' : 'Featured',
          links: [['Panther', 'collections'], ['Mesh', 'collections'], ['Signature', 'collections']],
        },
        { label: tr ? 'Kategoriye göre' : 'By category', links: categoryLinks() },
        {
          label: tr ? 'Devam et' : 'Continue',
          links: [[tr ? 'Üretim' : 'Manufacturing', 'manufacturing'], [tr ? 'Özel Etiket' : 'Private Label', 'private-label'], ['RFQ', 'contact']],
        },
      ],
    };
  }

  if (route === 'manufacturing') {
    return {
      title: tr ? 'Üretim' : 'Manufacturing',
      intro: tr
        ? 'Malzeme, geliştirme, numune, üretim ve kalite kontrol yollarına doğrudan erişin.'
        : 'Go directly to materials, development, sampling, production and quality-control paths.',
      columns: [
        {
          label: tr ? 'Malzeme / kaplama' : 'Material / finish',
          links: [
            [tr ? '925 ayar gümüş' : 'Sterling silver', 'manufacturing'],
            [tr ? 'Pirinç / bronz' : 'Brass / bronze', 'manufacturing'],
            [tr ? 'Altın geliştirme' : 'Gold development', 'manufacturing'],
            [tr ? 'Taş / laboratuvarda yetiştirilmiş' : 'Stone / lab-grown', 'manufacturing'],
          ],
        },
        {
          label: tr ? 'Üretim yolları' : 'Production paths',
          links: [[tr ? 'Üretim genel bakış' : 'Manufacturing overview', 'manufacturing'], [tr ? 'Özel Etiket' : 'Private Label', 'private-label'], [tr ? 'Teklif / RFQ' : 'Quote / RFQ', 'contact']],
        },
        { label: tr ? 'Ürün aileleri' : 'Product families', links: categoryLinks() },
      ],
    };
  }

  if (route === 'private-label') {
    return {
      title: tr ? 'Özel Etiket' : 'Private Label',
      intro: tr
        ? 'Markanıza özel ürün geliştirme, numune ve üretim sürecini yönetin.'
        : 'Manage brand-specific development, sampling and production.',
      columns: [
        {
          label: tr ? 'Başlangıç' : 'Start',
          links: [[tr ? 'Özel Etiket genel bakış' : 'Private Label overview', 'private-label'], [tr ? 'Üretim' : 'Manufacturing', 'manufacturing'], [tr ? 'Teklif / RFQ' : 'Quote / RFQ', 'contact']],
        },
        { label: tr ? 'Ürün aileleri' : 'Product families', links: categoryLinks() },
        {
          label: tr ? 'Koleksiyon yönü' : 'Collection direction',
          links: [['Panther', 'collections'], ['Mesh', 'collections'], ['Signature', 'collections']],
        },
      ],
    };
  }

  return {
    title: tr ? 'OSKA Dünyası' : 'OSKA World',
    intro: tr
      ? 'İstanbul atölyesi, koleksiyon hikâyeleri ve OSKA’nın üretim dünyasını keşfedin.'
      : 'Explore the Istanbul atelier, collection stories and the OSKA production world.',
    columns: [
      {
        label: tr ? 'Keşfet' : 'Explore',
        links: [[tr ? 'OSKA Dünyası' : 'OSKA World', 'world'], [tr ? 'Koleksiyonlar' : 'Collections', 'collections'], [tr ? 'Üretim' : 'Manufacturing', 'manufacturing']],
      },
      { label: tr ? 'Kategoriye göre' : 'By category', links: categoryLinks() },
      {
        label: tr ? 'İletişim' : 'Contact',
        links: [[tr ? 'Özel Etiket' : 'Private Label', 'private-label'], ['RFQ', 'contact']],
      },
    ],
  };
}

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
  const activeRoute = activeMenu ? routeMap[activeMenu] : null;
  const megaMenu = activeRoute ? getMegaMenu(activeRoute, lang) : null;
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const restoreFocus = (ref: { current: HTMLButtonElement | null }) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    });
  };

  const closeDrawer = () => {
    setOpen(false);
    restoreFocus(menuTriggerRef);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    restoreFocus(searchTriggerRef);
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
              onClick={() => {
                setActiveMenu(null);
                setSearchOpen(false);
                setLang(lang === 'en' ? 'tr' : 'en');
              }}
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
                type="button"
                data-nav-route={routeMap[item]}
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
          {activeMenu && megaMenu && (
            <div className="mega-menu" aria-label={`${megaMenu.title} menu`}>
              <div className="mega-menu-grid">
                <div className="mega-intro">
                  <span className="eyebrow">OSKA SILVER</span>
                  <h2>{megaMenu.title}</h2>
                  <p>{megaMenu.intro}</p>
                </div>
                {megaMenu.columns.map(column => (
                  <div className="mega-column" key={column.label}>
                    <span className="mega-label">{column.label}</span>
                    {column.links.map(([label, route]) => (
                      <button
                        type="button"
                        key={`${column.label}-${label}`}
                        onClick={() => {
                          go(route);
                          setActiveMenu(null);
                        }}
                      >
                        {label}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                ))}
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
                autoFocus
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
                  type="button"
                  data-mobile-nav-route={routeMap[item]}
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
              <button
                onClick={() => {
                  setActiveMenu(null);
                  setLang(lang === 'en' ? 'tr' : 'en');
                  setOpen(false);
                }}
              >
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

function Hero({
  lang,
  go,
  manual,
}: {
  lang: Lang;
  go: (r: string) => void;
  manual: ManualSettings;
}) {
  const t = copy[lang];
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`hero ${paused ? 'paused' : ''}`}
      aria-label={lang === 'en' ? 'Single hero video region' : 'Tek hero video alanı'}
      style={{
        ['--hero-height-desktop' as string]: `${manual.heroHeightDesktop}px`,
        ['--hero-height-tablet' as string]: `${manual.heroHeightTablet}px`,
        ['--hero-height-mobile' as string]: `${manual.heroHeightMobile}px`,
      }}
    >
      <div className="hero-safe-media" aria-hidden="true">
        {manual.heroMediaUrl &&
          (manual.heroMediaUrl.toLowerCase().match(/\.(mp4|webm)(\?|$)/) ? (
            <video
              className="hero-editor-media"
              src={manual.heroMediaUrl}
              style={{
                objectFit: manual.heroObjectFit,
                objectPosition: `${manual.heroPositionX}% ${manual.heroPositionY}%`,
              }}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              className="hero-editor-media"
              src={manual.heroMediaUrl}
              alt=""
              style={{
                objectFit: manual.heroObjectFit,
                objectPosition: `${manual.heroPositionX}% ${manual.heroPositionY}%`,
              }}
            />
          ))}
        <div className="hero-grain" />
      </div>
      <div className="hero-copy">
        <span className="eyebrow light">{t.heroEyebrow}</span>
        <h1>
          {(lang === 'en' ? manual.heroTitleEn : manual.heroTitleTr).split('\n').map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p>{lang === 'en' ? manual.heroBodyEn : manual.heroBodyTr}</p>
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
  manual,
}: {
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
  manual: ManualSettings;
}) {
  const t = copy[lang];
  const primaryProducts = PRODUCTS.slice(0, Math.max(1, manual.primaryProductCount));
  const secondaryProducts = PRODUCTS.slice(1, 1 + Math.max(1, manual.secondaryProductCount));
  const sectionStyle = (key: HomeSectionKey) => ({
    order: manual.sectionOrder.indexOf(key),
    marginTop: `${manual.sectionSpacing[key]}px`,
    transform: `scale(${manual.sectionScale[key] / 100})`,
    transformOrigin: 'top center',
  });

  const categoryItems: Array<{
    key: CategoryKey;
    en: string;
    tr: string;
    womenEn: string;
    womenTr: string;
    menEn: string;
    menTr: string;
    verified: boolean;
  }> = [
    {
      key: 'bracelets',
      en: 'Bracelets',
      tr: 'Bileklik',
      womenEn: "Women's Bracelets",
      womenTr: 'Kadın Bileklikleri',
      menEn: "Men's Bracelets",
      menTr: 'Erkek Bileklikleri',
      verified: true,
    },
    {
      key: 'rings',
      en: 'Rings',
      tr: 'Yüzük',
      womenEn: "Women's Rings",
      womenTr: 'Kadın Yüzükleri',
      menEn: "Men's Rings",
      menTr: 'Erkek Yüzükleri',
      verified: false,
    },
    {
      key: 'necklaces',
      en: 'Necklaces',
      tr: 'Kolye',
      womenEn: "Women's Necklaces",
      womenTr: 'Kadın Kolyeleri',
      menEn: "Men's Necklaces",
      menTr: 'Erkek Kolyeleri',
      verified: false,
    },
    {
      key: 'earrings',
      en: 'Earrings',
      tr: 'Küpe',
      womenEn: "Women's Earrings",
      womenTr: 'Kadın Küpeleri',
      menEn: "Men's Earrings",
      menTr: 'Erkek Küpeleri',
      verified: false,
    },
  ];

  return (
    <div className="home-layout">
      <div className="home-editable-section home-hero-shell" data-home-section="hero" style={sectionStyle('hero')}>
        <Hero lang={lang} go={go} manual={manual} />
      </div>

      <section
        className="section product-rail-section collection-band home-editable-section"
        data-home-section="primaryRail"
        style={sectionStyle('primaryRail')}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">PANTHER · MESH · SIGNATURE</span>
            <h2>{t.discover}</h2>
          </div>
          <button className="link-button" onClick={() => go('bracelets')}>
            {lang === 'en' ? 'View all' : 'Tümünü gör'} <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="product-rail"
          style={{
            ['--editor-card-width' as string]: `${manual.productRailCardWidth}px`,
            ['--editor-rail-gap' as string]: `${manual.productRailGap}px`,
          }}
        >
          {primaryProducts.map(p => (
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

      <section
        className="editorial split-editorial campaign-editorial home-editable-section"
        data-home-section="pantherEditorial"
        style={sectionStyle('pantherEditorial')}
      >
        <MediaBlock
          label={lang === 'en' ? 'OSKA-owned Panther campaign media slot' : 'OSKA Panther kampanya medya alanı'}
          verified
          tall
        />
        <div className="editorial-copy">
          <span className="eyebrow">{lang === 'en' ? 'PANTHER COLLECTION' : 'PANTHER KOLEKSİYONU'}</span>
          <h2>{lang === 'en' ? 'A sculptural signature, built for movement.' : 'Hareket için tasarlanmış heykelsi bir imza.'}</h2>
          <p>
            {lang === 'en'
              ? 'A focused bracelet language combining strong silhouettes, controlled surfaces and repeatable production detail.'
              : 'Güçlü siluetleri, kontrollü yüzeyleri ve tekrarlanabilir üretim detayını bir araya getiren odaklı bileklik dili.'}
          </p>
          <button className="link-button" onClick={() => go('collections')}>
            {lang === 'en' ? 'Explore the collection' : 'Koleksiyonu keşfet'} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section
        className="section category-section home-editable-section"
        data-home-section="categories"
        style={sectionStyle('categories')}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">{lang === 'en' ? 'PRODUCT FAMILIES' : 'ÜRÜN AİLELERİ'}</span>
            <h2>{t.categories}</h2>
          </div>
        </div>
        <div className="category-grid">
          {categoryItems.map(item => (
            <article key={item.key} className="category-card">
              <button
                className="category-card-main"
                style={{
                  ['--category-scale' as string]: manual.categoryScale[item.key] / 100,
                  ['--category-y' as string]: `${manual.categoryPositionY[item.key]}px`,
                }}
                onClick={() => go(item.key)}
                aria-label={lang === 'en' ? item.en : item.tr}
              >
                {manual.categoryMedia[item.key] ? (
                  <img
                    className="manual-category-image"
                    src={manual.categoryMedia[item.key]}
                    alt={lang === 'en' ? item.en : item.tr}
                  />
                ) : (
                  <MediaBlock
                    label={
                      item.verified
                        ? lang === 'en'
                          ? 'Verified bracelet catalogue media'
                          : 'Doğrulanmış bileklik katalog medyası'
                        : lang === 'en'
                          ? 'Category media pending'
                          : 'Kategori medyası bekleniyor'
                    }
                    verified={item.verified}
                  />
                )}
              </button>
              <div className="category-card-copy">
                <strong>{lang === 'en' ? item.en : item.tr}</strong>
                <p className="category-story">
                  {lang === 'en' ? manual.categoryStoryEn[item.key] : manual.categoryStoryTr[item.key]}
                </p>
                {manual.showGenderLinks ? (
                  <div className="category-gender-links">
                    <button onClick={() => go(`women/${item.key}`)}>
                      {lang === 'en' ? item.womenEn : item.womenTr}
                    </button>
                    <button onClick={() => go(`men/${item.key}`)}>
                      {lang === 'en' ? item.menEn : item.menTr}
                    </button>
                  </div>
                ) : (
                  <button className="category-single-link" onClick={() => go(item.key)}>
                    {item.verified
                      ? lang === 'en'
                        ? 'View catalogue'
                        : 'Kataloğu gör'
                      : lang === 'en'
                        ? 'Explore capability'
                        : 'Kabiliyeti keşfet'} <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="editorial full-editorial dark-editorial campaign-editorial home-editable-section"
        data-home-section="meshEditorial"
        style={sectionStyle('meshEditorial')}
      >
        <div className="editorial-copy wide">
          <span className="eyebrow light">{lang === 'en' ? 'MESH / ARTICULATED' : 'MESH / HAREKETLİ'}</span>
          <h2>{lang === 'en' ? 'Engineering movement into metal.' : 'Metale hareket kazandırmak.'}</h2>
          <p>
            {lang === 'en'
              ? 'Flexible constructions, repeatable finishing and a production workflow centered on approved samples.'
              : 'Esnek konstrüksiyonlar, tekrarlanabilir yüzey kalitesi ve onaylı numune etrafında kurulan üretim akışı.'}
          </p>
          <div className="hero-actions">
            <button className="button light" onClick={() => go('manufacturing')}>
              {lang === 'en' ? 'Discover manufacturing' : 'Üretimi keşfet'} <ArrowRight size={16} />
            </button>
            <button className="button ghost-light" onClick={() => go('contact')}>{t.quote}</button>
          </div>
        </div>
      </section>

      <section
        className="section product-rail-section collection-band secondary-collection-band home-editable-section"
        data-home-section="secondaryRail"
        style={sectionStyle('secondaryRail')}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">MESH · SIGNATURE</span>
            <h2>{lang === 'en' ? 'Discover More' : 'Daha Fazlasını Keşfet'}</h2>
          </div>
          <button className="link-button" onClick={() => go('collections')}>
            {lang === 'en' ? 'Collections' : 'Koleksiyonlar'} <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="product-rail"
          style={{
            ['--editor-card-width' as string]: `${manual.productRailCardWidth}px`,
            ['--editor-rail-gap' as string]: `${manual.productRailGap}px`,
          }}
        >
          {secondaryProducts.map(p => (
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

      <section
        className="section brand-section atelier-story home-editable-section"
        data-home-section="brand"
        style={sectionStyle('brand')}
      >
        <div className="brand-copy">
          <span className="eyebrow">{t.forBrands.toUpperCase()}</span>
          <h2>{lang === 'en' ? 'From brief to production, one controlled workflow.' : 'Brief’ten üretime, tek kontrollü iş akışı.'}</h2>
          <p>
            {lang === 'en'
              ? 'Private-label development, CAD coordination, sampling, approval, production, QC and packing coordination.'
              : 'Private label geliştirme, CAD koordinasyonu, numune, onay, üretim, kalite kontrol ve paketleme koordinasyonu.'}
          </p>
          <button className="button dark" onClick={() => go('private-label')}>{t.forBrands}<ArrowRight size={16} /></button>
        </div>
        <MediaBlock label={lang === 'en' ? 'Grand Bazaar workshop / craft media slot' : 'Kapalıçarşı atölye / zanaat medya alanı'} tall />
      </section>

      <section
        className="section explore-section home-editable-section"
        data-home-section="explore"
        style={sectionStyle('explore')}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">{lang === 'en' ? 'OSKA WORLD' : 'OSKA DÜNYASI'}</span>
            <h2>{lang === 'en' ? 'More to Explore' : 'Daha Fazlasını Keşfet'}</h2>
          </div>
        </div>
        <div className="explore-grid">
          {[
            {
              title: lang === 'en' ? 'Collections' : 'Koleksiyonlar',
              body: lang === 'en'
                ? 'Move through Panther, Mesh and Signature as clear product families.'
                : 'Panther, Mesh ve Signature ürün aileleri arasında net biçimde ilerleyin.',
              route: 'collections',
              media: lang === 'en' ? 'OSKA collection editorial media' : 'OSKA koleksiyon editorial medyası',
            },
            {
              title: lang === 'en' ? 'Manufacturing' : 'Üretim',
              body: lang === 'en'
                ? 'See the controlled path from brief and development to QC.'
                : 'Brief ve geliştirmeden kalite kontrole uzanan kontrollü yolu görün.',
              route: 'manufacturing',
              media: lang === 'en' ? 'OSKA manufacturing editorial media' : 'OSKA üretim editorial medyası',
            },
            {
              title: lang === 'en' ? 'Private Label' : 'Özel Etiket',
              body: lang === 'en'
                ? 'Start a brand-specific development path without a retail checkout detour.'
                : 'Perakende ödeme akışına sapmadan markaya özel geliştirme sürecini başlatın.',
              route: 'private-label',
              media: lang === 'en' ? 'OSKA private-label editorial media' : 'OSKA özel etiket editorial medyası',
            },
          ].map(item => (
            <article className="explore-card" key={item.title}>
              <button className="explore-media" onClick={() => go(item.route)} aria-label={item.title}>
                <MediaBlock label={item.media} tall />
              </button>
              <div className="explore-copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <button className="link-button" onClick={() => go(item.route)}>
                  {lang === 'en' ? 'Explore' : 'Keşfet'} <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section process-section home-editable-section"
        data-home-section="process"
        style={sectionStyle('process')}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">{lang === 'en' ? 'ISTANBUL ATELIER' : 'İSTANBUL ATÖLYESİ'}</span>
            <h2>{t.atelier}</h2>
          </div>
        </div>
        <div className="process-grid">
          {[
            lang === 'en' ? 'Brief' : 'Brief',
            lang === 'en' ? 'CAD / Development' : 'CAD / Geliştirme',
            lang === 'en' ? 'Sample' : 'Numune',
            lang === 'en' ? 'Approval' : 'Onay',
            lang === 'en' ? 'Production' : 'Üretim',
            lang === 'en' ? 'QC & Packing' : 'Kalite Kontrol / Paketleme',
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

      <div className="home-editable-section" data-home-section="service" style={sectionStyle('service')}>
        <ServiceSection lang={lang} go={go} />
      </div>

      {manual.customSections
        .filter(section => section.visible)
        .map((section, index) => (
          <section
            key={section.id}
            className="section custom-home-section"
            style={{ order: HOME_SECTION_KEYS.length + index }}
          >
            <div className="custom-home-media">
              {section.mediaUrl ? (
                <img src={section.mediaUrl} alt={lang === 'en' ? section.titleEn : section.titleTr} />
              ) : (
                <MediaBlock label={lang === 'en' ? 'Custom media' : 'Özel medya'} tall />
              )}
            </div>
            <div className="custom-home-copy">
              <span className="eyebrow">OSKA</span>
              <h2>{lang === 'en' ? section.titleEn : section.titleTr}</h2>
              <p>{lang === 'en' ? section.bodyEn : section.bodyTr}</p>
              {section.route && (
                <button className="link-button" onClick={() => go(section.route)}>
                  {lang === 'en' ? 'Explore' : 'Keşfet'} <ArrowRight size={15} />
                </button>
              )}
            </div>
          </section>
        ))}
    </div>
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
          <button className="category-card" onClick={() => go(`${type}/bracelets`)}>
            <MediaBlock label="Verified bracelet catalogue media" verified />
            <strong>{lang === 'en' ? 'Bracelets' : 'Bileklik'}</strong>
            <span>
              {lang === 'en' ? 'Catalogue' : 'Katalog'} <ArrowRight size={15} />
            </span>
          </button>
          {['rings', 'necklaces', 'earrings'].map(r => (
            <button key={r} className="category-card" onClick={() => go(`${type}/${r}`)}>
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
          <span className="eyebrow">{lang === 'en' ? 'OSKA COLLECTIONS' : 'OSKA KOLEKSİYONLARI'}</span>
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
  audience,
}: {
  lang: Lang;
  go: (r: string) => void;
  favorites: Set<string>;
  toggleFavorite: (s: string) => void;
  audience?: 'women' | 'men';
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
        eyebrow={
          audience
            ? lang === 'en'
              ? `${audience === 'women' ? 'WOMEN' : 'MEN'} · BRACELETS`
              : `${audience === 'women' ? 'KADIN' : 'ERKEK'} · BİLEKLİKLER`
            : lang === 'en'
              ? 'BRACELETS'
              : 'BİLEKLİKLER'
        }
        title={
          audience
            ? lang === 'en'
              ? `${audience === 'women' ? "Women's" : "Men's"} Bracelets`
              : `${audience === 'women' ? 'Kadın' : 'Erkek'} Bileklikleri`
            : lang === 'en'
              ? 'Bracelets — verified catalogue'
              : 'Bileklikler — doğrulanmış katalog'
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
  audience,
}: {
  kind: 'rings' | 'necklaces' | 'earrings';
  lang: Lang;
  go: (r: string) => void;
  audience?: 'women' | 'men';
}) {
  const names = {
    rings: ['Rings', 'Yüzük'],
    necklaces: ['Necklaces', 'Kolye'],
    earrings: ['Earrings', 'Küpe'],
  } as const;
  const title = names[kind][lang === 'en' ? 0 : 1];
  const audienceTitle = audience
    ? lang === 'en'
      ? `${audience === 'women' ? "Women's" : "Men's"} ${title}`
      : `${audience === 'women' ? 'Kadın' : 'Erkek'} ${kind === 'rings' ? 'Yüzükleri' : kind === 'necklaces' ? 'Kolyeleri' : 'Küpeleri'}`
    : title;
  return (
    <main className="page">
      <PageHero
        eyebrow={audienceTitle.toUpperCase()}
        title={
          audience
            ? audienceTitle
            : lang === 'en'
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
        eyebrow={lang === 'en' ? 'COLLECTIONS' : 'KOLEKSİYONLAR'}
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
                {lang === 'en' ? 'View products' : 'Ürünleri gör'} <ArrowRight size={16} />
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
        eyebrow={lang === 'en' ? 'MANUFACTURING' : 'ÜRETİM'}
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
          <span className="eyebrow">{lang === 'en' ? 'WORKFLOW' : 'İŞ AKIŞI'}</span>
          <h2>
            {lang === 'en' ? 'Six controlled stages.' : 'Altı kontrollü aşama.'}
          </h2>
          <ol className="numbered-list">
            {(lang === 'en'
              ? ['Brief', 'CAD / Design development', 'Sample', 'Approval', 'Production', 'QC & Packing']
              : ['Brief', 'CAD / Tasarım geliştirme', 'Numune', 'Onay', 'Üretim', 'Kalite kontrol ve paketleme']
            ).map((s, i) => (
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
          <span className="eyebrow light">{lang === 'en' ? 'MATERIAL / FINISH / DETAIL' : 'MALZEME / KAPLAMA / DETAY'}</span>
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
        eyebrow={lang === 'en' ? 'PRIVATE LABEL / OEM' : 'ÖZEL ETİKET / OEM'}
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
          {(lang === 'en'
            ? ['Brief', 'Develop', 'Approve sample', 'Produce']
            : ['Brief', 'Geliştir', 'Numuneyi onayla', 'Üret']
          ).map((s, i) => (
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
          <span className="eyebrow">{lang === 'en' ? 'FOR BRANDS' : 'MARKALAR İÇİN'}</span>
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
        eyebrow={lang === 'en' ? 'OSKA WORLD' : 'OSKA DÜNYASI'}
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
        eyebrow={lang === 'en' ? 'SHORTLIST' : 'KISA LİSTE'}
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
  const text = oskaText(lang).rfq;
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const saved = PRODUCTS.filter(p => favorites.has(p.slug)).map(p => p.code);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const company = String(data.get('company') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const consent = data.get('consent') === 'on';
    if (!company || !/^\S+@\S+\.\S+$/.test(email) || !message || !consent) {
      setStatus(text.validation);
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      await submitRFQ({
        company,
        email,
        name: String(data.get('name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        whatsapp: String(data.get('whatsapp') || '').trim(),
        market: String(data.get('market') || '').trim(),
        category: String(data.get('category') || '').trim(),
        materialFinish: String(data.get('materialFinish') || '').trim(),
        targetQuantity: String(data.get('targetQuantity') || '').trim(),
        preferredContact: String(data.get('preferredContact') || '').trim(),
        references: saved,
        message,
        consent,
        website: String(data.get('website') || ''),
      });
      setStatus(text.stored);
      form.reset();
    } catch {
      setStatus(text.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <PageHero eyebrow={text.eyebrow} title={text.title} body={text.body} />
      <section className="section form-layout">
        <div>
          <span className="eyebrow">REQUEST FOR QUOTATION</span>
          <h2>{text.introTitle}</h2>
          <p>{text.introBody}</p>
          {saved.length > 0 && (
            <div className="shortlist-note">
              <Check size={16} /> {text.shortlist}: {saved.join(', ')}
            </div>
          )}
        </div>
        <form className="rfq-form" onSubmit={submit} noValidate>
          <label>{text.company}<input name="company" /></label>
          <label>{text.name}<input name="name" /></label>
          <label>{text.email}<input name="email" type="email" /></label>
          <label>{text.phone}<input name="phone" type="tel" /></label>
          <label>{text.whatsapp}<input name="whatsapp" type="tel" /></label>
          <label>{text.market}<input name="market" /></label>
          <label>{text.category}<input name="category" /></label>
          <label>{text.materialFinish}<input name="materialFinish" /></label>
          <label>{text.targetQuantity}<input name="targetQuantity" inputMode="numeric" /></label>
          <label>
            {text.preferredContact}
            <select name="preferredContact" defaultValue="email">
              <option value="email">{text.preferredEmail}</option>
              <option value="whatsapp">{text.preferredWhatsapp}</option>
              <option value="phone">{text.preferredPhone}</option>
            </select>
          </label>
          <label className="rfq-message">{text.message}<textarea name="message" rows={5} /></label>
          <label className="rfq-consent"><input name="consent" type="checkbox" /> <span>{text.consent}</span></label>
          <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
          <button className="button dark" type="submit" disabled={busy}>
            {busy ? text.saving : text.submit}<ArrowRight size={16} />
          </button>
          {status && <p className="form-status" role="status">{status}</p>}
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
    [
      lang === 'en' ? 'Production Consultation' : 'Üretim Görüşmesi',
      'manufacturing',
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
        <span>{lang === 'en' ? 'Istanbul · Türkiye' : 'İstanbul · Türkiye'}</span>
        <span>EN / TR</span>
        <span>
          {lang === 'en'
            ? 'Staging concept · no production publish'
            : 'Önizleme konsepti · canlı yayın yok'}
        </span>
      </div>
    </footer>
  );
}

function DigitalGuide({
  lang,
  go,
  route,
  favorites,
}: {
  lang: Lang;
  go: (r: string) => void;
  route: string;
  favorites: Set<string>;
}) {
  const shortlist = PRODUCTS.filter(product => favorites.has(product.slug)).map(product => product.code);
  return <LiveConcierge lang={lang} route={route} shortlist={shortlist} go={go} />;
}

function ManualControlPanel({
  lang,
  setLang,
  manual,
  setManual,
  go,
}: {
  lang: Lang;
  setLang: (v: Lang) => void;
  manual: ManualSettings;
  setManual: (v: ManualSettings) => void;
  go: (r: string) => void;
}) {
  const [selectedSection, setSelectedSection] = useState<HomeSectionKey>('hero');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('bracelets');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const sectionLabels: Record<HomeSectionKey, [string, string]> = {
    hero: ['Hero', 'Hero'],
    primaryRail: ['Top product rail', 'Üst ürün şeridi'],
    pantherEditorial: ['Panther story', 'Panther hikâyesi'],
    categories: ['Categories', 'Kategoriler'],
    meshEditorial: ['Mesh story', 'Mesh hikâyesi'],
    secondaryRail: ['Second product rail', 'İkinci ürün şeridi'],
    brand: ['For Brands', 'Markalar İçin'],
    explore: ['Explore', 'Keşfet'],
    process: ['Production steps', 'Üretim adımları'],
    service: ['B2B contact', 'B2B iletişim'],
  };

  type VisibilitySettingKey =
    | 'showHero'
    | 'showPrimaryRail'
    | 'showPantherEditorial'
    | 'showCategories'
    | 'showMeshEditorial'
    | 'showSecondaryRail'
    | 'showBrand'
    | 'showExplore'
    | 'showProcess'
    | 'showService';
  const visibilityKey: Record<HomeSectionKey, VisibilitySettingKey> = {
    hero: 'showHero',
    primaryRail: 'showPrimaryRail',
    pantherEditorial: 'showPantherEditorial',
    categories: 'showCategories',
    meshEditorial: 'showMeshEditorial',
    secondaryRail: 'showSecondaryRail',
    brand: 'showBrand',
    explore: 'showExplore',
    process: 'showProcess',
    service: 'showService',
  };

  const categoryLabels: Record<CategoryKey, [string, string]> = {
    bracelets: ['Bracelets', 'Bileklikler'],
    rings: ['Rings', 'Yüzükler'],
    necklaces: ['Necklaces', 'Kolyeler'],
    earrings: ['Earrings', 'Küpeler'],
  };

  const selectedIndex = manual.sectionOrder.indexOf(selectedSection);
  const selectedVisible = Boolean(manual[visibilityKey[selectedSection]]);

  const update = <K extends keyof ManualSettings>(key: K, value: ManualSettings[K]) => {
    setManual({ ...manual, [key]: value });
  };

  const setSectionVisible = (key: HomeSectionKey, value: boolean) => {
    setManual({ ...manual, [visibilityKey[key]]: value } as ManualSettings);
  };

  const moveSection = (key: HomeSectionKey, direction: -1 | 1) => {
    const next = [...manual.sectionOrder];
    const index = next.indexOf(key);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setManual({ ...manual, sectionOrder: next });
  };

  const updateCategoryNumber = (
    field: 'categoryScale' | 'categoryPositionY',
    key: CategoryKey,
    value: number
  ) => {
    setManual({
      ...manual,
      [field]: { ...manual[field], [key]: value },
    });
  };

  const updateCategoryText = (
    field: 'categoryMedia' | 'categoryStoryTr' | 'categoryStoryEn',
    key: CategoryKey,
    value: string
  ) => {
    setManual({
      ...manual,
      [field]: { ...manual[field], [key]: value },
    });
  };

  const readUpload = (
    event: ChangeEvent<HTMLInputElement>,
    apply: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') apply(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const root = document.querySelector('.visual-editor-canvas');
    if (!root) return;
    root.querySelectorAll('[data-home-section]').forEach(node => {
      node.removeAttribute('data-editor-selected');
    });
    const target = root.querySelector(
      `[data-home-section="${selectedSection}"]`
    ) as HTMLElement | null;
    if (target) {
      target.setAttribute('data-editor-selected', 'true');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSection, manual.sectionOrder, selectedVisible]);

  return (
    <main className="visual-editor-page">
      <header className="visual-editor-topbar">
        <div className="visual-editor-brand">
          <strong>OSKA</strong>
          <span>{lang === 'en' ? 'VISUAL EDITOR' : 'GÖRSEL EDİTÖR'}</span>
        </div>
        <div className="visual-editor-top-actions">
          <div className="visual-editor-lang">
            <button className={lang === 'tr' ? 'active' : ''} onClick={() => setLang('tr')}>TR</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <div className="visual-editor-device">
            <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>
              {lang === 'en' ? 'Desktop' : 'Masaüstü'}
            </button>
            <button className={previewMode === 'tablet' ? 'active' : ''} onClick={() => setPreviewMode('tablet')}>
              {lang === 'en' ? 'Tablet' : 'Tablet'}
            </button>
            <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>
              {lang === 'en' ? 'Mobile' : 'Mobil'}
            </button>
          </div>
          <button className="visual-editor-open-site" onClick={() => go('home')}>
            {lang === 'en' ? 'Open site' : 'Siteyi aç'}
          </button>
        </div>
      </header>

      <AdminPersistenceBridge lang={lang} value={manual} onLoad={next => setManual(next)} />

      <div className="visual-editor-workspace">
        <aside className="visual-editor-sections">
          <div className="visual-editor-side-title">
            <span>{lang === 'en' ? 'PAGE' : 'SAYFA'}</span>
            <strong>{lang === 'en' ? 'Homepage' : 'Ana Sayfa'}</strong>
          </div>
          <div className="visual-editor-section-list">
            {manual.sectionOrder.map((key, index) => (
              <button
                type="button"
                key={key}
                className={selectedSection === key ? 'active' : ''}
                onClick={() => setSelectedSection(key)}
              >
                <span className="visual-editor-section-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{lang === 'en' ? sectionLabels[key][0] : sectionLabels[key][1]}</span>
                <span className={manual[visibilityKey[key]] ? 'status-on' : 'status-off'}>
                  {manual[visibilityKey[key]] ? '●' : '○'}
                </span>
              </button>
            ))}
          </div>
          <button
            className="visual-editor-reset"
            onClick={() => {
              setManual(DEFAULT_MANUAL_SETTINGS);
              setLang(DEFAULT_MANUAL_SETTINGS.defaultLang);
              setSelectedSection('hero');
            }}
          >
            {lang === 'en' ? 'Reset preview' : 'Önizlemeyi sıfırla'}
          </button>
        </aside>

        <section className="visual-editor-stage">
          <div className={`visual-editor-browser ${previewMode}`}>
            <div className="visual-editor-browser-bar">
              <span />
              <span />
              <span />
              <div>oskajewelry.com · {lang.toUpperCase()}</div>
            </div>
            <div className="visual-editor-canvas">
              <Home
                lang={lang}
                go={() => {}}
                favorites={new Set<string>()}
                toggleFavorite={() => {}}
                manual={manual}
              />
            </div>
          </div>
        </section>

        <aside className="visual-editor-inspector">
          <div className="visual-editor-inspector-head">
            <span>{lang === 'en' ? 'EDITING' : 'DÜZENLENEN'}</span>
            <h2>{lang === 'en' ? sectionLabels[selectedSection][0] : sectionLabels[selectedSection][1]}</h2>
          </div>

          <div className="visual-editor-quick-actions">
            <button
              onClick={() => setSectionVisible(selectedSection, !selectedVisible)}
              className={selectedVisible ? 'active' : ''}
            >
              {selectedVisible
                ? lang === 'en' ? 'Hide' : 'Gizle'
                : lang === 'en' ? 'Show' : 'Göster'}
            </button>
            <button onClick={() => moveSection(selectedSection, -1)} disabled={selectedIndex <= 0}>↑</button>
            <button onClick={() => moveSection(selectedSection, 1)} disabled={selectedIndex >= manual.sectionOrder.length - 1}>↓</button>
          </div>

          <div className="visual-editor-control-group">
            <label>
              <span>{lang === 'en' ? 'Section size' : 'Bölüm boyutu'} <b>{manual.sectionScale[selectedSection]}%</b></span>
              <input
                type="range"
                min="70"
                max="130"
                value={manual.sectionScale[selectedSection]}
                onChange={e =>
                  setManual({
                    ...manual,
                    sectionScale: {
                      ...manual.sectionScale,
                      [selectedSection]: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              <span>{lang === 'en' ? 'Top spacing' : 'Üst boşluk'} <b>{manual.sectionSpacing[selectedSection]}px</b></span>
              <input
                type="range"
                min="-60"
                max="160"
                step="4"
                value={manual.sectionSpacing[selectedSection]}
                onChange={e =>
                  setManual({
                    ...manual,
                    sectionSpacing: {
                      ...manual.sectionSpacing,
                      [selectedSection]: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
          </div>

          {selectedSection === 'hero' && (
            <div className="visual-editor-control-group">
              <h3>{lang === 'en' ? 'Hero content' : 'Hero içeriği'}</h3>
              <label>
                <span>{lang === 'en' ? 'Title' : 'Başlık'}</span>
                <textarea
                  rows={3}
                  value={lang === 'en' ? manual.heroTitleEn : manual.heroTitleTr}
                  onChange={e => update(lang === 'en' ? 'heroTitleEn' : 'heroTitleTr', e.target.value)}
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Description' : 'Açıklama'}</span>
                <textarea
                  rows={4}
                  value={lang === 'en' ? manual.heroBodyEn : manual.heroBodyTr}
                  onChange={e => update(lang === 'en' ? 'heroBodyEn' : 'heroBodyTr', e.target.value)}
                />
              </label>
              <div className="visual-editor-media-box">
                <span>{lang === 'en' ? 'Hero image / video' : 'Hero fotoğraf / video'}</span>
                {manual.heroMediaUrl ? (
                  <div className="visual-editor-media-current">
                    <strong>{lang === 'en' ? 'Media loaded' : 'Medya yüklendi'}</strong>
                    <button onClick={() => update('heroMediaUrl', '')}>{lang === 'en' ? 'Remove' : 'Kaldır'}</button>
                  </div>
                ) : (
                  <p>{lang === 'en' ? 'No media selected.' : 'Henüz medya seçilmedi.'}</p>
                )}
                <label className="visual-editor-upload">
                  {lang === 'en' ? 'Choose file' : 'Dosya seç'}
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={e => readUpload(e, value => update('heroMediaUrl', value))}
                  />
                </label>
              </div>
              <label>
                <span>{lang === 'en' ? 'Desktop hero height' : 'Masaüstü hero yüksekliği'} <b>{manual.heroHeightDesktop}px</b></span>
                <input type="range" min="420" max="980" step="10" value={manual.heroHeightDesktop} onChange={e => update('heroHeightDesktop', Number(e.target.value))} />
              </label>
              <label>
                <span>{lang === 'en' ? 'Tablet hero height' : 'Tablet hero yüksekliği'} <b>{manual.heroHeightTablet}px</b></span>
                <input type="range" min="380" max="860" step="10" value={manual.heroHeightTablet} onChange={e => update('heroHeightTablet', Number(e.target.value))} />
              </label>
              <label>
                <span>{lang === 'en' ? 'Mobile hero height' : 'Mobil hero yüksekliği'} <b>{manual.heroHeightMobile}px</b></span>
                <input type="range" min="340" max="760" step="10" value={manual.heroHeightMobile} onChange={e => update('heroHeightMobile', Number(e.target.value))} />
              </label>
              <label>
                <span>{lang === 'en' ? 'Media fit' : 'Medya yerleşimi'}</span>
                <select value={manual.heroObjectFit} onChange={e => update('heroObjectFit', e.target.value as 'cover' | 'contain')}>
                  <option value="cover">{lang === 'en' ? 'Fill / crop' : 'Doldur / kırp'}</option>
                  <option value="contain">{lang === 'en' ? 'Fit entire media' : 'Medyanın tamamını göster'}</option>
                </select>
              </label>
              <label>
                <span>{lang === 'en' ? 'Horizontal focal point' : 'Yatay odak'} <b>{manual.heroPositionX}%</b></span>
                <input type="range" min="0" max="100" value={manual.heroPositionX} onChange={e => update('heroPositionX', Number(e.target.value))} />
              </label>
              <label>
                <span>{lang === 'en' ? 'Vertical focal point' : 'Dikey odak'} <b>{manual.heroPositionY}%</b></span>
                <input type="range" min="0" max="100" value={manual.heroPositionY} onChange={e => update('heroPositionY', Number(e.target.value))} />
              </label>
            </div>
          )}

          {(selectedSection === 'primaryRail' || selectedSection === 'secondaryRail') && (
            <div className="visual-editor-control-group">
              <h3>{lang === 'en' ? 'Product rail' : 'Ürün şeridi'}</h3>
              <label>
                <span>{lang === 'en' ? 'Product count' : 'Ürün adedi'}</span>
                <input
                  type="range"
                  min="3"
                  max={PRODUCTS.length}
                  value={selectedSection === 'primaryRail' ? manual.primaryProductCount : manual.secondaryProductCount}
                  onChange={e =>
                    update(
                      selectedSection === 'primaryRail' ? 'primaryProductCount' : 'secondaryProductCount',
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Card width' : 'Kart genişliği'} <b>{manual.productRailCardWidth}px</b></span>
                <input
                  type="range"
                  min="170"
                  max="360"
                  value={manual.productRailCardWidth}
                  onChange={e => update('productRailCardWidth', Number(e.target.value))}
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Card gap' : 'Kart aralığı'} <b>{manual.productRailGap}px</b></span>
                <input
                  type="range"
                  min="6"
                  max="48"
                  value={manual.productRailGap}
                  onChange={e => update('productRailGap', Number(e.target.value))}
                />
              </label>
            </div>
          )}

          {selectedSection === 'categories' && (
            <div className="visual-editor-control-group">
              <h3>{lang === 'en' ? 'Category card' : 'Kategori kartı'}</h3>
              <div className="visual-editor-category-tabs">
                {(Object.keys(categoryLabels) as CategoryKey[]).map(key => (
                  <button
                    key={key}
                    className={selectedCategory === key ? 'active' : ''}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {lang === 'en' ? categoryLabels[key][0] : categoryLabels[key][1]}
                  </button>
                ))}
              </div>
              <div className="visual-editor-category-preview">
                {manual.categoryMedia[selectedCategory] && (
                  <img src={manual.categoryMedia[selectedCategory]} alt="" />
                )}
              </div>
              <label className="visual-editor-upload">
                {lang === 'en' ? 'Change photo' : 'Fotoğraf değiştir'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    readUpload(e, value =>
                      updateCategoryText('categoryMedia', selectedCategory, value)
                    )
                  }
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Photo size' : 'Fotoğraf boyutu'} <b>{manual.categoryScale[selectedCategory]}%</b></span>
                <input
                  type="range"
                  min="70"
                  max="170"
                  value={manual.categoryScale[selectedCategory]}
                  onChange={e =>
                    updateCategoryNumber('categoryScale', selectedCategory, Number(e.target.value))
                  }
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Photo position' : 'Fotoğraf konumu'} <b>{manual.categoryPositionY[selectedCategory]}px</b></span>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  value={manual.categoryPositionY[selectedCategory]}
                  onChange={e =>
                    updateCategoryNumber('categoryPositionY', selectedCategory, Number(e.target.value))
                  }
                />
              </label>
              <label>
                <span>{lang === 'en' ? 'Story' : 'Hikâye'}</span>
                <textarea
                  rows={5}
                  value={
                    lang === 'en'
                      ? manual.categoryStoryEn[selectedCategory]
                      : manual.categoryStoryTr[selectedCategory]
                  }
                  onChange={e =>
                    updateCategoryText(
                      lang === 'en' ? 'categoryStoryEn' : 'categoryStoryTr',
                      selectedCategory,
                      e.target.value
                    )
                  }
                />
              </label>
              <label className="visual-editor-toggle">
                <input
                  type="checkbox"
                  checked={manual.showGenderLinks}
                  onChange={e => update('showGenderLinks', e.target.checked)}
                />
                <span>{lang === 'en' ? 'Show Women / Men links' : 'Kadın / Erkek linklerini göster'}</span>
              </label>
            </div>
          )}

          <div className="visual-editor-control-group">
            <h3>{lang === 'en' ? 'AI edit instruction' : 'Yapay zekâ düzenleme notu'}</h3>
            <label>
              <span>{lang === 'en' ? 'Write the change you want for this section' : 'Bu bölümde istediğin değişikliği yaz'}</span>
              <textarea
                rows={4}
                value={manual.aiEditNote}
                placeholder={lang === 'en' ? 'Example: Make this section shorter on mobile and move the focal point up.' : 'Örnek: Mobilde bu bölümü kısalt ve odak noktasını biraz yukarı taşı.'}
                onChange={e => update('aiEditNote', e.target.value)}
              />
            </label>
            <small>
              {lang === 'en'
                ? 'Saved with the editor state. The live AI execution backend will apply these notes only after human approval.'
                : 'Editör durumuyla birlikte kaydedilir. Canlı AI yürütme katmanı bu notları yalnız insan onayı sonrası uygulayacak.'}
            </small>
          </div>

          <div className="visual-editor-save-state">
            <span>●</span>
            {lang === 'en'
              ? 'Changes are saved automatically in this preview.'
              : 'Değişiklikler bu önizlemede otomatik kaydedilir.'}
          </div>
        </aside>
      </div>
    </main>
  );
}

function App() {
  const { route, go } = useHashRoute();
  const [manual, setManualState] = useState<ManualSettings>(() => route === 'admin' ? readManualSettings() : DEFAULT_MANUAL_SETTINGS);
  const setManual = (next: ManualSettings) => {
    setManualState(next);
    localStorage.setItem(MANUAL_SETTINGS_KEY, JSON.stringify(next));
  };
  useEffect(() => {
    if (route === 'admin') return;
    let active = true;
    loadPublishedSiteConfig()
      .then(config => {
        if (active && config) {
          setManualState({ ...DEFAULT_MANUAL_SETTINGS, ...(config as Partial<ManualSettings>) });
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [route]);
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('oska-lang');
    if (stored === 'tr' || stored === 'en') return stored;
    return readManualSettings().defaultLang;
  });
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
          manual={manual}
        />
      );
    if (
      route === 'women/bracelets' ||
      route === 'men/bracelets'
    ) {
      const audience = route.startsWith('women/') ? 'women' : 'men';
      return (
        <BraceletsPage
          lang={lang}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          audience={audience}
        />
      );
    }
    if (
      route === 'women/rings' ||
      route === 'men/rings' ||
      route === 'women/necklaces' ||
      route === 'men/necklaces' ||
      route === 'women/earrings' ||
      route === 'men/earrings'
    ) {
      const [audience, kind] = route.split('/') as [
        'women' | 'men',
        'rings' | 'necklaces' | 'earrings',
      ];
      return <CapabilityPage kind={kind} lang={lang} go={go} audience={audience} />;
    }
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
    if (route === 'admin')
      return (
        <ManualControlPanel
          lang={lang}
          setLang={setLang}
          manual={manual}
          setManual={setManual}
          go={go}
        />
      );
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
        manual={manual}
      />
    );
  })();
  return (
    <div
      className={[
        'app',
        !manual.showHero && 'hide-home-hero',
        !manual.showPrimaryRail && 'hide-primary-rail',
        !manual.showPantherEditorial && 'hide-panther-editorial',
        !manual.showCategories && 'hide-home-categories',
        !manual.showMeshEditorial && 'hide-mesh-editorial',
        !manual.showSecondaryRail && 'hide-secondary-rail',
        !manual.showBrand && 'hide-brand-section',
        !manual.showExplore && 'hide-explore-section',
        !manual.showProcess && 'hide-process-section',
        !manual.showService && 'hide-service-section',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <a className="skip-link" href="#main">
        {lang === 'en' ? 'Skip to content' : 'İçeriğe geç'}
      </a>
      {route !== 'admin' && (
        <Header
          key={`header-${lang}`}
          lang={lang}
          setLang={setLang}
          favoritesCount={favorites.size}
          go={go}
        />
      )}
      <div id="main" key={`main-${lang}`}>{content}</div>
      {route !== 'admin' && (
        <>
          <Footer key={`footer-${lang}`} lang={lang} go={go} />
          <button
            className="manual-panel-trigger"
            onClick={() => go('admin')}
            aria-label={lang === 'en' ? 'Open visual editor' : 'Görsel editörü aç'}
          >
            <SlidersHorizontal size={18} />
            <span>{lang === 'en' ? 'EDIT' : 'DÜZENLE'}</span>
          </button>
          <DigitalGuide lang={lang} go={go} route={route} favorites={favorites} />
        </>
      )}
    </div>
  );
}

export default App;
