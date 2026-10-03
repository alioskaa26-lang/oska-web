import { createFileRoute } from "@tanstack/react-router";
import { validateCatalogRoute } from "@/lib/catalog-route";
import { CategoryPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/$gender/category/bracelets")({
  beforeLoad: ({ params }) => validateCatalogRoute(params),
  component: CategoryPage,
});
