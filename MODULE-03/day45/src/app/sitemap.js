import { DISHES, CATEGORIES } from "@/data/dishes";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const lastModified = new Date();

  const staticRoutes = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/menu", changeFrequency: "daily", priority: 0.9 },
  ];

  const categoryRoutes = CATEGORIES.filter(
    (category) => category.key !== "all"
  ).map((category) => ({
    path: `/menu/${category.key}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const dishRoutes = DISHES.map((dish) => ({
    path: `/menu/${dish.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...dishRoutes].map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
