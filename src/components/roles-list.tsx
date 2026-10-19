"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type Roles } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RolesList() {
  const { data, error } = useResource<Roles>("roles");
  const [query, setQuery] = useState("");
  const roles = data?.roles ?? [];
  const needle = query.trim().toLowerCase();
  const visible = roles.filter(
    (role) =>
      !needle ||
      [role.title, ...role.degree, ...role.soft, ...role.skills.map((skill) => skill.name)].some((text) =>
        text.toLowerCase().includes(needle),
      ),
  );

  return (
    <PageBody>
      <PageHeader
        title="Roles"
        description={data ? `${data.note} Source: ${data.source}.` : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-1 gap-2">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search roles or skills"
            className="bg-background pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search, e.g. Python, Kubernetes, Data Engineer"
            type="search"
            value={query}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {visible.length} of {roles.length} roles · filled pills are skills you know, dashed ones are a bonus
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4">
        {visible.map((role) => (
          <li key={role.id}>
            <Card>
              <CardHeader>
                <CardTitle className="leading-snug">{role.title}</CardTitle>
                {role.updated ? <CardDescription>Updated {role.updated}</CardDescription> : null}
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-sm">
                {role.degree.length > 0 ? (
                  <p className="font-medium">{role.degree.join(" · ")}:</p>
                ) : null}
                {role.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {role.skills.map((skill) => (
                      <Badge
                        className={cn(
                          "h-auto max-w-full py-0.5 text-left whitespace-normal",
                          skill.optional && "border-dashed",
                        )}
                        key={skill.name}
                        title={[skill.known ? "On your skills list" : "", skill.optional ? "Bonus" : ""]
                          .filter(Boolean)
                          .join(" · ") || undefined}
                        variant={skill.known ? "default" : "outline"}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {role.soft.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {role.soft.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </PageBody>
  );
}
