import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Layout, SiteLink } from "@/components/Layout";
import appCss from "../styles.css?url";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OSKA Jewelry | Private Preview" },
      {
        name: "description",
        content: "Explore OSKA collections, sculptural jewelry and the Istanbul atelier.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: Shell,
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  notFoundComponent: () => (
    <div className="page-header">
      <p className="eyebrow">OSKA</p>
      <h1>Page not found.</h1>
      <p>This collection or model is not available in the selected context.</p>
      <SiteLink href="/" className="button">
        Return home
      </SiteLink>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="page-header">
      <h1>This page could not load.</h1>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <SiteLink href="/">Return home</SiteLink>
    </div>
  ),
});
function Shell({ children }: { children: ReactNode }) {
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
