"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type Todo } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TodoPage() {
  const { data, error, mutate } = useResource<Todo[]>("todos");
  const [title, setTitle] = useState("");
  const todos = data ?? [];
  const open = todos.filter((todo) => !todo.done);
  const done = todos.filter((todo) => todo.done);

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    void mutate("todos", "POST", { title: title.trim() });
    setTitle("");
  }

  const row = (todo: Todo) => (
    <li className="flex items-start gap-3 px-4 py-3" key={todo.id}>
      <input
        aria-label={todo.done ? `Mark ${todo.title} as not done` : `Mark ${todo.title} as done`}
        checked={todo.done}
        className="mt-0.5 size-5 shrink-0 accent-primary"
        onChange={() => void mutate(`todos/${todo.id}`, "PATCH", { done: !todo.done })}
        type="checkbox"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium", todo.done && "text-muted-foreground line-through")}>{todo.title}</p>
        {todo.notes ? <p className="text-sm text-muted-foreground">{todo.notes}</p> : null}
      </div>
      <Button
        aria-label={`Delete ${todo.title}`}
        onClick={() => void mutate(`todos/${todo.id}`, "DELETE")}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  );

  return (
    <PageBody>
      <PageHeader title="TODO" description="What to build or do next for the job hunt." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form className="flex gap-2" onSubmit={add}>
        <Input
          aria-label="New TODO"
          className="bg-background"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a TODO"
          value={title}
        />
        <Button type="submit">
          <Plus aria-hidden="true" />
          Add
        </Button>
      </form>

      <Card className="py-0">
        <CardContent className="px-0">
          {data && open.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">All done.</p>
          ) : null}
          <ul className="divide-y">{open.map(row)}</ul>
        </CardContent>
      </Card>

      {done.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Done ({done.length})</h2>
          <Card className="py-0">
            <CardContent className="px-0">
              <ul className="divide-y">{done.map(row)}</ul>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </PageBody>
  );
}
