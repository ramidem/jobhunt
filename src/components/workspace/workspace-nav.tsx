"use client";

import { BookOpenCheck, Briefcase, FileText, Home, ListChecks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Public resume", short: "Resume", icon: Home },
  { href: "/resume", label: "Tailor resume", short: "Tailor", icon: FileText },
  { href: "/applications", label: "Applications", short: "Jobs", icon: Briefcase },
  { href: "/qualifications", label: "Qualifications", short: "Quals", icon: ListChecks },
  { href: "/skills", label: "Skills", short: "Skills", icon: BookOpenCheck },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function WorkspaceSidebar() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Workspace"
      className="sticky top-0 hidden h-dvh flex-col gap-1 border-r bg-background p-4 md:flex print:hidden"
    >
      <p className="px-3 pb-3 text-sm font-semibold tracking-tight">Job hunt</p>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            isActive(href) && "bg-muted font-medium text-foreground",
          )}
          href={href}
          key={href}
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function WorkspaceTabBar() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Workspace"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
    >
      <ul className="grid grid-cols-5">
        {links.map(({ href, short, icon: Icon }) => (
          <li key={href}>
            <Link
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground",
                isActive(href) && "font-medium text-foreground",
              )}
              href={href}
            >
              <Icon aria-hidden="true" className="size-5" />
              {short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
