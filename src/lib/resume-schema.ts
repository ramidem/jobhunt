import { z } from "zod";

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
});

const datedItemSchema = z.object({
  organization: z.string().min(1),
  location: z.string().optional(),
  role: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  summary: z.string().optional(),
  bullets: z.array(z.string().min(1)).min(1),
  links: z.array(linkSchema).default([]),
});

export const resumeSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  links: z.array(linkSchema),
  summary: z.string().min(1),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      location: z.string().optional(),
      degree: z.string().min(1),
      dates: z.string().min(1),
      details: z.array(z.string().min(1)).default([]),
    }),
  ),
  experience: z.array(datedItemSchema),
  projects: z.array(datedItemSchema),
  leadership: z.array(datedItemSchema).default([]),
  skills: z.array(
    z.object({
      label: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
  ),
  interests: z.array(z.string().min(1)).default([]),
  updatedAt: z.string().datetime(),
});

export const messageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  organization: z.string().max(160).optional(),
  subject: z.string().min(3).max(160),
  message: z.string().min(20).max(4000),
  page: z.string().url().optional(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type ResumeMessage = z.infer<typeof messageSchema>;
