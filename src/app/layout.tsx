import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Med Aduh | Resume",
  description:
    "Public resume for Med Aduh, software engineer. Mobile-friendly, ATS-readable, and downloadable as PDF.",
  appleWebApp: {
    capable: true,
    title: "Job Hunt",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Med Aduh | Resume",
    description:
      "Public resume for Med Aduh, software engineer. Mobile-friendly, ATS-readable, and downloadable as PDF.",
    url: "/",
    siteName: "Med Aduh Resume",
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#11161a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
