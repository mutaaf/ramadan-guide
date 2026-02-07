import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ramadan-guide.vercel.app";

  const routes = [
    "",
    "/learn",
    "/learn/islam",
    "/learn/ramadan",
    "/learn/laylatul-qadr",
    "/learn/prophet",
    "/learn/pronunciation",
    "/prepare",
    "/prepare/checklist",
    "/prepare/transition",
    "/prepare/communication",
    "/prepare/duaa",
    "/tracker",
    "/tracker/journal",
    "/tracker/hydration",
    "/tracker/nutrition",
    "/tracker/schedule",
    "/tracker/quran",
    "/tracker/tasbeeh",
    "/dashboard",
    "/ask",
    "/more",
    "/more/wellness",
    "/more/community",
    "/more/not-fasting",
    "/more/post-ramadan",
    "/more/about",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
