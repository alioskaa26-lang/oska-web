import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { pageHead } from "@/lib/seo";
import { Capabilities } from "@/components/site/Capabilities";
import { ContactCta } from "@/components/site/ContactCta";
import { LangLink } from "@/components/site/LangLink";

export const Route = createFileRoute("/about")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    return pageHead({
      lang,
      path: "/about",
      title: copy.seoAboutTitle,
      description: copy.seoAboutDescription,
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const lang = useLang();
  const copy = t(lang);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{copy.aboutEyebrow}</p>
        <h1>{copy.aboutTitle}</h1>
        <p className="page-intro">{copy.aboutIntro}</p>
      </header>

      <section className="prose section-pad">
        <h2>{copy.aboutAtelierTitle}</h2>
        <p>{copy.aboutAtelierText}</p>
        <h2>{copy.aboutMaterialsTitle}</h2>
        <p>{copy.aboutMaterialsText}</p>
        <h2>{copy.aboutPartnersTitle}</h2>
        <p>{copy.aboutPartnersText}</p>
        <p>
          <LangLink to="/wholesale" className="text-link">
            {copy.wholesaleNav}
          </LangLink>
          {" · "}
          <LangLink to="/faq" className="text-link">
            {copy.faqNav}
          </LangLink>
          {" · "}
          <LangLink to="/collections" className="text-link">
            {copy.collectionsNav}
          </LangLink>
        </p>
      </section>

      <section className="section-pad">
        <Capabilities />
      </section>

      <ContactCta />
    </>
  );
}