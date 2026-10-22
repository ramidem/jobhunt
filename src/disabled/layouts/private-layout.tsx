import type { Metadata } from "next";
import { AuthGate } from "@/components/workspace/auth-gate";

export const metadata: Metadata = {
  title: "Job hunt workspace",
  robots: { index: false, follow: false },
};

export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthGate>{children}</AuthGate>;
}
