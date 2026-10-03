import { createFileRoute } from "@tanstack/react-router";
import { RfqPage } from "@/pages/EnquiryPages";
export const Route = createFileRoute("/rfq")({
  validateSearch: (s: Record<string, unknown>) => ({
    model: typeof s["model"] === "string" ? s["model"] : undefined,
    shortlist: s["shortlist"] === "1" ? "1" : undefined,
  }),
  component: () => <RfqPage />,
});
