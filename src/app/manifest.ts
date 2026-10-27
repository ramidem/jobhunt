import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medimar Aduh · Job Hunt",
    short_name: "Job Hunt",
    description: "Resume and job-hunt workspace.",
    // Home Screen opens this URL as-is. `/` is out/index.html (200).
    // `/dashboard/` is not exported, and `/index.html` is a 404.
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f2f2f2",
    theme_color: "#11161a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
