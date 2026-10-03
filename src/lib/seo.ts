import { site, type Lang } from "@/config/site";

export function pageHead({
  title,
  description,
  path,
  lang = "en",
  ogImage,
}: {
  title: string;
  description: string;
  path: string;
  lang?: Lang;
  ogImage?: string;
}) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:locale", content: lang === "tr" ? "tr_TR" : "en_US" },
      ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    ],
    links: [
      {
        rel: "canonical",
        href: `${site.productionOrigin}${path}${lang === "tr" ? "?lang=tr" : ""}`,
      },
    ],
  };
}
export function jsonLd(value: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(value).replace(/</g, "\\u003c") };
}
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand,
    url: site.productionOrigin,
  };
}
