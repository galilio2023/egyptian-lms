import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elite-academy.edu.eg";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/student-login", "/student-register", "/portal/learn/*"],
        disallow: ["/admin/", "/portal/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
