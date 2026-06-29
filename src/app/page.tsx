import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { ResumePdfDownload } from "@/components/resume-pdf-download";
import { DatedSection } from "@/components/resume-section";
import { StructuredData } from "@/components/structured-data";
import { resume } from "@/data/resume";

export default function Home() {
  return (
    <main className="page-shell">
      <StructuredData resume={resume} />
      <div className="resume-toolbar no-print" aria-label="Resume actions">
        <ResumePdfDownload resume={resume} />
        <a className="icon-button" href="/api/resume">
          JSON
        </a>
      </div>

      <section className="resume-paper" aria-label="Resume">
        <header className="resume-header">
          <h1>{resume.name}</h1>
          <p className="contact-line">
            <span>{resume.location}</span>
            <span>{resume.email}</span>
            {resume.phone ? <span>{resume.phone}</span> : null}
            {resume.links.map((link) => (
              <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            ))}
          </p>
        </header>

        <section className="resume-section" aria-labelledby="education">
          <h2 id="education">Education</h2>
          <div className="entry-list">
            {resume.education.map((item) => (
              <article className="entry" key={`${item.institution}-${item.degree}`}>
                <div className="entry-line">
                  <h3>{item.institution}</h3>
                  {item.location ? <p>{item.location}</p> : null}
                </div>
                <div className="entry-line">
                  <p>{item.degree}</p>
                  <time>{item.dates}</time>
                </div>
                {item.details.length > 0 ? (
                  <ul>
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <DatedSection title="Experience" items={resume.experience} />
        <DatedSection title="Projects" items={resume.projects} />
        <DatedSection title="Leadership & Activities" items={resume.leadership} />

        <section className="resume-section skills" aria-labelledby="skills">
          <h2 id="skills">Skills & Interests</h2>
          <dl>
            {resume.skills.map((skill) => (
              <div key={skill.label}>
                <dt>{skill.label}</dt>
                <dd>{skill.items.join(", ")}</dd>
              </div>
            ))}
            {resume.interests.length > 0 ? (
              <div>
                <dt>Interests</dt>
                <dd>{resume.interests.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </section>

      <details className="floating-contact no-print">
        <summary>
          <MessageSquare aria-hidden="true" size={18} />
          Message
        </summary>
        <div className="floating-contact-panel">
          <h2>Message Med</h2>
          <p>
            <Mail aria-hidden="true" size={14} />
            <a href={`mailto:${resume.email}`}>{resume.email}</a>
          </p>
          <ContactForm />
        </div>
      </details>
    </main>
  );
}
