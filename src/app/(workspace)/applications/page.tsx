import type { Metadata } from "next";
import { JobPostsPanel } from "@/components/workspace/job-posts-panel";
import { PageBody, PageHeader } from "@/components/workspace/page-header";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

export default function ApplicationsPage() {
  return (
    <PageBody>
      <PageHeader description="Save a posting link and the description." title="Applications" />
      <JobPostsPanel />
    </PageBody>
  );
}
