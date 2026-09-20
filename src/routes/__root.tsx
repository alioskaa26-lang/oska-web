import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { site } from "../config/site";
import { Layout } from "../components/site/Layout";
import { CatalogueProvider } from "../components/forms/CatalogueDialog";
import { readLangFromSearch } from "../lib/lang";
import { organizationSchema, jsonLd } from "../lib/seo";

function NotFoundComponent() {
  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <p className="eyebrow">OSKA JEWELRY</p>
      <h1>Page not found · Sayfa bulunamadı</h1>
      <p className="page-intro">
        This page doesn’t exist or has moved. · Bu sayfa mevcut değil veya taşındı.
      </p>
      <Link to="/" className="button button-dark">
        BACK TO HOME
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <h1>This page didn’t load</h1>
      <p className="page-intro">
        Something went wrong on our end. You can try again or head back home.
      </p>
      <div className="bespoke-actions">
        <button
          className="button button-dark"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          TRY AGAIN
        </button>
        <a className="button button-outline" href="/">
          BACK TO HOME
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: search.lang === "tr" ? ("tr" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OSKA Jewelry — Wholesale & Bespoke Jewelry Atelier, Istanbul" },
      {
        name: "description",
        content:
          "OSKA Jewelry is an Istanbul atelier producing wholesale, private label and bespoke bracelet collections in 925 sterling silver, brass, gold plating and stone-set finishes.",
      },
      { property: "og:site_name", content: site.brand },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [jsonLd(organizationSchema())],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const search = Route.useSearch();
  const lang = readLangFromSearch(search);

  // Keep the document language in sync with the visible interface language.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <QueryClientProvider client={queryClient}>
      <CatalogueProvider>
        <Layout>
          {/* Required: nested routes render here. */}
          <Outlet />
        </Layout>
      </CatalogueProvider>
    </QueryClientProvider>
  );
}