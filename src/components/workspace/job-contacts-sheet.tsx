"use client";

import { Mail, Phone, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api, type Contact } from "@/lib/api";

type JobContact = Contact & { role: string };

const EMPTY = { name: "", title: "", linkedinUrl: "", email: "", phone: "" };

// Manage who is hiring for one job: attach company contacts, remove them, or add a new person.
export function JobContactsSheet({
  job,
  company,
  attached,
  companyContacts,
  onChanged,
  children,
}: {
  job: { id: number; title: string; code: string };
  company: { id: number; name: string };
  attached: JobContact[];
  companyContacts: Contact[];
  onChanged: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const attachedIds = new Set(attached.map((contact) => contact.id));
  const available = companyContacts.filter((contact) => !attachedIds.has(contact.id));

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      setError(null);
      onChanged();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const field = (key: keyof typeof EMPTY, label: string, type = "text") => (
    <div className="grid gap-1.5">
      <Label htmlFor={`jc-${job.id}-${key}`}>{label}</Label>
      <Input
        id={`jc-${job.id}-${key}`}
        onChange={(event) => setFields({ ...fields, [key]: event.target.value })}
        required={key === "name"}
        type={type}
        value={fields[key]}
      />
    </div>
  );

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline">
            <Users aria-hidden="true" />
            Contacts
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <SheetHeader>
          <SheetTitle>
            Who is hiring? <span className="font-mono text-sm text-muted-foreground">{job.code}</span>
          </SheetTitle>
          <SheetDescription>
            {job.title} · {company.name}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-4">
          <section className="grid gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">On this job</h3>
            {attached.length === 0 ? <p className="text-sm text-muted-foreground">No one assigned yet.</p> : null}
            <ul className="grid gap-2">
              {attached.map((contact) => (
                <li className="flex items-start gap-2 rounded-lg border p-3 text-sm" key={contact.id}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {contact.linkedinUrl ? (
                        <a className="hover:underline" href={contact.linkedinUrl} rel="noreferrer" target="_blank">
                          {contact.name}
                        </a>
                      ) : (
                        contact.name
                      )}
                    </p>
                    {contact.title ? <p className="line-clamp-2 text-muted-foreground">{contact.title}</p> : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 text-muted-foreground">
                      {contact.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail aria-hidden="true" className="size-3.5" />
                          {contact.email}
                        </span>
                      ) : null}
                      {contact.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone aria-hidden="true" className="size-3.5" />
                          {contact.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    aria-label={`Remove ${contact.name} from this job`}
                    onClick={() =>
                      void run(() =>
                        api("job-contacts", { method: "DELETE", body: { jobId: job.id, contactId: contact.id } }),
                      )
                    }
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          {available.length > 0 ? (
            <section className="grid gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Other people at {company.name}
              </h3>
              <ul className="grid gap-1">
                {available.map((contact) => (
                  <li className="flex items-center justify-between gap-2 text-sm" key={contact.id}>
                    <span className="min-w-0 truncate">
                      {contact.name}
                      {contact.title ? <span className="text-muted-foreground"> · {contact.title.split("|")[0].trim()}</span> : null}
                    </span>
                    <Button
                      onClick={() =>
                        void run(() =>
                          api("job-contacts", { method: "POST", body: { jobId: job.id, contactId: contact.id } }),
                        )
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Assign
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                await api("contacts", { method: "POST", body: { companyId: company.id, jobId: job.id, ...fields } });
                setFields(EMPTY);
              });
            }}
          >
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Add a person</h3>
            {field("name", "Name")}
            {field("title", "Title")}
            {field("linkedinUrl", "LinkedIn URL", "url")}
            <div className="grid grid-cols-2 gap-3">
              {field("email", "Email", "email")}
              {field("phone", "Phone", "tel")}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit">
              <UserPlus aria-hidden="true" />
              Add and assign to this job
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
