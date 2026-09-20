/**
 * OSKA staging configuration.
 *
 * Everything in `contact` is a CONFIGURABLE PLACEHOLDER. Only values that are
 * verified from the live site are filled in. Leave a value as `null` until the
 * owner supplies the real one — the UI hides unverified channels instead of
 * inventing them.
 */
export const site = {
  /** Future production domain (used for canonical + hreflang + sitemap). */
  productionOrigin: "https://www.oskasilver.com",
  brand: "OSKA Jewelry",
  contact: {
    /** VERIFIED from the live site. */
    instagram: "https://www.instagram.com/oskasilver/",
    instagramHandle: "@oskasilver",
    /** NOT VERIFIED — set to a real address to reveal the email CTA. */
    email: null as string | null,
    /** NOT VERIFIED — international format without "+", e.g. "905xxxxxxxxx". */
    whatsapp: null as string | null,
    /** NOT VERIFIED — set to a real company page URL to reveal the LinkedIn link. */
    linkedin: null as string | null,
    /** NOT VERIFIED — phone shown only when supplied. */
    phone: null as string | null,
    /** Atelier location, verified from the live site copy. */
    city: "Istanbul, Türkiye",
  },
  /** Catalogue delivery: set to a real PDF/endpoint to switch from request-only. */
  catalogue: {
    pdfUrl: null as string | null,
  },
  /** Analytics: no ID invented. Events are pushed to window.dataLayer regardless. */
  analytics: {
    id: null as string | null,
  },
} as const;

export type Lang = "en" | "tr";

export const languages: Lang[] = ["en", "tr"];