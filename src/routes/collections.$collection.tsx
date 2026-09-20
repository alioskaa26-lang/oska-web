import { createFileRoute, notFound } from "@tanstack/react-router";
import { assetUrl, getCollection, localized, productsOf } from "@/data/catalog";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { pageHead } from "@/lib/seo";
import { LangLink } from "@/components/site/LangLink";
import { ProductCard } from "@/components/site/ProductCard";
import { Capabilities } from "@/components/site/Capabilities";
import { ContactCta } from "@/components/site/ContactCta";

export const Route = createFileRoute("/collections/$collection")({
  loader: ({ params }) => {
    const collection = getCollection(params.collection);
    if (!collection) throw notFound();
    return { collectionId: collection.id };
  },
  head: ({ match, params }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    const collection = getCollection(params.collection);
    const name = collection ? localized(collection.name, lang) : "";
    if (!collection) {
      return {
        meta: [{ title: copy.notFoundTitle }, { name: "robots", content: "noindex" }],
      };
    }
    return pageHead({
      lang,
      path: `/collections/${collection.id}`,
      title: `${name} ${copy.seoCollectionSuffix}`,
      description: `${localized(collection.description, lang)} ${copy.seoCollectionDescription}`,
      ogImage: `/${assetUrl(collection.image).replace(/^\//, "")}`,
    });
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collectionId } = Route.useLoaderData();
  const lang = useLang();
  const copy = t(lang);
  const collection = getCollection(collectionId)!;
  const products = productsOf(collectionId);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">
          <LangLink to="/collections" className="text-link">
            {copy.collectionsNav}
          </LangLink>
        </p>
        <h1>{localized(collection.name, lang)}</h1>
        <p className="page-intro">{localized(collection.description, lang)}</p>
        <p className="collection-count">
          {products.length} {copy.models} · {copy.collectionRef} {collection.code}
        </p>
      </header>

      <section className="collection-products section-pad" aria-label={copy.models}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} eager={index < 4} />
        ))}
      </section>

      <section className="section-pad">
        <Capabilities />
      </section>

      <ContactCta />
    </>
  );
}