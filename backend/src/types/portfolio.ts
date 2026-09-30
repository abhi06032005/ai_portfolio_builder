import { z } from 'zod';
import { StructuredResumeSchema } from './resume';

export const PortfolioThemeSchema = z.enum([
  'minimal', 'modern', 'dark', 'terminal', 'bento', 'aeline',
  'template1', 'memphis',
  'template2', 'template3', 'template4', 'template5',
  'template6', 'template7', 'template8', 'template9'
]);
export type PortfolioTheme = z.infer<typeof PortfolioThemeSchema>;

export const PortfolioContentSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
    theme: PortfolioThemeSchema.default('minimal'),
  }),
  hero: z.object({
    name: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string().default('View Work'),
    secondaryCtaText: z.string().default('Contact Me'),
  }),
  about: z.object({
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
  }),
  skills: z.array(
    z.object({
      category: z.string().default('General'),
      items: z.array(z.string()),
    }),
  ).default([]),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      liveUrl: z.string().url().optional().or(z.literal('')),
      sourceUrl: z.string().url().optional().or(z.literal('')),
    }),
  ).default([]),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      description: z.string(),
      keyAchievements: z.array(z.string()).default([]),
    }),
  ).default([]),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      period: z.string(),
    }),
  ).default([]),
  contact: z.object({
    email: z.string().email().optional().or(z.literal('')),
    location: z.string().optional().or(z.literal('')),
    links: z.record(z.string(), z.string()).default({}),
  }),
  rawResumeData: StructuredResumeSchema.optional(),
});

export type PortfolioContent = z.infer<typeof PortfolioContentSchema>;
