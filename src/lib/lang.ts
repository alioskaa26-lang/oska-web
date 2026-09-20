import { useSearch } from "@tanstack/react-router";
import type { Lang } from "@/config/site";

/** Current UI language. Default EN; Turkish is served at ?lang=tr. */
export function useLang(): Lang {
  const search = useSearch({ strict: false }) as { lang?: string };
  return search?.lang === "tr" ? "tr" : "en";
}

/** Search object to append to every internal link so language is preserved. */
export function useLangSearch(): { lang?: "tr" } {
  const lang = useLang();
  return lang === "tr" ? { lang: "tr" } : {};
}

export function langSearchFor(lang: Lang): { lang?: "tr" } {
  return lang === "tr" ? { lang: "tr" } : {};
}

export function readLangFromSearch(search: unknown): Lang {
  const value = (search as { lang?: string } | undefined)?.lang;
  return value === "tr" ? "tr" : "en";
}