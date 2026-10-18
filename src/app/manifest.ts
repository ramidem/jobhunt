import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Med Aduh · Job Hunt",
    short_name: "Job Hunt",
    description: "Resume and job-hunt workspace.",
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
