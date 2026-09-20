import { createFileRoute } from "@tanstack/react-router";
import { assetUrl, localized, slideshowImages } from "@/data/catalog";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { pageHead } from "@/lib/seo";
import { AtelierSection } from "@/components/site/AtelierSection";
import { Capabilities } from "@/components/site/Capabilities";
import { ContactCta } from "@/components/site/ContactCta";

export const Route = createFileRoute("/atelier")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    return pageHead({
      lang,
      path: "/atelier",
      title: copy.seoAtelierTitle,
      description: copy.seoAtelierDescription,
    });
  },
  component: AtelierPage,
});

function AtelierPage() {
  const lang = useLang();
  const copy = t(lang);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{copy.atelierEyebrow}</p>
        <h1>{copy.atelierTitle}</h1>
        <p className="page-intro">{copy.atelierText}</p>
      </header>

      <AtelierSection showLink={false} />

      <section className="section-pad" aria-labelledby="archive-title">
        <h2 id="archive-title">{copy.atelierGallery}</h2>
        <div className="archive-grid">
          {slideshowImages.map((slide) => (
            <figure key={slide.id}>
              <img
                src={assetUrl(slide.image)}
                alt={localized(slide.alt, lang)}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 820px) 100vw, 33vw"
              />
              <figcaption>{localized(slide.caption, lang)}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <Capabilities />
      </section>

      <ContactCta />
    </>
  );
}