import { createFileRoute } from "@tanstack/react-router";
import { ShortlistPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/shortlist")({ component: () => <ShortlistPage /> });
