"use client";

import { Check, Loader2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { ResumeContactCard } from "@/components/workspace/resume-contact-card";
import { useChangePassword } from "@/hooks/use-change-password";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { useUpdateUsername } from "@/hooks/use-update-username";
import { type UsernameStatus, useUsernameAvailability } from "@/hooks/use-username-availability";
import { USERNAME_HINT, USERNAME_MAX, normalizeUsername } from "@/lib/username";

export default function SettingsPage() {
  const session = useSession();
  const user = session?.user;

  return (
    <PageBody>
      <PageHeader title="Settings" description="Your account." />
      {user ? (
        <>
          <AccountForm email={user.email ?? ""} userId={user.id} />
          <ResumeContactCard userId={user.id} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Auth is not configured, so there is no account to show.</p>
      )}
    </PageBody>
  );
}

type Message = { ok: boolean; text: string };

function AccountForm({ email, userId }: Readonly<{ email: string; userId: string }>) {
  const { profile, error: loadError, reload } = useProfile(userId);
  const updateUsername = useUpdateUsername();
  const changePassword = useChangePassword();

  const [draft, setDraft] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);

  const current = profile?.username ?? "";
  const username = draft ?? current;
  const status = useUsernameAvailability(username, current);

  const usernameChanged = username !== current;
  const wantsNewPassword = newPassword.length > 0;
  const usernameOk = !usernameChanged || status === "available";
  const canSave = Boolean(profile) && (usernameChanged || wantsNewPassword) && usernameOk && !busy;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const results: Message[] = [];

    if (wantsNewPassword && newPassword !== String(data.get("confirm"))) {
      setMessages([{ ok: false, text: "The new passwords do not match." }]);
      return;
    }

    setBusy(true);
    try {
      await save(form, data, results);
    } catch {
      results.push({ ok: false, text: "Could not reach the server. Try again." });
    } finally {
      setBusy(false);
      setMessages(results);
    }
  }

  async function save(form: HTMLFormElement, data: FormData, results: Message[]) {
    if (usernameChanged) {
      const result = await updateUsername(userId, username);
      results.push(result.ok ? { ok: true, text: "Username updated." } : { ok: false, text: result.error });
      if (result.ok) {
        setDraft(null);
        reload();
      }
    }
    if (wantsNewPassword) {
      const result = await changePassword(email, String(data.get("current")), newPassword);
      results.push(result.ok ? { ok: true, text: "Password updated." } : { ok: false, text: result.error });
      if (result.ok) {
        form.reset();
        setNewPassword("");
      }
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your username is the public path of your resume.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input disabled id="email" value={email} readOnly />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                autoCapitalize="none"
                autoComplete="username"
                className="pr-9"
                disabled={profile === undefined || profile === null}
                id="username"
                maxLength={USERNAME_MAX}
                onChange={(event) => setDraft(normalizeUsername(event.target.value))}
                spellCheck={false}
                value={profile === undefined ? "Loading..." : profile === null ? "No profile yet" : username}
              />
              <UsernameIndicator status={status} />
            </div>
            <p className="text-xs text-muted-foreground" role="status">
              {loadError ?? usernameHint(status)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              autoComplete="new-password"
              id="new-password"
              minLength={6}
              name="password"
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Leave blank to keep your current password"
              type="password"
              value={newPassword}
            />
          </div>

          {wantsNewPassword ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input autoComplete="new-password" id="confirm" minLength={6} name="confirm" required type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input autoComplete="current-password" id="current" name="current" required type="password" />
                <p className="text-xs text-muted-foreground">Enter your current password to confirm the change.</p>
              </div>
            </>
          ) : null}

          {messages.map((message) => (
            <p
              className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}
              key={message.text}
              role="status"
            >
              {message.text}
            </p>
          ))}

          <Button className="justify-self-start" disabled={!canSave} type="submit">
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function usernameHint(status: UsernameStatus) {
  switch (status) {
    case "invalid":
      return USERNAME_HINT;
    case "taken":
      return "That username is not available.";
    case "error":
      return "Could not check the username. Try again.";
    default:
      return USERNAME_HINT;
  }
}

function UsernameIndicator({ status }: Readonly<{ status: UsernameStatus }>) {
  const common = "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2";
  switch (status) {
    case "checking":
      return <Loader2 aria-label="Checking" className={`${common} animate-spin text-muted-foreground`} />;
    case "available":
      return <Check aria-label="Available" className={`${common} text-green-600`} />;
    case "taken":
    case "invalid":
    case "error":
      return <X aria-label="Not available" className={`${common} text-destructive`} />;
    default:
      return null;
  }
}
