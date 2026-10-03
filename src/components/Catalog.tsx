import { Heart, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  modelName,
  modelPath,
  type Product,
  type Gender,
  type Collection,
  collectionPath,
} from "@/data/catalog";
import { SiteLink, useShortlist } from "./Layout";
export function Artwork({
  collection = "mesh",
  tone = "silver",
  label = "Photography pending",
  role = "front",
  className = "",
}: {
  collection?: string;
  tone?: string;
  label?: string;
  role?: string;
  className?: string;
}) {
  return (
    <div
      className={`artwork ${className} tone-${tone} art-${collection} view-${role}`}
      role="img"
      aria-label={`${label}. ${role} photography pending.`}
    >
      <span className="placeholder-mark" aria-hidden="true">
        OSKA
      </span>
      <span className="art-caption">
        {label} · {role} photography pending
      </span>
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const { ids, toggle } = useShortlist();
  return (
    <article
      className="product-card"
      data-model={product.id}
      data-gender={product.gender}
      data-collection={product.collection}
    >
      <div className="product-image">
        <SiteLink href={modelPath(product)} aria-label={`View ${modelName(product)}`}>
          <Artwork
            collection={product.collection}
            tone={product.swatch || "silver"}
            label={product.code}
          />
        </SiteLink>
        <button
          className="save icon"
          onClick={() => toggle(product.id)}
          aria-pressed={ids.includes(product.id)}
          aria-label={`${ids.includes(product.id) ? "Remove" : "Save"} ${product.code}`}
        >
          <Heart size={18} fill={ids.includes(product.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <SiteLink href={modelPath(product)}>
        <h3>{product.name.en}</h3>
        <p>{product.finish.en}</p>
        <small>
          {product.code} <span>Discover model ↗</span>
        </small>
      </SiteLink>
    </article>
  );
}
export function ProductGrid({ products, strip = false }: { products: Product[]; strip?: boolean }) {
  return products.length ? (
    <div className={`product-grid ${strip ? "five-models" : ""}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  ) : (
    <p className="empty">No models match this selection.</p>
  );
}
export function CollectionCards({
  collections,
  gender,
}: {
  collections: Collection[];
  gender?: Gender;
}) {
  return (
    <div className="collection-grid">
      {collections.map((c) => (
        <SiteLink
          href={gender ? collectionPath(gender, c.id) : `/collections/${c.id}`}
          className="collection-card"
          key={c.id}
        >
          <Artwork collection={c.id} label={c.name.en} />
          <div>
            <h3>{c.name.en}</h3>
            <ArrowUpRight size={22} />
          </div>
          <p>{c.description.en}</p>
        </SiteLink>
      ))}
    </div>
  );
}
export function Hero({
  eyebrow,
  title,
  text,
  href,
  cta,
  collection = "panther",
  secondary,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  collection?: string;
  secondary?: ReactNode;
}) {
  return (
    <section className={`hero hero-${collection}`}>
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="actions">
          <SiteLink href={href} className="button">
            {cta} <ArrowUpRight size={16} />
          </SiteLink>
          {secondary}
        </div>
        <small>OSKA · A study in form and character</small>
      </div>
      <Artwork
        collection={collection}
        label={`${collection === "mesh" ? "Hexagon" : collection} collection`}
        className="hero-art"
      />
    </section>
  );
}
export function Section({
  eyebrow,
  title,
  link,
  children,
}: {
  eyebrow?: string;
  title: string;
  link?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {link && (
          <SiteLink href={link.href} className="text-link">
            {link.label} ↗
          </SiteLink>
        )}
      </div>
      {children}
    </section>
  );
}
export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <SiteLink href="/">Home</SiteLink>
      {items.map((item) => (
        <span key={item.href}>
          {" "}
          / <SiteLink href={item.href}>{item.label}</SiteLink>
        </span>
      ))}
    </nav>
  );
}
export function ContactCta() {
  return (
    <section className="contact-cta">
      <p className="eyebrow">Start a conversation</p>
      <h2>
        Your next collection
        <br />
        begins with a detail.
      </h2>
      <SiteLink href="/rfq" className="button">
        Prepare an enquiry <ArrowUpRight size={16} />
      </SiteLink>
    </section>
  );
}
