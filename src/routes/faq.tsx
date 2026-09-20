import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { jsonLd, pageHead } from "@/lib/seo";
import { faqItems } from "@/data/i18n";
import { ContactCta } from "@/components/site/ContactCta";

export const Route = createFileRoute("/faq")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    const head = pageHead({
      lang,
      path: "/faq",
      title: copy.seoFaqTitle,
      description: copy.seoFaqDescription,
    });
    return {
      ...head,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems(lang).map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      ],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  const lang = useLang();
  const copy = t(lang);
  const items = faqItems(lang);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{copy.faqEyebrow}</p>
        <h1>{copy.faqTitle}</h1>
        <p className="page-intro">{copy.faqIntro}</p>
      </header>

      <section className="faq-list section-pad">
        {items.map((item) => (
          <details key={item.q}>
            <summary>
              <h2>{item.q}</h2>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <ContactCta />
    </>
  );
}