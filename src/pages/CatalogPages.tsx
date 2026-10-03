import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  collections,
  collectionsOf,
  collectionPath,
  getCollection,
  getProduct,
  isGender,
  modelName,
  products,
  productsOf,
  relatedOf,
  setPiecesOf,
  subcollections,
  subcollectionsOf,
  type Gender,
  type Product,
} from "@/data/catalog";
import {
  Artwork,
  Breadcrumbs,
  CollectionCards,
  ContactCta,
  Hero,
  ProductGrid,
  Section,
} from "@/components/Catalog";
import { SiteLink, useShortlist } from "@/components/Layout";
import { site } from "@/config/site";

export function HomePage() {
  return (
    <>
      <Hero
        eyebrow="The Panther collection"
        title="Instinct, cast in form."
        text="Sculptural silhouettes. Articulated links. Discover the expressive world of OSKA jewelry."
        href="/women"
        cta="Explore women"
        secondary={
          <SiteLink href="/men" className="text-link">
            Explore men ↗
          </SiteLink>
        }
      />
      <div className="discovery-strip">
        <span>01 / PANTHER</span>
        <p>Character in every detail.</p>
        <SiteLink href="/collections/panther">Discover the collection ↗</SiteLink>
      </div>
      <Section eyebrow="Two perspectives. One atelier." title="Find your expression">
        <div className="gender-grid">
          {(["women", "men"] as const).map((gender) => (
            <SiteLink key={gender} className={`gender-tile ${gender}`} href={`/${gender}`}>
              <p className="eyebrow">OSKA / {gender}</p>
              <h2>{gender === "women" ? "A singular presence." : "Strength in the details."}</h2>
              <span>Discover {gender} ↗</span>
            </SiteLink>
          ))}
        </div>
      </Section>
      <Section
        eyebrow="The collection directory"
        title="A language of our own"
        link={{ href: "/collections", label: "All collections" }}
      >
        <CollectionCards collections={collections} />
      </Section>
      <section className="editorial">
        <Artwork collection="mesh" label="Hexagon study" />
        <div>
          <p className="eyebrow">The Hexagon collection</p>
          <h2>Linked by design.</h2>
          <p>
            A rhythm of articulated forms. Explore the surfaces and finishes that give Hexagon its
            distinct character.
          </p>
          <SiteLink href="/collections/mesh" className="text-link">
            Discover Hexagon ↗
          </SiteLink>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
export function GenderPage({ gender }: { gender: Gender }) {
  const available = collectionsOf(gender);
  const primary = gender === "men" ? "panther" : "mesh";
  const secondary = gender === "men" ? "mesh" : "signature";
  const featured = productsOf(primary, gender);
  // A five-model editorial selection, always inside this gender.
  const selection = [
    ...featured,
    ...products.filter((p) => p.gender === gender && p.collection !== primary),
  ].slice(0, 5);
  return (
    <>
      <Hero
        eyebrow={`OSKA ${gender} / ${getCollection(primary)?.name.en}`}
        title={gender === "men" ? "Defined by character." : "An expression of you."}
        text={getCollection(primary)!.description.en}
        href={collectionPath(gender, primary)}
        cta="Discover the collection"
        collection={primary}
      />
      <div className="discovery-strip">
        <span>{gender.toUpperCase()} / THE EDIT</span>
        <p>Considered forms. Distinctive finishes.</p>
        <SiteLink href={collectionPath(gender, primary)}>
          Explore {getCollection(primary)?.name.en} ↗
        </SiteLink>
      </div>
      <Section eyebrow={`Selected for ${gender}`} title="Five expressions">
        <ProductGrid products={selection} strip />
      </Section>
      <section className="editorial">
        <Artwork collection={secondary} label={getCollection(secondary)!.name.en} />
        <div>
          <p className="eyebrow">A different rhythm</p>
          <h2>{getCollection(secondary)!.name.en}</h2>
          <p>{getCollection(secondary)!.description.en}</p>
          <SiteLink className="text-link" href={collectionPath(gender, secondary)}>
            Explore the collection ↗
          </SiteLink>
        </div>
      </section>
      <Section eyebrow={`OSKA ${gender}`} title="Shop by category">
        <div className="category-row">
          <SiteLink href={`/${gender}/category/bracelets`} className="button">
            Bracelets ↗
          </SiteLink>
          <span>Necklaces · Earrings · Rings — coming later</span>
        </div>
      </Section>
      <Section title="Continue exploring">
        <CollectionCards collections={available} gender={gender} />
      </Section>
    </>
  );
}
export function CollectionsPage() {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">The OSKA collection directory</p>
        <h1>A world of character.</h1>
        <p>Discover a main collection, then choose your perspective.</p>
      </header>
      <Section title="Featured collections">
        <CollectionCards collections={collections.slice(0, 2)} />
      </Section>
      <Section title="All collections">
        <div className="directory">
          {collections.map((c, i) => (
            <SiteLink key={c.id} href={`/collections/${c.id}`}>
              <span>0{i + 1}</span>
              <h2>{c.name.en}</h2>
              <p>{c.description.en}</p>
              <span>↗</span>
            </SiteLink>
          ))}
        </div>
      </Section>
    </>
  );
}
export function CollectionEntryPage() {
  const { collection } = useParams({ strict: false });
  const item = getCollection(collection!)!;
  return (
    <>
      <Breadcrumbs items={[{ href: "/collections", label: "Collections" }]} />
      <header className="page-header">
        <p className="eyebrow">{item.code} / OSKA</p>
        <h1>{item.name.en}</h1>
        <p>{item.description.en}</p>
      </header>
      <Section title="Choose your perspective">
        <div className="gender-grid">
          {(["women", "men"] as const)
            .filter((g) => productsOf(item.id, g).length)
            .map((gender) => (
              <SiteLink
                key={gender}
                href={collectionPath(gender, item.id)}
                className={`gender-tile ${gender}`}
              >
                <p className="eyebrow">{item.name.en}</p>
                <h2>{gender === "women" ? "Women" : "Men"}</h2>
                <span>Discover the collection ↗</span>
              </SiteLink>
            ))}
        </div>
      </Section>
    </>
  );
}
export function CollectionPage() {
  const { gender: rawGender, collection, subcollection } = useParams({ strict: false });
  const gender = rawGender as Gender;
  const item = getCollection(collection!)!;
  const sub = subcollections.find((s) => s.id === subcollection);
  const list = productsOf(item.id, gender, subcollection);
  return (
    <>
      <Breadcrumbs
        items={[
          { href: `/${gender}`, label: gender },
          { href: collectionPath(gender, item.id), label: item.name.en },
          ...(sub
            ? [{ href: `${collectionPath(gender, item.id)}/${sub.id}`, label: sub.name }]
            : []),
        ]}
      />
      <header className="page-header">
        <p className="eyebrow">
          OSKA {gender} / {item.code}
        </p>
        <h1>
          {item.name.en}
          {sub ? ` / ${sub.name}` : ""}
        </h1>
        <p>{item.description.en}</p>
        <small>{list.length} models · Preview selection</small>
      </header>
      <div className="subcollection-tabs" aria-label="Subcollections">
        <SiteLink href={collectionPath(gender, item.id)} aria-current={!sub ? "page" : undefined}>
          All {item.name.en}
        </SiteLink>
        {subcollectionsOf(item.id, gender).map((s) => (
          <SiteLink
            aria-current={s.id === subcollection ? "page" : undefined}
            key={s.id}
            href={`${collectionPath(gender, item.id)}/${s.id}`}
          >
            {s.name}
          </SiteLink>
        ))}
      </div>
      <Section title={sub ? `${sub.name} models` : "Explore the models"}>
        <ProductGrid products={list} />
      </Section>
      <Section eyebrow="Continue exploring" title={`More from ${item.name.en}`}>
        <div className="category-row">
          {subcollectionsOf(item.id, gender)
            .filter((s) => s.id !== subcollection)
            .map((s) => (
              <SiteLink
                className="button outline"
                key={s.id}
                href={`${collectionPath(gender, item.id)}/${s.id}`}
              >
                {s.name} ↗
              </SiteLink>
            ))}
          <SiteLink className="text-link" href={collectionPath(gender, item.id)}>
            Back to {item.name.en} ↗
          </SiteLink>
        </div>
      </Section>
    </>
  );
}
export function CategoryPage() {
  const { gender } = useParams({ strict: false });
  return (
    <>
      <Breadcrumbs items={[{ href: `/${gender}`, label: gender! }]} />
      <header className="page-header">
        <p className="eyebrow">OSKA {gender}</p>
        <h1>Bracelets</h1>
        <p>Discover the collection behind every model.</p>
      </header>
      <Section title="The bracelet edit">
        <ProductGrid products={products.filter((p) => p.gender === gender)} />
      </Section>
    </>
  );
}
export function ModelPage() {
  const { model } = useParams({ strict: false });
  const product = getProduct(model!)!;
  return <ModelDetail key={product.id} product={product} />;
}
function ModelDetail({ product: p }: { product: Product }) {
  const [active, setActive] = useState(0);
  const { ids, toggle } = useShortlist();
  const parent = getCollection(p.collection)!;
  const photo = p.photos[active]!;
  const base = collectionPath(p.gender, p.collection);
  const related = relatedOf(p);
  const pieces = setPiecesOf(p);
  return (
    <>
      <Breadcrumbs
        items={[
          { href: `/${p.gender}`, label: p.gender },
          { href: base, label: parent.name.en },
          {
            href: `${base}/${p.subcollection}`,
            label: subcollections.find((s) => s.id === p.subcollection)!.name,
          },
        ]}
      />
      <section className="model-detail">
        <div className="gallery">
          <Artwork
            collection={p.collection}
            tone={p.swatch || "silver"}
            role={photo.role}
            label={`${p.code} / ${photo.role}`}
            className="main-photo"
          />
          <div className="thumbnails" aria-label="Model photographs">
            {p.photos.map((item, index) => (
              <button
                key={item.role}
                aria-label={`View ${item.role} photograph`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <Artwork
                  collection={p.collection}
                  tone={p.swatch || "silver"}
                  role={item.role}
                  label={item.role}
                />
              </button>
            ))}
          </div>
          <p className="muted">
            4 product views + 1 lifestyle view. Explicit placeholders; approved OSKA photographs
            pending.
          </p>
        </div>
        <div className="model-copy">
          <p className="eyebrow">
            OSKA {p.gender} / <SiteLink href={base}>{parent.name.en} collection</SiteLink>
          </p>
          <h1>{p.name.en}</h1>
          <p>{p.finish.en}</p>
          <p className="sku">Model / SKU {p.code}</p>
          <p>{p.description.en}</p>
          <dl>
            {[
              ["Material", p.material],
              ["Dimensions", p.dimensions],
              ["Weight", p.weight],
              ["Stones", p.stones],
              ["Finish", p.finish.en],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "To be confirmed by the atelier"}</dd>
              </div>
            ))}
          </dl>
          <p className="muted">
            Material, sizing and availability are confirmed with your enquiry.
          </p>
          <div className="model-actions">
            <SiteLink href={`/rfq?model=${p.id}`} className="button">
              Request a quote ↗
            </SiteLink>
            <button
              className="button outline"
              aria-pressed={ids.includes(p.id)}
              onClick={() => toggle(p.id)}
            >
              {ids.includes(p.id) ? "Remove from shortlist" : "Add to shortlist"}
            </button>
            {site.contact.whatsapp ? (
              <a
                className="button outline"
                href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Enquiry: ${modelName(p)}`)}`}
              >
                WhatsApp
              </a>
            ) : (
              <button className="button outline" disabled>
                WhatsApp · number pending
              </button>
            )}
            <SiteLink href={`/contact?model=${p.id}`} className="text-link">
              Contact the atelier ↗
            </SiteLink>
          </div>
          <details open>
            <summary>The story</summary>
            <p>{p.description.en}</p>
            <SiteLink href={base}>Explore the parent collection ↗</SiteLink>
          </details>
          <details open>
            <summary>Set pieces</summary>
            {pieces.length ? (
              <ProductGrid products={pieces} />
            ) : (
              <p>
                No matching set pieces are confirmed for this model. Ask the atelier about
                complementary designs.
              </p>
            )}
          </details>
        </div>
      </section>
      {related.length > 0 && (
        <Section eyebrow={`OSKA ${p.gender} / ${parent.name.en}`} title="Related models">
          <ProductGrid products={related} />
        </Section>
      )}
      <Section title="Continue exploring">
        <SiteLink className="button outline" href={`${base}/${p.subcollection}`}>
          More from this series ↗
        </SiteLink>
      </Section>
    </>
  );
}
export function SearchPage() {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<Gender>("women");
  const [collection, setCollection] = useState("all");
  const list = products.filter(
    (p) =>
      p.gender === gender &&
      (collection === "all" || p.collection === collection) &&
      `${p.name.en} ${p.code} ${p.finish.en} ${getCollection(p.collection)?.name.en}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Find your next detail</p>
        <h1>Search OSKA</h1>
      </header>
      <section className="section">
        <div className="filters">
          <label>
            Search by model, SKU or finish
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Panther or P001"
            />
          </label>
          <label>
            Perspective
            <select
              value={gender}
              onChange={(e) => {
                if (isGender(e.target.value)) setGender(e.target.value);
              }}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </label>
          <label>
            Collection
            <select value={collection} onChange={(e) => setCollection(e.target.value)}>
              <option value="all">All collections</option>
              {collectionsOf(gender).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status">
          {list.length} models for {gender}
        </p>
        <ProductGrid products={list} />
      </section>
    </>
  );
}
export function ShortlistPage() {
  const { ids, storageAvailable } = useShortlist();
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Your considered selection</p>
        <h1>Shortlist</h1>
        <p>
          {storageAvailable
            ? "Saved on this browser for your next conversation with OSKA."
            : "Browser storage is unavailable. Your selection lasts for this visit only."}
        </p>
      </header>
      {ids.length ? (
        <>
          {(["women", "men"] as const).map((gender) => {
            const list = products.filter((p) => p.gender === gender && ids.includes(p.id));
            return list.length ? (
              <Section key={gender} title={gender === "women" ? "Women" : "Men"}>
                <ProductGrid products={list} />
              </Section>
            ) : null;
          })}
          <section className="section">
            <SiteLink href="/rfq?shortlist=1" className="button">
              Enquire about your shortlist ↗
            </SiteLink>
          </section>
        </>
      ) : (
        <Section title="Make it personal">
          <p>Save a model with the heart button to start your selection.</p>
          <div className="actions">
            <SiteLink href="/women" className="button">
              Explore women
            </SiteLink>
            <SiteLink href="/men" className="button outline">
              Explore men
            </SiteLink>
          </div>
        </Section>
      )}
    </>
  );
}
