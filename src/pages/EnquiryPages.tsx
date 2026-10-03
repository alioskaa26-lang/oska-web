import { useSearch } from "@tanstack/react-router";
import { getProduct, modelName, modelPath } from "@/data/catalog";
import { useShortlist, SiteLink } from "@/components/Layout";
import { Artwork, ContactCta, Section } from "@/components/Catalog";
import { RfqForm } from "@/components/forms/RfqForm";
import { site } from "@/config/site";
export function RfqPage({ contact = false }: { contact?: boolean }) {
  const search = useSearch({ strict: false }) as { model?: string; shortlist?: string };
  const { ids } = useShortlist();
  const selected = (search.model ? [search.model] : search.shortlist === "1" ? ids : [])
    .map(getProduct)
    .filter((p) => !!p);
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Istanbul / The OSKA atelier</p>
        <h1>{contact ? "Let’s begin a conversation." : "A collection starts here."}</h1>
        <p>Tell us about the models, finishes and quantities you have in mind.</p>
      </header>
      <section className="contact-grid section">
        <aside>
          <h2>{contact ? "Contact OSKA" : "Your enquiry"}</h2>
          {search.model && !getProduct(search.model) && (
            <p role="alert">
              This model reference is unavailable. Select a model from the collections or prepare a
              general enquiry.
            </p>
          )}
          {selected.length ? (
            <ul className="selected-models">
              {selected.map((p) => (
                <li key={p.id}>
                  <SiteLink href={modelPath(p)}>{modelName(p)} ↗</SiteLink>
                  <small>
                    {p.gender} · {p.finish.en}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              A general enquiry for the atelier.{" "}
              <SiteLink href="/collections">Explore the collections ↗</SiteLink>
            </p>
          )}
          <dl>
            <div>
              <dt>Atelier</dt>
              <dd>Istanbul, Türkiye</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{site.contact.email || "Verified address pending"}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{site.contact.whatsapp || "Verified number pending"}</dd>
            </div>
          </dl>
          <a className="text-link" href={site.contact.instagram} target="_blank" rel="noreferrer">
            {site.contact.instagramHandle} ↗
          </a>
          <div className="notice">
            <b>Private preview</b>
            <p>
              Nothing is sent or stored on a server. Prepare your draft for a later conversation
              with OSKA.
            </p>
          </div>
        </aside>
        <div>
          <h2>Prepare a request for quotation</h2>
          <RfqForm key={selected.map((p) => p.id).join(",")} models={selected} />
        </div>
      </section>
    </>
  );
}
export function StoryPage({ kind }: { kind: "about" | "atelier" | "faq" | "films" }) {
  if (kind === "faq")
    return (
      <>
        <header className="page-header">
          <p className="eyebrow">OSKA / A closer look</p>
          <h1>Questions &amp; answers</h1>
        </header>
        <section className="section prose">
          {[
            [
              "Can I order through this preview?",
              "This is a private catalog presentation. Prepare a local enquiry draft to discuss quantities, finishes and specifications. No orders or payments are accepted.",
            ],
            [
              "Are the materials and measurements final?",
              "No. The atelier must confirm each model’s material, stone specification, dimensions, weight and availability. A finish name is not a claim about metal purity.",
            ],
            [
              "How do I request a quote?",
              "Save models to your shortlist or use Request a quote on a model page. The form prepares a downloadable draft; delivery is not connected.",
            ],
            [
              "Why are photographs marked pending?",
              "Approved OSKA assets are not included in this checkout. Explicit placeholders reserve space for four product views and one lifestyle photograph per model.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <ContactCta />
      </>
    );
  if (kind === "films")
    return (
      <>
        <header className="page-header">
          <p className="eyebrow">OSKA / Moving image</p>
          <h1>Atelier films</h1>
          <p>Approved films are being prepared for the collection.</p>
        </header>
        <Section title="The next chapter">
          <p>Film assets are not available in this private preview.</p>
          <SiteLink href="/atelier" className="button">
            Explore the atelier ↗
          </SiteLink>
        </Section>
      </>
    );
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">OSKA / Istanbul</p>
        <h1>{kind === "atelier" ? "Where character takes shape." : "A distinct point of view."}</h1>
        <p>
          {kind === "atelier"
            ? "From an articulated link to a sculptural motif, each detail contributes to the whole."
            : "OSKA brings expressive forms and considered finishes to jewelry, wholesale collections and private label conversations."}
        </p>
      </header>
      <section className="editorial">
        <Artwork collection="signature" label="Atelier detail" />
        <div>
          <p className="eyebrow">Form / Surface / Detail</p>
          <h2>Made for expression.</h2>
          <p>
            Explore Panther, Hexagon, Signature and Equestrian: four studies in texture, movement
            and character.
          </p>
          <SiteLink href="/collections" className="text-link">
            Discover the collections ↗
          </SiteLink>
        </div>
      </section>
      <Section title="From idea to collection">
        <div className="story-grid">
          <div>
            <h3>01 / Form</h3>
            <p>
              Begin with a model and its parent collection. Build a clear reference for your
              enquiry.
            </p>
          </div>
          <div>
            <h3>02 / Finish</h3>
            <p>
              Discuss surface, stone and material options with the atelier. Specifications are
              confirmed model by model.
            </p>
          </div>
          <div>
            <h3>03 / Collaboration</h3>
            <p>
              Share quantities, sizing and private label requirements to shape the next
              conversation.
            </p>
          </div>
        </div>
      </Section>
      <ContactCta />
    </>
  );
}
