import { createFileRoute } from "@tanstack/react-router";
import { GenderPage } from "@/pages/CatalogPages";
export const Route = createFileRoute("/women")({ component: () => <GenderPage gender="women" /> });
