import { DatedSection } from "@/components/resume-section";
import type { Resume } from "@/lib/resume-schema";

export function ResumeDocument({ resume }: { resume: Resume }) {
  return (
    <section className="resume-paper" aria-label="Resume">
      <header className="resume-header">
        <h1>{resume.name}</h1>
        <p className="headline-line">{resume.headline}</p>
        <p className="contact-line">
          {resume.phone ? <span>{resume.phone}</span> : null}
          <a href={`mailto:${resume.email}`}>{resume.email}</a>
          {resume.links.map((link) => (
            <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.label}
            </a>
          ))}
        </p>
        <p className="location-line">{resume.location}</p>
      </header>

      {resume.education.length > 0 ? (
        <section className="resume-section" aria-labelledby="education">
          <h2 id="education">Education &amp; Certificates</h2>
          <ul className="education-list">
            {resume.education.map((item) => (
              <li key={`${item.institution}-${item.degree}`}>
                <span>
                  {item.degree}, {item.institution}
                  {item.location ? `, ${item.location}` : ""}
                </span>
                {item.dates ? <time>{item.dates}</time> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DatedSection title="Work History" items={resume.experience} />
      <DatedSection title="Projects" items={resume.projects} />
      <DatedSection title="Leadership & Activities" items={resume.leadership} />

      {resume.skills.length > 0 ? (
        <section className="resume-section" aria-labelledby="skills">
          <h2 id="skills">Skills</h2>
          <ul className="skills-list">
            {resume.skills.map((group) => (
              <li key={group.label}>
                <strong>{group.label}:</strong> {group.items.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
