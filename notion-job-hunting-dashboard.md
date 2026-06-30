# Notion Job Hunting Dashboard

## Context

This is a private Notion dashboard used for job tracking. Do not publish Notion page links, private database URLs, or workspace metadata in the public resume site.

Dashboard title to search for in the Notion connector:

- `Job Hunting Dashboard`

## Last Cleanup

Date: 2026-06-30

The dashboard template entries were removed from the active database views. The dashboard shell, buttons, databases, guide, and schema were left intact.

Cleared template rows:

- Companies Applied: `Company A`, `Company B`, `Company C`, `Company D`
- Job Applications: `Project Officer`, `Administrative Officer`, `Research Assistant`, `Monitoring and Evaluation Officer`
- Documents: `Generic Resume`, `Cover Letter for Research Assistant`, `Cover Letter for M&E Officer`, `Resume for Research Position`

## Implementation Note

The Notion SQL-style data source query tool was blocked by the current Notion plan. The cleanup was done through page search plus moving the sample database pages out of their data sources into private workspace-level pages. This detached them from the dashboard databases without deleting the database structure.

## Verification

Scoped searches inside these dashboard data sources returned no template rows after cleanup:

- Companies Applied
- Job Applications
- Documents

The Scheduled Interviews area is a filtered view of Job Applications, so clearing the sample application rows also cleared the sample interview view.

## Future Use

When adding real job-search records, use the existing dashboard databases rather than creating a new tracker. If template examples reappear, search within the relevant dashboard data source for the row titles above and detach or remove only those sample rows.
