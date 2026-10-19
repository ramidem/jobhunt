"use client";

import {
  BookOpenCheck,
  Briefcase,
  Building2,
  FileText,
  Globe,
  LayoutDashboard,
  ListChecks,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard, tab: true },
  { href: "/applications", label: "Applications", short: "Jobs", icon: Briefcase, tab: true },
  { href: "/companies", label: "Companies", short: "Companies", icon: Building2, tab: true },
  { href: "/skills", label: "Skills", short: "Skills", icon: BookOpenCheck, tab: true },
  { href: "/resume", label: "Tailor resume", short: "Tailor", icon: FileText, tab: false },
  { href: "/qualifications", label: "Qualifications", short: "Quals", icon: ListChecks, tab: false },
  { href: "/", label: "Public resume", short: "Resume", icon: Globe, tab: false },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const more = links.filter((link) => !link.tab);
  const moreActive = more.some((link) => isActive(link.href));
  const tabClass = (active: boolean) =>
    cn(
      "flex h-14 w-full flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground",
      active && "font-medium text-foreground",
    );

  return (
    <nav
      aria-label="Workspace"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
    >
      <ul className="grid grid-cols-5">
        {links
          .filter((link) => link.tab)
          .map(({ href, short, icon: Icon }) => (
            <li key={href}>
              <Link aria-current={isActive(href) ? "page" : undefined} className={tabClass(isActive(href))} href={href}>
                <Icon aria-hidden="true" className="size-5" />
                {short}
              </Link>
            </li>
          ))}
        <li>
          <Sheet onOpenChange={setMoreOpen} open={moreOpen}>
            <SheetTrigger asChild>
              <button className={tabClass(moreActive)} type="button">
                <Menu aria-hidden="true" className="size-5" />
                More
              </button>
            </SheetTrigger>
            <SheetContent className="rounded-t-xl pb-[calc(1rem+env(safe-area-inset-bottom))]" side="bottom">
              <SheetHeader>
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-1 px-4">
                {more.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      aria-current={isActive(href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base hover:bg-muted",
                        isActive(href) && "bg-muted font-medium",
                      )}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
