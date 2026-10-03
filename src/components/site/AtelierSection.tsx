import { Artwork, Section } from "../Catalog";
import { SiteLink } from "../Layout";
export function AtelierSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <Section eyebrow="Istanbul" title="The detail makes the difference">
      <div className="editorial">
        <Artwork label="Atelier photography" />
        <div>
          <h3>From a form to a collection.</h3>
          <p>
            Explore OSKA's approach to sculptural jewelry and discuss the details of your next
            project.
          </p>
          {showLink && (
            <SiteLink href="/atelier" className="text-link">
              Inside the atelier ↗
            </SiteLink>
          )}
        </div>
      </div>
    </Section>
  );
}
