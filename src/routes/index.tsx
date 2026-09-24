import { createFileRoute } from "@tanstack/react-router";
import { WaterPlatform } from "@/components/WaterPlatform";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "供水态势总览 — 澜川智慧水务" },
    { name: "description", content: "实时掌握城市供水、管网压力、水质与告警态势。" },
    { property: "og:title", content: "供水态势总览 — 澜川智慧水务" },
    { property: "og:description", content: "实时掌握城市供水、管网压力、水质与告警态势。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <WaterPlatform page="overview" />;
}
