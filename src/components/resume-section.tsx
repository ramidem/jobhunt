import type { Resume } from "@/lib/resume-schema";

type DatedItem = Resume["experience"][number];

function formatDates(start: string, end: string) {
  return start === end ? start : `${start} to ${end}`;
}

function WorkItem({ item, nested = false }: { item: DatedItem; nested?: boolean }) {
  return (
    <article className={nested ? "entry nested-entry" : "entry"}>
      <div className="entry-line entry-title">
        <p>
          {nested ? item.organization : `${item.role} at ${item.organization}`}
          {item.location && !nested ? `, ${item.location}` : ""}
        </p>
        <time>{formatDates(item.start, item.end)}</time>
      </div>
      {item.location && nested ? <p className="entry-stack">{item.location}</p> : null}
      {item.summary ? <p className="entry-summary">{item.summary}</p> : null}
      <ul>
        {item.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {item.highlights.length > 0 ? (
        <div className="nested-list">
          {item.highlights.map((highlight) => (
            <WorkItem
              item={{ ...highlight, highlights: [] }}
              key={`${highlight.organization}-${highlight.role}`}
              nested
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function DatedSection({
  title,
  items,
}: {
  title: string;
  items: DatedItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section className="resume-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <div className="entry-list">
        {items.map((item) => (
          <WorkItem item={item} key={`${item.organization}-${item.role}`} />
        ))}
      </div>
    </section>
  );
}
