import { MetadataRoute } from "next";
import { INITIAL_GRADES, INITIAL_UNITS } from "@/lib/db/mock-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elite-academy.edu.eg";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/student-login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/student-register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Unit preview pages
  const unitRoutes: MetadataRoute.Sitemap = INITIAL_UNITS.map((unit) => ({
    url: `${baseUrl}/portal/learn/${unit.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...unitRoutes];
}
