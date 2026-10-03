import { createFileRoute } from "@tanstack/react-router";
import { StoryPage } from "@/pages/EnquiryPages";
export const Route = createFileRoute("/faq")({ component: () => <StoryPage kind="faq" /> });
