import { createFileRoute } from "@tanstack/react-router";
import { validateCatalogRoute } from "@/lib/catalog-route";
import { CollectionPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/$gender/collections/$collection/$subcollection/")({
  beforeLoad: ({ params }) => validateCatalogRoute(params),
  component: CollectionPage,
});
