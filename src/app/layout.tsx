import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Med Aduh | Resume",
  description:
    "Public resume for Med Aduh, software engineer. Mobile-friendly, ATS-readable, and downloadable as PDF.",
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
