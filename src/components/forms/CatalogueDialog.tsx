import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
/** Existing catalogue CTAs share the RFQ destination until a PDF is approved. */
export function CatalogueProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function useCatalogue() {
  const navigate = useNavigate();
  return {
    open: (_source?: string) =>
      void navigate({ to: "/rfq", search: { model: undefined, shortlist: undefined } }),
  };
}
