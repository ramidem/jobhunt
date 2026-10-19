"use client";

import { Check, Copy, Download, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type LibraryItem } from "@/lib/api";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button onClick={() => void copy()} size="sm" type="button" variant="outline">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function LibraryPage() {
  const { data, error, mutate } = useResource<LibraryItem[]>("library");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const items = data ?? [];
  const texts = items.filter((item) => item.kind === "text");
  const files = items.filter((item) => item.kind === "file");

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataBase64 = await readBase64(file);
    await mutate("library", "POST", { kind: "file", title: file.name.replace(/\.[^.]+$/, ""), fileName: file.name, mime: file.type, dataBase64 });
  }

  return (
    <PageBody>
      <PageHeader title="Library" description="Ready-made texts to copy and files to download, such as answers, cover emails and resumes." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Texts ({texts.length})</h2>
        {texts.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <div className="flex gap-1">
                <CopyButton value={item.body} />
                <Button
                  aria-label={`Delete ${item.title}`}
                  onClick={() => void mutate(`library/${item.id}`, "DELETE")}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{item.body}</p>
            </CardContent>
          </Card>
        ))}
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !body.trim()) return;
            void mutate("library", "POST", { kind: "text", title: title.trim(), body });
            setTitle("");
            setBody("");
          }}
        >
          <Input aria-label="Title" onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Why this role (Acme)" value={title} />
          <Textarea aria-label="Text" onChange={(e) => setBody(e.target.value)} placeholder="Text to save" rows={4} value={body} />
          <Button className="justify-self-start" type="submit">
            <Plus aria-hidden="true" />
            Add text
          </Button>
        </form>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Files ({files.length})</h2>
        <Card className="py-0">
          <CardContent className="px-0">
            <ul className="divide-y">
              {files.map((item) => (
                <li className="flex items-center gap-3 px-4 py-3" key={item.id}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.fileName} · {formatSize(item.size)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/api/library-file/${item.id}`} rel="noreferrer" target="_blank">
                      <Download aria-hidden="true" />
                      Open
                    </a>
                  </Button>
                  <Button
                    aria-label={`Delete ${item.title}`}
                    onClick={() => void mutate(`library/${item.id}`, "DELETE")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            {data && files.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No files yet.</p> : null}
          </CardContent>
        </Card>
        <input className="hidden" onChange={(e) => void upload(e)} ref={fileInput} type="file" />
        <Button className="justify-self-start" onClick={() => fileInput.current?.click()} type="button" variant="outline">
          <Upload aria-hidden="true" />
          Upload file
        </Button>
      </section>
    </PageBody>
  );
}
