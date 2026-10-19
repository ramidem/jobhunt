"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api, type NewLogEntry } from "@/lib/api";

const CHANNELS = ["LinkedIn", "Email", "Phone", "Application form", "Other"];
const NONE = "none";

// Local date (not UTC), so evening entries in Manila don't land on the wrong day.
export const today = () => new Date().toLocaleDateString("en-CA");

export function LogContactSheet({
  company,
  contacts,
  jobs,
  defaultContactId,
  defaultJobId,
  onSaved,
  children,
}: {
  company: { id: number; name: string };
  contacts: { id: number; name: string }[];
  jobs: { id: number; title: string }[];
  defaultContactId?: number | null;
  defaultJobId?: number | null;
  onSaved: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [contactId, setContactId] = useState(defaultContactId ? String(defaultContactId) : NONE);
  const [jobId, setJobId] = useState(defaultJobId ? String(defaultJobId) : NONE);
  const [channel, setChannel] = useState("LinkedIn");
  const [direction, setDirection] = useState<"out" | "in">("out");
  const [happenedOn, setHappenedOn] = useState(today());
  const [followUpOn, setFollowUpOn] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const body: NewLogEntry = {
      companyId: company.id,
      contactId: contactId === NONE ? undefined : Number(contactId),
      jobId: jobId === NONE ? undefined : Number(jobId),
      channel,
      direction,
      happenedOn,
      summary,
      followUpOn,
    };
    try {
      await api("contact-log", { method: "POST", body });
      setSummary("");
      setFollowUpOn("");
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>Log contact</SheetTitle>
            <SheetDescription>{company.name}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Direction</Label>
                <Select onValueChange={(value) => setDirection(value as "out" | "in")} value={direction}>
                  <SelectTrigger aria-label="Direction" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="out">I reached out</SelectItem>
                    <SelectItem value="in">They replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Channel</Label>
                <Select onValueChange={setChannel} value={channel}>
                  <SelectTrigger aria-label="Channel" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Contact</Label>
              <Select onValueChange={setContactId} value={contactId}>
                <SelectTrigger aria-label="Contact" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No specific person</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={String(contact.id)}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Job</Label>
              <Select onValueChange={setJobId} value={jobId}>
                <SelectTrigger aria-label="Job" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not about a specific job</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={String(job.id)}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  onChange={(event) => setHappenedOn(event.target.value)}
                  required
                  type="date"
                  value={happenedOn}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="log-follow-up">Follow up on</Label>
                <Input
                  id="log-follow-up"
                  onChange={(event) => setFollowUpOn(event.target.value)}
                  type="date"
                  value={followUpOn}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="log-summary">What happened</Label>
              <Textarea
                id="log-summary"
                onChange={(event) => setSummary(event.target.value)}
                placeholder="e.g. Sent connection request with a short note"
                rows={3}
                value={summary}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button disabled={saving} type="submit">
              {saving ? "Saving" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
