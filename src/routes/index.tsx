import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { CollectionOverview } from "@/components/home/CollectionOverview";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { MidEditorial } from "@/components/home/MidEditorial";
import { IstanbulSlideshow } from "@/components/home/IstanbulSlideshow";
import { AtelierSection } from "@/components/site/AtelierSection";
import { FilmLibrary } from "@/components/site/FilmLibrary";
import { BespokeSection } from "@/components/site/BespokeSection";
import { ContactCta } from "@/components/site/ContactCta";
import { pageHead } from "@/lib/seo";
import { readLangFromSearch } from "@/lib/lang";
import { t } from "@/data/i18n";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const lang = readLangFromSearch(match.search);
    const copy = t(lang);
    return pageHead({
      lang,
      path: "/",
      title: copy.seoHomeTitle,
      description: copy.seoHomeDescription,
    });
  },
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <CollectionOverview />
      <FeaturedCollection collectionId="panther" />
      <MidEditorial />
      <FeaturedCollection collectionId="mesh" />
      <IstanbulSlideshow />
      <AtelierSection />
      <FilmLibrary limit={6} showAllLink />
      <BespokeSection />
      <ContactCta />
    </>
  );
}