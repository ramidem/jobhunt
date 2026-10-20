"use client";

import { BookOpen, Check, ExternalLink, Map as MapIcon, Mic, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import {
  api,
  useResource,
  type LearnCard,
  type LearnGuide,
  type LearnOverview,
  type StudyLinks,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<LearnCard["kind"], string> = {
  flashcard: "Flashcard",
  mcq: "Multiple choice",
  practice: "Practice question",
  soft: "Interview question",
};

const GRADES = [
  { grade: 0, label: "Again", hint: "Show it again this session" },
  { grade: 1, label: "Hard", hint: "Short interval" },
  { grade: 2, label: "Good", hint: "Normal interval" },
  { grade: 3, label: "Easy", hint: "Longer interval" },
] as const;

function Links({ links }: { links: StudyLinks }) {
  if (!links || (!links.roadmap && links.docs.length === 0)) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.roadmap ? (
        <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={links.roadmap} rel="noreferrer" target="_blank">
          <MapIcon aria-hidden="true" className="size-3.5" />
          roadmap.sh
        </a>
      ) : null}
      {links.docs.map((doc) => (
        <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={doc.url} key={doc.url} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" className="size-3.5" />
          {doc.label}
        </a>
      ))}
    </div>
  );
}

function ScriptBlock({ script }: { script: string }) {
  return (
    <div className="rounded-lg border-l-4 border-primary bg-muted/40 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
        <Mic aria-hidden="true" className="size-3.5" />
        Say it like this
      </p>
      <p className="text-base leading-relaxed whitespace-pre-wrap">{script}</p>
    </div>
  );
}

function FeedbackBlock({ feedback }: { feedback: string }) {
  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
        <Sparkles aria-hidden="true" className="size-3.5" />
        Feedback on your last answer
      </p>
      <p className="whitespace-pre-wrap">{feedback}</p>
    </div>
  );
}

