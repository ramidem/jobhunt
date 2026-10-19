import { QualificationsList } from "@/components/qualifications-list";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import data from "../../../../../data/qualifications.json";

type Job = { title: string; qualifications: string[]; last_updated_raw: string | null };

export default function QualificationsPage() {
  const jobs = (data.jobs as Job[]).map((job) => ({
    title: job.title.split("\n")[0].trim(),
    qualifications: job.qualifications,
    updated: job.last_updated_raw,
  }));

  return (
    <PageBody>
      <PageHeader title="Qualifications" description={`${data.note} Source: ${data.source}.`} />
      <QualificationsList jobs={jobs} />
    </PageBody>
  );
}
