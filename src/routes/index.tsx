import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/")({ component: () => <HomePage /> });
