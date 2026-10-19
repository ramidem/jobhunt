"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// One page per phase of the job hunt (see docs/job-hunt-playbook.md).
export const PHASES = [
  { href: "/applications", label: "Phase 1 · Intake" },
  { href: "/outreach", label: "Phase 2 · Go direct" },
  { href: "/interviews", label: "Phase 3 · Interviews & offers" },
  { href: "/results", label: "Phase 4 · Results" },
];

function PhaseSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const current = PHASES.find((phase) => pathname.startsWith(phase.href))?.href ?? PHASES[0].href;

  return (
    <Select onValueChange={(href) => router.push(`${href}/`)} value={current}>
      <SelectTrigger aria-label="Switch phase" className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {PHASES.map((phase) => (
          <SelectItem key={phase.href} value={phase.href}>
            {phase.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PageHeader({
  title,
  description,
  phase,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  // Shows the phase dropdown on the right.
  phase?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {phase ? (
        <div className="flex flex-col gap-2 sm:items-end">
          <PhaseSwitcher />
          {children}
        </div>
      ) : (
        children
      )}
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10 xl:px-12 print:hidden">
      {children}
    </div>
  );
}
