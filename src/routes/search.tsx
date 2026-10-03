import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/search")({ component: () => <SearchPage /> });
