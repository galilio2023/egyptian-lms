import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_UNITS } from "@/lib/db/mock-data";

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

  let publishedUnitSlugs: string[] = [];
  try {
    const dbUnits = await db
      .select({ slug: schema.courseUnit.slug })
      .from(schema.courseUnit)
      .where(eq(schema.courseUnit.isPublished, true));

    if (dbUnits.length > 0) {
      publishedUnitSlugs = dbUnits.map((u) => u.slug);
    }
  } catch {
    // Fallback if database is unavailable
  }

  if (publishedUnitSlugs.length === 0) {
    publishedUnitSlugs = INITIAL_UNITS.map((u) => u.slug);
  }

  // Unit preview pages
  const unitRoutes: MetadataRoute.Sitemap = publishedUnitSlugs.map((slug) => ({
    url: `${baseUrl}/portal/learn/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...unitRoutes];
}
