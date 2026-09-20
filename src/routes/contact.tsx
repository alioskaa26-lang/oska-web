import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { pageHead } from "@/lib/seo";
import { analyticsAttrs, trackEvent } from "@/lib/analytics";
import { RfqForm } from "@/components/forms/RfqForm";
import { useCatalogue } from "@/components/forms/CatalogueDialog";

export const Route = createFileRoute("/contact")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    return pageHead({
      lang,
      path: "/contact",
      title: copy.seoContactTitle,
      description: copy.seoContactDescription,
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const lang = useLang();
  const copy = t(lang);
  const catalogue = useCatalogue();

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{copy.contactEyebrow}</p>
        <h1>{copy.contactTitle}</h1>
        <p className="page-intro">{copy.contactText}</p>
      </header>

      <section className="contact-grid section-pad">
        <div>
          <h2>{copy.contactChannels}</h2>
          <ul className="contact-list">
            <li>
              <span>{copy.contactCity}</span>
              <b>{site.contact.city}</b>
            </li>
            <li>
              <span>{copy.contactEmailLabel}</span>
              {site.contact.email ? (
                <a
                  href={`mailto:${site.contact.email}`}
                  {...analyticsAttrs("email_click", "contact-page")}
                  onClick={() => trackEvent("email_click", { label: "contact-page" })}
                >
                  {site.contact.email}
                </a>
              ) : (
                <b className="pending">{copy.contactPending}</b>
              )}
            </li>
            <li>
              <span>WhatsApp</span>
              {site.contact.whatsapp ? (
                <a
                  href={`https://wa.me/${site.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...analyticsAttrs("whatsapp_click", "contact-page")}
                  onClick={() => trackEvent("whatsapp_click", { label: "contact-page" })}
                >
                  {copy.contactWhatsappCta}
                </a>
              ) : (
                <b className="pending">{copy.contactPending}</b>
              )}
            </li>
            <li>
              <span>Instagram</span>
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                {...analyticsAttrs("instagram_click", "contact-page")}
                onClick={() => trackEvent("instagram_click", { label: "contact-page" })}
              >
                {site.contact.instagramHandle}
              </a>
            </li>
          </ul>
          <button
            type="button"
            className="button button-outline"
            onClick={() => catalogue.open("contact-page")}
            {...analyticsAttrs("catalogue_open", "contact-page")}
          >
            {copy.catalogButton}
          </button>
        </div>
        <div>
          <h2>{copy.rfqTitle}</h2>
          <RfqForm />
        </div>
      </section>
    </>
  );
}