function StudyCard({ card, onGrade }: { card: LearnCard; onGrade: (grade: number) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{card.topic}</Badge>
          <span>{KIND_LABEL[card.kind]}</span>
          {card.reps === 0 ? <Badge variant="outline">New</Badge> : null}
        </CardDescription>
        <CardTitle className="text-lg leading-snug whitespace-pre-wrap">{card.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        {card.kind === "mcq" ? (
          <div className="grid grid-cols-1 gap-2">
            {card.choices.map((choice, index) => {
              const isCorrect = index === card.correct;
              const state =
                picked === null ? "idle" : isCorrect ? "correct" : index === picked ? "wrong" : "idle";
              return (
                <button
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                    picked === null && "hover:bg-muted",
                    state === "correct" && "border-emerald-600 bg-emerald-50 dark:bg-emerald-950",
                    state === "wrong" && "border-destructive bg-destructive/10",
                  )}
                  disabled={picked !== null}
                  key={choice}
                  onClick={() => setPicked(index)}
                  type="button"
                >
                  <span className="font-medium text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1 whitespace-pre-wrap">{choice}</span>
                  {state === "correct" ? <Check aria-label="Correct" className="size-4 text-emerald-700" /> : null}
                  {state === "wrong" ? <X aria-label="Your answer" className="size-4 text-destructive" /> : null}
                </button>
              );
            })}
            {picked !== null ? (
              <>
                <p className="text-sm">
                  <span className="font-medium">{picked === card.correct ? "Correct. " : "Not quite. "}</span>
                  {card.explanation}
                </p>
                <Button onClick={() => onGrade(picked === card.correct ? 2 : 0)} type="button">
                  Next
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <>
            {card.kind !== "flashcard" && !revealed ? (
              <div className="grid gap-1.5">
                <Label htmlFor={`draft-${card.id}`}>
                  {card.kind === "soft" ? "Your answer (try STAR: situation, task, action, result)" : "Your answer (optional)"}
                </Label>
                <Textarea
                  className="min-h-28"
                  id={`draft-${card.id}`}
                  onChange={(event) => setDraft(event.target.value)}
                  value={draft}
                />
              </div>
            ) : null}
            {revealed ? (
              <div className="grid gap-3">
                {draft.trim() ? (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">You wrote</p>
                    <p className="whitespace-pre-wrap">{draft}</p>
                  </div>
                ) : null}
                {card.script ? <ScriptBlock script={card.script} /> : null}
                {card.feedback ? <FeedbackBlock feedback={card.feedback} /> : null}
                <div className="rounded-lg bg-muted/60 p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {card.kind === "flashcard" ? "Answer" : "What a strong answer covers"}
                  </p>
                  <p className="whitespace-pre-wrap">{card.answer}</p>
                </div>
                <p className="text-xs text-muted-foreground">How well did you know it?</p>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map(({ grade, label, hint }) => (
                    <Button
                      key={grade}
                      onClick={() => onGrade(grade)}
                      title={hint}
                      type="button"
                      variant={grade === 2 ? "default" : "outline"}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setRevealed(true);
                  if (draft.trim()) {
                    // Saved for the morning feedback pass; failures don't block studying.
                    void api("learn-answers", { method: "POST", body: { cardId: card.id, answer: draft.trim() } }).catch(
                      () => undefined,
                    );
                  }
                }}
                type="button"
              >
                Show answer
              </Button>
            )}
          </>
        )}
        <Links links={card.links} />
      </CardContent>
    </Card>
  );
}

function Session({ topic, onDone }: { topic: string | null; onDone: () => void }) {
  const [queue, setQueue] = useState<LearnCard[] | null>(null);
  const [done, setDone] = useState(0);
  const [again, setAgain] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<LearnCard[]>(`learn-deck?limit=15${topic ? `&topic=${encodeURIComponent(topic)}` : ""}`)
      .then(setQueue)
      .catch((reason: Error) => setError(reason.message));
  }, [topic]);

  async function grade(value: number) {
    if (!queue) return;
    const [card, ...rest] = queue;
    try {
      await api("learn-review", { method: "POST", body: { cardId: card.id, grade: value } });
    } catch (reason) {
      setError((reason as Error).message);
      return;
    }
    setDone((n) => n + 1);
    if (value === 0) {
      setAgain((n) => n + 1);
      setQueue([...rest, card]);
    } else {
      setQueue(rest);
    }
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!queue) return <p className="text-sm text-muted-foreground">Loading cards…</p>;
  if (queue.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{done === 0 ? "Nothing to study here yet" : "Session done"}</CardTitle>
          <CardDescription>
            {done === 0
              ? "No due or new cards for this topic. Add a card, or mark more skills as Learning."
              : `${done} reviews, ${again} to repeat. Cards come back on their next due date.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onDone} type="button">
            Back to topics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {topic ?? "All topics"} · {queue.length} left
        </span>
        <Button onClick={onDone} size="sm" type="button" variant="ghost">
          End session
        </Button>
      </div>
      <StudyCard card={queue[0]} key={`${queue[0].id}-${done}`} onGrade={(value) => void grade(value)} />
    </div>
  );
}

function AddCardSheet({ topics, onSaved }: { topics: string[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(topics[0] ?? "Behavioral");
  const [kind, setKind] = useState<LearnCard["kind"]>("flashcard");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api("learn-cards", {
        method: "POST",
        body:
          kind === "mcq"
            ? { topic, kind, prompt, choices, correct, explanation: answer }
            : { topic, kind, prompt, answer },
      });
      setPrompt("");
      setAnswer("");
      setChoices(["", "", "", ""]);
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus aria-hidden="true" />
          Add card
        </Button>
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>Add a study card</SheetTitle>
            <SheetDescription>It joins the spaced-repetition queue right away.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Topic</Label>
                <Select onValueChange={setTopic} value={topic}>
                  <SelectTrigger aria-label="Topic" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select onValueChange={(value) => setKind(value as LearnCard["kind"])} value={kind}>
                  <SelectTrigger aria-label="Card type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_LABEL) as LearnCard["kind"][]).map((value) => (
                      <SelectItem key={value} value={value}>
                        {KIND_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="card-prompt">Question</Label>
              <Textarea id="card-prompt" onChange={(event) => setPrompt(event.target.value)} required rows={2} value={prompt} />
            </div>
            {kind === "mcq" ? (
              <div className="grid gap-2">
                <Label>Choices (pick the correct one)</Label>
                {choices.map((choice, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <input
                      aria-label={`Choice ${index + 1} is correct`}
                      checked={correct === index}
                      className="size-4"
                      name="correct"
                      onChange={() => setCorrect(index)}
                      type="radio"
                    />
                    <Input
                      onChange={(event) =>
                        setChoices(choices.map((value, i) => (i === index ? event.target.value : value)))
                      }
                      placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                      value={choice}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor="card-answer">{kind === "mcq" ? "Explanation" : "Answer"}</Label>
              <Textarea id="card-answer" onChange={(event) => setAnswer(event.target.value)} rows={3} value={answer} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button type="submit">Save card</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Guides() {
  const { data, error } = useResource<LearnGuide[]>("learn-guides");
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return null;
  return (
    <div className="grid grid-cols-1 gap-4">
      <p className="text-sm text-muted-foreground">
        Short answers built from your own projects. Read them aloud a few times before an interview. [Brackets] are
        where you drop in a specific example.
      </p>
      <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {data.map((guide) => (
          <li key={guide.id}>
            <Card>
              <CardHeader>
                <CardDescription>
                  <Badge variant="secondary">{guide.topic}</Badge>
                </CardDescription>
                <CardTitle className="text-lg leading-snug">{guide.prompt}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <ScriptBlock script={guide.script} />
                {guide.feedback ? <FeedbackBlock feedback={guide.feedback} /> : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LearnPage() {
  const { data, error, reload } = useResource<LearnOverview>("learn");
  const [session, setSession] = useState<{ topic: string | null } | null>(null);

  function endSession() {
    setSession(null);
    reload();
  }

  const stats = data?.stats;

  return (
    <PageBody>
      <PageHeader
        title="Learn"
        description="Spaced repetition on your I know and Learning skills, plus interview practice."
      >
        {!session && data ? (
          <div className="flex flex-wrap gap-2">
            <AddCardSheet onSaved={reload} topics={data.topics.map((topic) => topic.name)} />
            <Button onClick={() => setSession({ topic: null })}>
              <BookOpen aria-hidden="true" />
              Study now
            </Button>
          </div>
        ) : null}
      </PageHeader>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data?.digest && !session ? (
        <Card className="border-primary/40">
          <CardContent className="flex items-start gap-3 text-sm">
            <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-medium">This morning: </span>
              {data.digest.text}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {session ? (
        <Session onDone={endSession} topic={session.topic} />
      ) : stats ? (
        <Tabs defaultValue="study">
          <TabsList className="grid w-full grid-cols-2 sm:w-80">
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="guides">Read-aloud guides</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4 grid grid-cols-1 gap-6" value="guides">
            <Guides />
          </TabsContent>
          <TabsContent className="mt-4 grid grid-cols-1 gap-6" value="study">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Due now", stats.due],
              ["New cards", stats.fresh],
              ["Reviewed today", stats.reviewedToday],
              ["Day streak", stats.streak],
            ].map(([label, value]) => (
              <div className="rounded-xl border bg-card p-4" key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.topics.map((topic) => (
              <li key={topic.name}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {topic.name}
                      <Badge variant={topic.status === "learning" ? "default" : "outline"}>
                        {topic.status === "know" ? "I know" : topic.status === "learning" ? "Learning" : "Interview"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {topic.cards === 0
                        ? "No cards yet. Add one, or study from the links."
                        : `${topic.cards} cards · ${topic.due} due · ${topic.fresh} new`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-3">
                    <Links links={topic.links} />
                    <Button
                      className="justify-self-start"
                      disabled={topic.due + topic.fresh === 0}
                      onClick={() => setSession({ topic: topic.name })}
                      size="sm"
                      variant="outline"
                    >
                      <RotateCcw aria-hidden="true" />
                      Study {topic.name}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          </TabsContent>
        </Tabs>
      ) : null}
    </PageBody>
  );
}
