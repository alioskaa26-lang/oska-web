import raw from "./catalog.json" with { type: "json" };
export type Gender = "women" | "men";
export type Localized = { en: string; tr: string };
export type Collection = {
  id: string;
  code: string;
  name: Localized;
  description: Localized;
  image: string;
  hidden?: boolean;
};
export type Photo = {
  role: "front" | "detail" | "side" | "back" | "lifestyle";
  src: string | null;
};
export type Product = {
  id: string;
  collection: string;
  name: Localized;
  finish: Localized;
  image: string;
  description: Localized;
  code: string;
  swatch?: string;
  gender: Gender;
  subcollection: string;
  category: "bracelets";
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  stones: string | null;
  photos: Photo[];
  relatedIds: string[];
  setPieceIds: string[];
  provenance: "local-preview";
};
// Explicit preview-only editorial assignments, requiring owner approval before Shopify handoff.
const womenIds = new Set([
  "panther-silver",
  "panther-gold",
  "panther-silver-spotted",
  "panther-gold-clear",
  "mesh-silver",
  "mesh-gold",
  "mesh-pave-wide",
  "mesh-polished-gold",
  "mesh-pave-silver",
  "mesh-pave-pink-silver",
  "mesh-pave-green-gold",
  "mesh-pave-gold-narrow",
  "mesh-bands-silver",
  "mesh-bands-gold",
  "mesh-plate-gold",
  "mesh-plate-silver",
  "mesh-arabesque-ruby",
  "mesh-plate-clear-wide",
  "mesh-plate-orange",
  "horse-pave",
]);
export const collections: Collection[] = raw.sitePresentation.collections.filter((c) => !c.hidden);
export const products: Product[] = raw.products.map((p) => ({
  ...p,
  gender: womenIds.has(p.id) ? "women" : "men",
  subcollection:
    p.swatch === "gold" ? "gold-tones" : p.swatch === "silver" ? "silver-tones" : "dark-tones",
  category: "bracelets",
  material: null,
  dimensions: null,
  weight: null,
  stones: null,
  // Missing assets must never be replaced with another model's photographs.
  photos: (["front", "detail", "side", "back", "lifestyle"] as const).map((role) => ({
    role,
    src: null,
  })),
  relatedIds: [],
  setPieceIds: [],
  provenance: "local-preview",
}));
for (const p of products) {
  p.relatedIds = products
    .filter(
      (other) =>
        other.id !== p.id && other.gender === p.gender && other.collection === p.collection,
    )
    .slice(0, 10)
    .map((other) => other.id);
}
export const subcollections = [
  { id: "silver-tones", name: "Silver tones" },
  { id: "gold-tones", name: "Gold tones" },
  { id: "dark-tones", name: "Dark tones" },
] as const;
export function isGender(value: string): value is Gender {
  return value === "women" || value === "men";
}
export function getCollection(id: string) {
  return collections.find((c) => c.id === id);
}
export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
export function productsOf(collection: string, gender?: Gender, subcollection?: string) {
  return products.filter(
    (p) =>
      p.collection === collection &&
      (!gender || p.gender === gender) &&
      (!subcollection || p.subcollection === subcollection),
  );
}
export function collectionsOf(gender: Gender) {
  return collections.filter((c) => productsOf(c.id, gender).length > 0);
}
export function subcollectionsOf(collection: string, gender: Gender) {
  return subcollections.filter((s) => productsOf(collection, gender, s.id).length > 0);
}
export function relatedOf(product: Product) {
  return product.relatedIds
    .map(getProduct)
    .filter(
      (p): p is Product =>
        !!p &&
        p.id !== product.id &&
        p.gender === product.gender &&
        p.collection === product.collection,
    )
    .slice(0, 10);
}
export function setPiecesOf(product: Product) {
  return product.setPieceIds
    .map(getProduct)
    .filter(
      (p): p is Product =>
        !!p &&
        p.id !== product.id &&
        p.gender === product.gender &&
        p.collection === product.collection,
    );
}
export function modelPath(p: Product) {
  return `/${p.gender}/collections/${p.collection}/${p.subcollection}/${p.id}`;
}
export function collectionPath(gender: Gender, id: string) {
  return `/${gender}/collections/${id}`;
}
export function localized(value: Localized | undefined, lang: "en" | "tr") {
  return value?.[lang] || value?.en || "";
}
export function modelName(p: Product) {
  return `${p.name.en} · ${p.code}`;
}
