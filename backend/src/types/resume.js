import { z } from 'zod';
export const ProfileSchema = z.object({
    name: z.string().min(1),
    headline: z.string().default(''),
    bio: z.string().default(''),
    location: z.string().default(''),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    avatarUrl: z.string().url().optional().or(z.literal('')),
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
    link: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
});
export const LinkSchema = z.object({
    platform: z.string(),
    url: z.string().url(),
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
