"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { resume } from "@/data/resume";
import {
  SKILLS_KEY,
  SKILL_STATUSES,
  newId,
  type Skill,
  type SkillStatus,
} from "@/lib/tracker";
import { useLocalStorage } from "@/lib/use-local-storage";

const LABELS: Record<SkillStatus, string> = {
  know: "I know",
  learning: "Learning",
  want: "Want to learn",
};

export default function SkillsPage() {
  const [skills, setSkills, ready] = useLocalStorage<Skill[]>(SKILLS_KEY, []);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<SkillStatus>("want");

  // First visit: seed "I know" from the resume's skills.
  useEffect(() => {
    if (!ready || window.localStorage.getItem(SKILLS_KEY) !== null) {
      return;
    }
    setSkills(
      resume.skills.flatMap((group) =>
        group.items.map((item) => ({ id: newId(), name: item, status: "know" as const })),
      ),
    );
  }, [ready, setSkills]);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    setSkills((previous) => [...previous, { id: newId(), name: trimmed, status }]);
    setName("");
  }

  return (
    <div className="workspace-panel">
      <h1>Skills</h1>
      <p className="muted">
        Track what you know and what you need. Seeded from your resume; stored in this browser only.
      </p>

      <form className="form-row" onSubmit={add}>
        <label className="grow">
          Skill
          <input onChange={(event) => setName(event.target.value)} required value={name} />
        </label>
        <label>
          Status
          <select
            onChange={(event) => setStatus(event.target.value as SkillStatus)}
            value={status}
          >
            {SKILL_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <button className="icon-button primary add-button" type="submit">
          Add
        </button>
      </form>

      <div className="skill-columns">
        {SKILL_STATUSES.map((column) => {
          const items = skills.filter((skill) => skill.status === column);
          return (
            <section className="card" key={column}>
              <h2>
                {LABELS[column]} ({items.length})
              </h2>
              <ul className="plain-list">
                {items.map((skill) => (
                  <li className="skill-row" key={skill.id}>
                    <span>{skill.name}</span>
                    <select
                      aria-label={`Status for ${skill.name}`}
                      onChange={(event) =>
                        setSkills((previous) =>
                          previous.map((entry) =>
                            entry.id === skill.id
                              ? { ...entry, status: event.target.value as SkillStatus }
                              : entry,
                          ),
                        )
                      }
                      value={skill.status}
                    >
                      {SKILL_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {LABELS[value]}
                        </option>
                      ))}
                    </select>
                    <button
                      aria-label={`Remove ${skill.name}`}
                      className="icon-button"
                      onClick={() =>
                        setSkills((previous) => previous.filter((entry) => entry.id !== skill.id))
                      }
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
