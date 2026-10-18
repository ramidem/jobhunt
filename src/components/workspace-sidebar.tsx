"use client";

import { BookOpenCheck, Briefcase, FileText, Home, ListChecks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Public resume", icon: Home },
  { href: "/resume", label: "Tailor resume", icon: FileText },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/qualifications", label: "Qualifications", icon: ListChecks },
  { href: "/skills", label: "Skills", icon: BookOpenCheck },
];

export function WorkspaceSidebar() {
  const pathname = usePathname();

  return (
    <nav className="workspace-sidebar no-print" aria-label="Workspace">
      <p className="workspace-brand">Job hunt</p>
      <ul>
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              aria-current={(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "page" : undefined}
              href={href}
            >
              <Icon aria-hidden="true" size={16} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
