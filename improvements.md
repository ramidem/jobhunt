# Resume Improvements

Active tracker for resume fixes and decisions. Keep this focused on what is still useful to change.

## Highest Priority

Problem: Bullets are clearer but still light on impact.
Solution: Keep action verbs and details, but sharpen each bullet toward responsibility, outcome, system boundary, or business workflow. Add metrics only when verified.

Problem: The public resume uses `Work`, while ATS and recruiters expect `Experience`.
Solution: Keep `Work` only if preferred for the public site; use `Experience` for tailored/generated ATS resumes.

Problem: Education is empty.
Solution: Fill the education placeholders below, then decide whether it belongs on the public resume.

Problem: Seniority is still unclear to a recruiter.
Solution: Make the Symph entry show whether the public framing is Software Engineer, Senior Software Engineer, Project Lead, or mixed by project.

Problem: The strongest proof of skill is not obvious in a 10-second skim.
Solution: Choose the top 2-3 strongest platform highlights for the default public resume and move weaker/older items to tailored resumes.

Problem: The public site has a headline but not a strong "why this person" summary.
Solution: Add a short, optional summary only if it improves clarity without crowding the resume or weakening ATS readability.

Problem: Interview stories are not tracked.
Solution: Add short prep notes for RBAC/CASL, financial workflows, Strapi plugins, Firebase/React commerce, AI-assisted development quality, testing, ownership, and NDA handling.

Problem: Message form appears before resume content in the HTML.
Solution: Check whether search engines or simple scrapers see the form before resume content; move the form later in DOM if it hurts parsing.

Problem: ATS/PDF parsing is assumed but not verified.
Solution: Export the final PDF and run a text extraction pass to confirm headings, dates, roles, bullets, and skills parse cleanly.

## Education Placeholder

Primary institution: TBD
Public institution name: TBD
Location: TBD
Degree / program: TBD
Field / major: TBD
Dates: TBD
Graduation date: TBD
GPA: omit unless useful

Education details to consider:

- Relevant coursework: TBD
- Honors / awards: TBD
- Thesis / capstone: TBD
- Activities / leadership: TBD

Additional education:

- Institution: TBD
- Program / certificate: TBD
- Dates: TBD
- Credential URL: TBD
- Skills covered: TBD
- Project or capstone: TBD

## Later

- Add stronger public projects when ready: Alignly, FCCD, Nookbud, RoundSave, or selected personal projects.
- Verify final Vercel environment variables, Google Analytics, Firebase/message backend config, and mobile PDF download.
- Generate tailored versions from Markdown records instead of editing the public default for each role.
- Move public resume data generation closer to `projects/*-resume.md` so the app does not depend on manually duplicated resume data.
