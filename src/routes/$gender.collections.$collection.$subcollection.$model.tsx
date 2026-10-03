import { createFileRoute } from "@tanstack/react-router";
import { validateCatalogRoute } from "@/lib/catalog-route";
import { ModelPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/$gender/collections/$collection/$subcollection/$model")({
  beforeLoad: ({ params }) => validateCatalogRoute(params),
  component: ModelPage,
});
