"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeContact } from "@/hooks/use-resume-contact";

export function ResumeContactCard({ userId }: Readonly<{ userId: string }>) {
  const { contact, error } = useResumeContact(userId);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Resume contact</CardTitle>
        <CardDescription>Only this signed-in account can read these details.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : contact === undefined ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading contact details.
          </p>
        ) : contact === null ? (
          <p className="text-sm text-muted-foreground" role="status">
            No resume contact is stored for this account yet.
          </p>
        ) : (
          <dl className="grid gap-3 text-sm">
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{contact.email ?? "Not set"}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{contact.phone ?? "Not set"}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
