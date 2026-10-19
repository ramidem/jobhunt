"use client";

import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume-schema";

// Keep words whole so ATS keyword matching never sees "stake-/holders".
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 54,
    color: "#101417",
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.5,
  },
  header: {
    lineHeight: 1.15,
    marginBottom: 6,
    textAlign: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0,
  },
  contactItem: {
    flexDirection: "row",
    gap: 5,
  },
  contact: {
    justifyContent: "center",
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  link: {
    color: "#1a55c7",
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 5,
  },
  row: {
    marginBottom: 7,
  },
  nestedRow: {
    marginTop: 6,
  },
  italic: {
    fontFamily: "Helvetica-Oblique",
  },
  educationText: {
    flex: 1,
  },
  roleLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  muted: {
    color: "#4d585f",
  },
  bullet: {
    flexDirection: "row",
    marginTop: 2,
  },
  bulletMark: {
    width: 14,
    marginLeft: 10,
  },
  bulletText: {
    flex: 1,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillLabel: {
    width: 96,
    fontFamily: "Helvetica-Bold",
  },
  skillItems: {
    flex: 1,
  },
});

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function formatDates(start: string, end: string) {
  return start === end ? start : `${start} to ${end}`;
}

type ExperienceItem = Resume["experience"][number];

function ExperienceBlock({ item, nested = false }: { item: ExperienceItem; nested?: boolean }) {
  return (
    <View style={nested ? styles.nestedRow : styles.row}>
      <View style={styles.roleLine}>
        <Text style={styles.italic}>
          {item.role} at {item.organization}
          {item.location && !nested ? `, ${item.location}` : ""}
        </Text>
        <Text style={styles.italic}>{formatDates(item.start, item.end)}</Text>
      </View>
      {item.location && nested ? <Text style={styles.muted}>{item.location}</Text> : null}
      {item.summary ? <Text>{item.summary}</Text> : null}
      {item.bullets.map((bullet) => (
        <Bullet key={bullet}>{bullet}</Bullet>
      ))}
      {item.highlights.map((highlight) => (
        <ExperienceBlock
          item={{ ...highlight, highlights: [] }}
          key={`${highlight.organization}-${highlight.role}`}
          nested
        />
      ))}
    </View>
  );
}

export function ResumePdfDocument({ resume }: { resume: Resume }) {
  const contactItems: { text: string; href?: string }[] = [
    ...(resume.phone ? [{ text: resume.phone }] : []),
    { text: resume.email, href: `mailto:${resume.email}` },
    ...resume.links.map((link) => ({ text: link.label, href: link.href })),
  ];

  return (
    <Document title={`${resume.name} Resume`} author={resume.name}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <View style={styles.contact}>
            {contactItems.map((item, index) => (
              <View key={item.text} style={styles.contactItem}>
                {index > 0 ? <Text>|</Text> : null}
                {item.href ? (
                  <Link src={item.href} style={styles.link}>
                    {item.text}
                  </Link>
                ) : (
                  <Text>{item.text}</Text>
                )}
              </View>
            ))}
          </View>
          <Text>{resume.location}</Text>
        </View>

        {resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((item) => (
              <View key={`${item.institution}-${item.degree}`} style={styles.row}>
                <View style={styles.roleLine}>
                  <Text style={styles.educationText}>{item.degree}</Text>
                  {item.dates ? <Text>{item.dates}</Text> : null}
                </View>
                <Text>
                  {item.institution}
                  {item.location ? `, ${item.location}` : ""}
                </Text>
                {item.details.map((detail) => (
                  <Bullet key={detail}>{detail}</Bullet>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work History</Text>
            {resume.experience.map((item) => (
              <ExperienceBlock item={item} key={`${item.organization}-${item.role}`} />
            ))}
          </View>
        ) : null}

        {resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((item) => (
              <ExperienceBlock
                item={{ ...item, highlights: [] }}
                key={`${item.organization}-${item.role}`}
              />
            ))}
          </View>
        ) : null}

        {resume.skills.length > 0 ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {resume.skills.map((group) => (
              <View key={group.label} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{group.label}:</Text>
                <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
