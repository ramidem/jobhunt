"use client";

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume-schema";

const styles = StyleSheet.create({
  page: {
    padding: 46,
    color: "#101417",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  header: {
    borderBottom: "1 solid #101417",
    marginBottom: 18,
    paddingBottom: 8,
    textAlign: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0,
  },
  contact: {
    justifyContent: "center",
    marginTop: 9,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    color: "#2f3a40",
  },
  section: {
    marginTop: 13,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 7,
    textAlign: "center",
  },
  row: {
    marginBottom: 7,
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
    width: 9,
  },
  bulletText: {
    flex: 1,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillLabel: {
    width: 78,
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

export function ResumePdfDocument({ resume }: { resume: Resume }) {
  return (
    <Document title={`${resume.name} Resume`} author={resume.name}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <View style={styles.contact}>
            <Text>{resume.location}</Text>
            <Text>•</Text>
            <Link src={`mailto:${resume.email}`}>{resume.email}</Link>
            {resume.phone ? (
              <>
                <Text>•</Text>
                <Text>{resume.phone}</Text>
              </>
            ) : null}
            {resume.links.map((link) => (
              <Link key={link.href} src={link.href}>
                • {link.label}
              </Link>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education.map((item) => (
            <View key={`${item.institution}-${item.degree}`} style={styles.row}>
              <View style={styles.roleLine}>
                <Text style={styles.bold}>{item.institution}</Text>
                <Text style={styles.muted}>{item.dates}</Text>
              </View>
              <Text>{item.degree}</Text>
              {item.details.map((detail) => (
                <Bullet key={detail}>{detail}</Bullet>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience.map((item) => (
            <View key={`${item.organization}-${item.role}`} style={styles.row}>
              <View style={styles.roleLine}>
                <Text>
                  <Text style={styles.bold}>{item.organization}</Text>
                  <Text> — {item.role}</Text>
                </Text>
                <Text style={styles.muted}>
                  {item.start} - {item.end}
                </Text>
              </View>
              {item.bullets.map((bullet) => (
                <Bullet key={bullet}>{bullet}</Bullet>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {resume.projects.map((item) => (
            <View key={`${item.organization}-${item.role}`} style={styles.row}>
              <View style={styles.roleLine}>
                <Text>
                  <Text style={styles.bold}>{item.organization}</Text>
                  <Text> — {item.role}</Text>
                </Text>
                <Text style={styles.muted}>
                  {item.start} - {item.end}
                </Text>
              </View>
              {item.bullets.map((bullet) => (
                <Bullet key={bullet}>{bullet}</Bullet>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Interests</Text>
          {resume.skills.map((skill) => (
            <View key={skill.label} style={styles.skillRow}>
              <Text style={styles.skillLabel}>{skill.label}</Text>
              <Text style={styles.skillItems}>{skill.items.join(", ")}</Text>
            </View>
          ))}
          {resume.interests.length > 0 ? (
            <View style={styles.skillRow}>
              <Text style={styles.skillLabel}>Interests</Text>
              <Text style={styles.skillItems}>{resume.interests.join(", ")}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
