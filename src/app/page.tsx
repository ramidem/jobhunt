import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { ResumePdfDownload } from "@/components/resume-pdf-download";
import { DatedSection } from "@/components/resume-section";
import { StructuredData } from "@/components/structured-data";
import { resume } from "@/data/resume";

export default function Home() {
  return (
    <main className="page-shell">
      <StructuredData resume={resume} />
      <section className="resume-paper" aria-label="Resume">
        <header className="resume-header">
          <div>
            <p className="kicker">Public resume</p>
            <h1>{resume.name}</h1>
            <p className="headline">{resume.headline}</p>
          </div>
          <div className="header-actions no-print">
            <ResumePdfDownload resume={resume} />
            <a className="icon-button" href="/api/resume">
              JSON
            </a>
          </div>
        </header>

        <address className="contact-line">
          <span>
            <MapPin aria-hidden="true" size={15} />
            {resume.location}
          </span>
          <a href={`mailto:${resume.email}`}>
            <Mail aria-hidden="true" size={15} />
            {resume.email}
          </a>
          {resume.phone ? <span>{resume.phone}</span> : null}
          {resume.links.map((link) => (
            <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.label}
            </a>
          ))}
        </address>

        <section className="resume-section summary" aria-labelledby="summary">
          <h2 id="summary">Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section className="resume-section" aria-labelledby="education">
          <h2 id="education">Education</h2>
          <div className="entry-list">
            {resume.education.map((item) => (
              <article className="entry" key={`${item.institution}-${item.degree}`}>
                <div className="entry-header">
                  <div>
                    <h3>{item.institution}</h3>
                    <p>
                      {item.degree}
                      {item.location ? <span> · {item.location}</span> : null}
                    </p>
                  </div>
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

      <aside className="side-panel no-print" aria-label="Contact Med">
        <div className="panel-block status-block">
          <span className="status-mark" aria-hidden="true" />
          <div>
            <h2>Open to useful work</h2>
            <p>Messages route through the site API and into Firebase when configured.</p>
          </div>
        </div>
        <div className="panel-block">
          <h2>Message</h2>
          <ContactForm />
        </div>
      </aside>
    </main>
  );
}
