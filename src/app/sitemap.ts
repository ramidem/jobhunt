import type { MetadataRoute } from "next";
import { resume } from "@/data/resume";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: resume.updatedAt,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/api/resume`,
      lastModified: resume.updatedAt,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
