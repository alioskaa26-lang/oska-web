import raw from "./catalog.json";
import type { Lang } from "@/config/site";
import { mediaUrl } from "@/lib/media";

type Localized = { en: string; tr: string };

export type Product = {
  id: string;
  collection: string;
  name: Localized;
  finish: Localized;
  image: string;
  swatch?: string;
  square?: boolean;
  description: Localized;
  code?: string;
};

export type Collection = {
  id: string;
  code: string;
  name: Localized;
  description: Localized;
  image: string;
  hidden?: boolean;
};

export type MediaItem = { type: "image" | "video"; src: string; poster?: string };

export type SlideshowImage = {
  id: string;
  image: string;
  fallback?: string;
  fit?: string;
  caption: Localized;
  alt: Localized;
  credit?: string;
};

const data = raw as unknown as {
  products: Product[];
  mediaGalleries: Record<string, MediaItem[]>;
  sitePresentation: {
    collections: Collection[];
    featured: Record<string, string[]>;
    structure: { atelierSlideshow: SlideshowImage[] };
  };
};

export const products: Product[] = data.products;
export const collections: Collection[] = data.sitePresentation.collections.filter((c) => !c.hidden);
export const featured = data.sitePresentation.featured;
export const slideshowImages = data.sitePresentation.structure.atelierSlideshow;
export const mediaGalleries = data.mediaGalleries;

/** Normalise a catalogue asset reference to a servable URL. */
export function assetUrl(ref: string): string {
  const clean = ref.replace(/^\/+/, "");
  if (clean.startsWith("assets/") || clean.startsWith("videos/")) return mediaUrl(clean);
  return mediaUrl(`assets/${clean}`);
}

export function localized(value: Localized | undefined, lang: Lang): string {
  if (!value) return "";
  return value[lang] || value.en || "";
}

export function getCollection(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

export function productsOf(collectionId: string): Product[] {
  return products.filter((p) => p.collection === collectionId);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function featuredOf(collectionId: string): Product[] {
  const ids = featured[collectionId] ?? [];
  const picked = ids.map(getProduct).filter(Boolean) as Product[];
  return picked.length ? picked : productsOf(collectionId).slice(0, 4);
}

export function galleryOf(productId: string): MediaItem[] {
  return mediaGalleries[productId] ?? [];
}

/** Descriptive alt text for an informative product image, per language. */
export function productAlt(product: Product, lang: Lang): string {
  const name = localized(product.name, lang);
  const finish = localized(product.finish, lang).replace(/\s*·\s*/g, ", ");
  return lang === "tr"
    ? `${name} bileklik — ${finish}`
    : `${name} bracelet — ${finish}`;
}

/** Every product film in the catalogue, de-duplicated, with its poster. */
export function productFilms(): { src: string; poster?: string; productId: string }[] {
  const seen = new Set<string>();
  const films: { src: string; poster?: string; productId: string }[] = [];
  for (const [productId, items] of Object.entries(mediaGalleries)) {
    for (const item of items) {
      if (item.type !== "video" || seen.has(item.src)) continue;
      seen.add(item.src);
      films.push({ src: item.src, poster: item.poster, productId });
    }
  }
  return films;
}