import { ExternalLink } from "lucide-react";
import type { Resume } from "@/lib/resume-schema";

type DatedItem = Resume["experience"][number];

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
            <div className="entry-header">
              <div>
                <h3>{item.organization}</h3>
                <p>
                  {item.role}
                  {item.location ? <span> · {item.location}</span> : null}
                </p>
              </div>
              <time>
                {item.start} - {item.end}
              </time>
            </div>
            {item.summary ? <p className="entry-summary">{item.summary}</p> : null}
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {item.links.length > 0 ? (
              <div className="entry-links">
                {item.links.map((link) => (
                  <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
                    {link.label}
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
