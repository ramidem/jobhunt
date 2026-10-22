import type { Metadata } from "next";
import { Redirect } from "@/components/redirect";
import { AuthGate } from "@/components/workspace/auth-gate";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <AuthGate>
      <Redirect to="/settings" />
    </AuthGate>
  );
}
