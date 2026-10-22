# Public resume (ramidem.github.io/resume)

The public resume lives in a separate repo, `ramidem/ramidem.github.io`, under `resume/` (`data.js` for the text, `script.js` and `index.html` for the layout, `med-aduh-resume.pdf` for the download). This file records the decisions so any session working on it stays consistent. The text there is the source of truth for the public version; `src/data/resume.ts` in this repo is a separate, older version.

## Rules the owner set (2026-10-20)

- No summary or headline sentence under the name. The only summary is one plain line inside the Symph entry, with no tool names.
- Order: Work History first, then Education. Only the two section headings are bold. No divider lines, no left rules, no indent on the project sections.
- Each project section has a title and dates on one line, no role line and no grey descriptor label.
- No phone number (the page is public). Show the full LinkedIn and GitHub addresses as link text so text-only parsers capture them.
- Each bullet says what was done, then why ("so staff could..."). Tool names go in parentheses after the plain sentence.
- Tool keywords come only from the owner's keyword list: TypeScript, React, JavaScript, HTML, CSS, Node.js, REST APIs, SQL, AI coding tools, Google Cloud, Docker, CI/CD, Git, microservices, DevOps, Agile, "from scratch" and talking to non-technical people. Mention each once or twice; do not repeat.
- Never put in claims that are not in `projects/confirmed-claims.md` or the project records. No invented numbers.
- The page must print on one A4 page. Always regenerate `med-aduh-resume.pdf` from the page (Chrome print to PDF) and confirm one page whenever the text or styles change. Show the owner a draft and push only after they say so.

## Current structure

Symph (Fullstack Software Engineer) with a plain summary line, then four project sections: Financial Services Platform (four bullets), Content Management Platform (two), HR and Payroll Platform (one) and Distributor Operations Platform (one), then Education.

## Lessons

- A GitHub Pages deploy can fail with a 502. After each push, check `gh run list` and re-run a failed deploy.
- The page uses a smaller-screen style when printed, so print margins are set explicitly in `@media print`.

## Locked format (approved 2026-10-22)

Do not change the structure below when editing the text. Only wording may change; any change to layout, order or sections needs the owner's approval first. It must stay on one A4 page, for the site, its PDF and the app's PDF.

- Header: name, then one line `location • email • github.com/ramidem • linkedin.com/in/med-aduh` (bullet separators, no phone on the public version; the app version leads with the phone number).
- `Work History` heading (bold), then Symph (Remote) with the role line "Fullstack Software Engineer" and dates `Nov 2020 – Present`, and one overview bullet.
- Four project sections, flush left, each with the project name on the left and dates on the right (no "Project:" prefix, no role line, no label): Financial Services Platform (`Jan 2021 – Nov 2025`, four bullets), Content Management Platform (`Jan 2025 – May 2025`, two), HR and Payroll Platform (`Feb 2026 – Jun 2026`, two, the second about role-based access) and Distributor Operations Platform (`May 2026 – Jun 2026`, one).
- `Education` heading (bold), then the school, the degree on the next line and "Graduated" (no year).
- No Skills section, no summary or headline under the name, no divider lines. Only the section headings are bold.
- Bullets: plain "what... so..." sentences with tools in parentheses and the keywords from the owner's list (see above).
