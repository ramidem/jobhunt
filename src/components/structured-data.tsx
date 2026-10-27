import type { Resume } from "@/lib/resume-schema";

export function StructuredData({ resume }: Readonly<{ resume: Resume }>) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.name,
    jobTitle: resume.headline,
    ...(resume.email ? { email: `mailto:${resume.email}` } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: resume.location,
    },
    sameAs: resume.links.map((link) => link.href),
    knowsAbout: resume.skills.flatMap((skill) => skill.items),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
