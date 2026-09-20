import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/data/i18n";
import { readLangFromSearch, useLang } from "@/lib/lang";
import { pageHead } from "@/lib/seo";
import { FilmLibrary } from "@/components/site/FilmLibrary";
import { ContactCta } from "@/components/site/ContactCta";

export const Route = createFileRoute("/films")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    return pageHead({
      lang,
      path: "/films",
      title: copy.seoFilmsTitle,
      description: copy.seoFilmsDescription,
    });
  },
  component: FilmsPage,
});

function FilmsPage() {
  const lang = useLang();
  const copy = t(lang);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{copy.filmEyebrow}</p>
        <h1>{copy.filmLibraryTitle}</h1>
        <p className="page-intro">{copy.filmsIntro}</p>
      </header>
      <FilmLibrary />
      <ContactCta />
    </>
  );
}