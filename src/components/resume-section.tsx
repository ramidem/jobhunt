import type { Resume } from "@/lib/resume-schema";

type DatedItem = Resume["experience"][number];

function formatDates(start: string, end: string) {
  return start === end ? start : `${start} - ${end}`;
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

  return (
    <section className="resume-section" aria-labelledby={title.toLowerCase()}>
      <h2 id={title.toLowerCase()}>{title}</h2>
      <div className="entry-list">
        {items.map((item) => (
          <article className="entry" key={`${item.organization}-${item.role}`}>
            <div className="entry-line entry-heading">
              <h3>{item.organization}</h3>
              {item.location ? <p>{item.location}</p> : null}
            </div>
            <div className="entry-line entry-meta">
              <p>{item.role}</p>
              <time>{formatDates(item.start, item.end)}</time>
            </div>
            {item.summary ? <p className="entry-summary">{item.summary}</p> : null}
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
