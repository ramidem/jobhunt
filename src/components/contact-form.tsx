"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { messageSchema } from "@/lib/resume-schema";
import { saveResumeMessage } from "@/lib/firebase";

type FormState = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      page: window.location.href,
    };

    const form = event.currentTarget;
    const parsed = messageSchema.safeParse(payload);
    const result = parsed.success
      ? await saveResumeMessage(parsed.data).catch(() => null)
      : null;

    if (!result) {
      setState("error");
      return;
    }

    form.reset();
    setState("sent");
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>
          Name
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        Organization
        <input name="organization" autoComplete="organization" />
      </label>
      <label>
        Subject
        <input name="subject" required minLength={3} />
      </label>
      <label>
        Message
        <textarea name="message" required minLength={20} rows={5} />
      </label>
      <button type="submit" className="icon-button primary" disabled={state === "sending"}>
        <Send aria-hidden="true" size={17} />
        {state === "sending" ? "Sending" : "Send message"}
      </button>
      {state === "sent" ? (
        <p className="form-note" role="status">
          Message received.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="form-note error" role="alert">
          Message could not be sent. Email works as a fallback.
        </p>
      ) : null}
    </form>
  );
}
