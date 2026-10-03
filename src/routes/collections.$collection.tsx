import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCollection } from "@/data/catalog";
import { CollectionEntryPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/collections/$collection")({
  beforeLoad: ({ params }) => {
    if (!getCollection(params.collection)) throw notFound();
  },
  component: CollectionEntryPage,
});
