import { z } from 'zod';

export const ContactSchema = z.object({
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
});

export const LinksSchema = z.object({
  github: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  website: z.string().optional().default(''),
  twitter: z.string().optional().default(''),
});

export const ResumeExperienceItemSchema = z.object({
  company: z.string().default('Company'),
  role: z.string().default('Role'),
  start: z.string().default(''),
  end: z.string().optional().default('Present'),
  description: z.string().default(''),
  bullets: z.array(z.string()).optional().default([]),
});

export const ResumeEducationItemSchema = z.object({
  school: z.string().default('University'),
  degree: z.string().default('Degree'),
  start: z.string().optional().default(''),
  end: z.string().optional().default(''),
});

export const ResumeProjectItemSchema = z.object({
  name: z.string().default('Project'),
  description: z.string().default(''),
  url: z.string().optional().default(''),
  tech: z.array(z.string()).optional().default([]),
});

export const SectionVisibilitySchema = z.object({
  showProjects: z.boolean().default(true),
  showEducation: z.boolean().default(true),
  showExperience: z.boolean().default(true),
  showSkills: z.boolean().default(true),
});

export const ResumeDataSchema = z.object({
  name: z.string().default('Developer'),
  headline: z.string().default('Software Engineer'),
  about: z.string().default(''),
  avatarUrl: z.string().optional().default(''),
  contact: ContactSchema.default({}),
  links: LinksSchema.default({}),
  skills: z.union([z.array(z.string()), z.record(z.any())]).default([]),
  experience: z.array(ResumeExperienceItemSchema).default([]),
  education: z.array(ResumeEducationItemSchema).default([]),
  projects: z.array(ResumeProjectItemSchema).default([]),
  sections: SectionVisibilitySchema.default({}),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ContactInfo = z.infer<typeof ContactSchema>;
export type LinksInfo = z.infer<typeof LinksSchema>;
export type ResumeExperienceItem = z.infer<typeof ResumeExperienceItemSchema>;
export type ResumeEducationItem = z.infer<typeof ResumeEducationItemSchema>;
export type ResumeProjectItem = z.infer<typeof ResumeProjectItemSchema>;

// Legacy schema aliases for backward compatibility with existing parsers
export const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().default(''),
  bio: z.string().default(''),
  location: z.string().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  avatarUrl: z.string().optional().default(''),
});

export const ExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().default(''),
  endDate: z.string().default('Present'),
  description: z.string().default(''),
  highlights: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().default(''),
  fieldOfStudy: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
});

export const ProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional().default(''),
  github: z.string().optional().default(''),
});

export const LinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

export const StructuredResumeSchema = z.object({
  profile: ProfileSchema,
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  achievements: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  links: z.array(LinkSchema).default([]),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type StructuredResume = z.infer<typeof StructuredResumeSchema>;
