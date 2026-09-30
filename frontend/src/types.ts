export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

export interface LinksInfo {
  github?: string;
  linkedin?: string;
  website?: string;
  twitter?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end?: string;
  description: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  start?: string;
  end?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  url?: string;
  tech?: string[];
}

export interface SectionVisibility {
  showProjects: boolean;
  showEducation: boolean;
  showExperience: boolean;
  showSkills: boolean;
}

export interface ResumeData {
  name: string;
  headline: string;
  about: string;
  avatarUrl?: string;
  contact: ContactInfo;
  links: LinksInfo;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  sections: SectionVisibility;
  integrations?: {
    github?: {
      username: string;
      isConnected: boolean;
      totalStars?: number;
      topLanguages?: string[];
      repos?: Array<{
        name: string;
        description: string;
        url: string;
        stars: number;
        forks: number;
        language: string;
      }>;
    };
    leetcode?: {
      username: string;
      isConnected: boolean;
      totalSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      ranking?: string | number;
      acceptanceRate?: number;
    };
    medium?: {
      username: string;
      isConnected: boolean;
      platform?: 'medium' | 'devto';
      articles?: Array<{
        title: string;
        link: string;
        pubDate: string;
        description?: string;
        coverImage?: string;
        readTime?: string;
      }>;
    };
  };
  accentColor?: string;
  subdomain?: string;
  customDomain?: string;
  isPublished?: boolean;
}

export interface PortfolioRecord {
  id: string;
  userId: string;
  resumeId?: string;
  templateId: string;
  data: ResumeData;
  previewToken?: string;
  githubRepo?: string;
  status: 'DRAFT' | 'PREVIEW' | 'DEPLOYED';
  createdAt: string;
  updatedAt: string;
  resume?: {
    originalFilename: string;
    email?: string;
  };
}
