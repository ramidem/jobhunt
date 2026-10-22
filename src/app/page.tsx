import type { Metadata } from "next";
import { AuthGate, SignOutButton } from "@/components/workspace/auth-gate";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <AuthGate>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-4">
        <p className="text-sm text-muted-foreground">You are signed in.</p>
        <SignOutButton className="rounded-lg border px-3 py-2 text-sm hover:bg-muted" />
      </main>
    </AuthGate>
  );
}
