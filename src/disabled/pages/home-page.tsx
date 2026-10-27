import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { ResumePdfDownload } from "@/components/resume-pdf-download";
import { ResumeDocument } from "@/components/resume-document";
import { StructuredData } from "@/components/structured-data";
import { resume } from "@/data/resume";

export default function Home() {
  return (
    <main className="page-shell">
      <StructuredData resume={resume} />
      <div className="resume-toolbar no-print flex-wrap" aria-label="Resume actions">
        <details className="toolbar-contact">
          <summary>
            <MessageSquare aria-hidden="true" size={18} />
            Message
          </summary>
          <div className="toolbar-contact-panel">
            <h2>Message Med</h2>
            {resume.email ? (
              <p>
                <Mail aria-hidden="true" size={14} />
                <a href={`mailto:${resume.email}`}>{resume.email}</a>
              </p>
            ) : null}
            <ContactForm />
          </div>
        </details>
        <ResumePdfDownload resume={resume} />
      </div>

      <ResumeDocument resume={resume} />
    </main>
  );
}
