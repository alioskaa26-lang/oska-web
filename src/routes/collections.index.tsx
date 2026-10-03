import { createFileRoute } from "@tanstack/react-router";
import { CollectionsPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/collections/")({ component: () => <CollectionsPage /> });
