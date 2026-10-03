import { createFileRoute } from "@tanstack/react-router";
import { StoryPage } from "@/pages/EnquiryPages";
export const Route = createFileRoute("/films")({ component: () => <StoryPage kind="films" /> });
