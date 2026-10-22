"use client";

import {
  type LucideIcon,
  BookOpenCheck,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ChartNoAxesColumn,
  GraduationCap,
  MessageSquareText,
  ListTodo,
  Building2,
  FileText,
  Globe,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Library,
  Menu,
  Route,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/workspace/auth-gate";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; short: string; icon: LucideIcon; tab?: boolean };

// Grouped in the order the job hunt flows: plan the day, find and apply, reach out, interview,
// get better, then reusable assets.
const groups: { name: string; links: NavLink[] }[] = [
  {
    name: "Today",
    links: [
      { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard, tab: true },
      { href: "/schedule", label: "Schedule", short: "Schedule", icon: CalendarClock },
      { href: "/todo", label: "TODO", short: "TODO", icon: ListTodo },
    ],
  },
  {
    name: "Find & apply",
    links: [
      { href: "/roles", label: "Roles", short: "Roles", icon: ListChecks },
      { href: "/applications", label: "Applications", short: "Jobs", icon: Briefcase, tab: true },
      { href: "/companies", label: "Companies", short: "Companies", icon: Building2 },
      { href: "/resume", label: "Tailor resume", short: "Tailor", icon: FileText },
    ],
  },
  {
    name: "Reach out",
    links: [{ href: "/outreach", label: "Outreach", short: "Outreach", icon: MessageSquareText, tab: true }],
  },
  {
    name: "Interview",
    links: [
      { href: "/interviews", label: "Interviews", short: "Interviews", icon: CalendarCheck },
      { href: "/results", label: "Results", short: "Results", icon: ChartNoAxesColumn },
    ],
  },
  {
    name: "Prepare",
    links: [
      { href: "/learn", label: "Learn", short: "Learn", icon: GraduationCap, tab: true },
      { href: "/path", label: "Learning path", short: "Path", icon: Route },
      { href: "/skills", label: "Skills", short: "Skills", icon: BookOpenCheck },
      { href: "/improvements", label: "Improvements", short: "Improve", icon: TrendingUp },
    ],
  },
  {
    name: "Assets",
    links: [
      { href: "/library", label: "Library", short: "Library", icon: Library },
      { href: "/", label: "Public resume", short: "Resume", icon: Globe },
    ],
  },
];

const links = groups.flatMap((group) => group.links);

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function WorkspaceSidebar() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Workspace"
      className="sticky top-0 hidden h-dvh flex-col gap-0 overflow-y-auto border-r bg-background p-4 md:flex print:hidden"
    >
      <p className="px-3 pb-2 text-sm font-semibold tracking-tight">Job hunt</p>
      {groups.map((group) => (
        <div className="grid gap-0.5 pb-2" key={group.name}>
          <p className="px-3 pb-0.5 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            {group.name}
          </p>
          {group.links.map(({ href, label, icon: Icon }) => (
            <Link
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(href) && "bg-muted font-medium text-foreground",
              )}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      ))}
      <SignOutButton className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
    </nav>
  );
}

export function WorkspaceTabBar() {
  const isActive = useIsActive();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = links.some((link) => !link.tab && isActive(link.href));
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
              <div className="grid max-h-[65dvh] gap-3 overflow-y-auto px-4 pb-2">
                {groups.map((group) => {
                  const rest = group.links.filter((link) => !link.tab);
                  if (rest.length === 0) return null;
                  return (
                    <section key={group.name}>
                      <h3 className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {group.name}
                      </h3>
                      <ul className="grid gap-0.5">
                        {rest.map(({ href, label, icon: Icon }) => (
                          <li key={href}>
                            <Link
                              aria-current={isActive(href) ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base hover:bg-muted",
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
                    </section>
                  );
                })}
                <SignOutButton className="w-full rounded-lg px-3 py-3 text-left text-base text-muted-foreground hover:bg-muted" />
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
