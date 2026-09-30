import fs from 'fs';
import path from 'path';
import { ResumeData } from '../types/resume';
import { AppError } from '../middleware/errorHandler';

// Base dir where templates live (relative to project root)
const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates');

export interface Template {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
}

/**
 * Returns metadata for all available templates by scanning the templates directory.
 */
export function listTemplates(): Template[] {
  const dirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  return dirs
    .filter((d) => d.isDirectory())
    .map((d) => {
      const metaPath = path.join(TEMPLATES_DIR, d.name, 'meta.json');
      if (fs.existsSync(metaPath)) {
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as Template;
      }
      // Fallback if meta.json missing
      return {
        id: d.name,
        name: d.name,
        description: '',
        previewImageUrl: '',
      };
    });
}

/**
 * Returns the raw HTML string for a template, with {{key}} placeholders.
 */
export function getTemplateHtml(templateId: string): string {
  const htmlPath = path.join(TEMPLATES_DIR, templateId, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    throw new AppError(`Template "${templateId}" not found`, 404);
  }
  return fs.readFileSync(htmlPath, 'utf-8');
}

/**
 * Returns an array of static asset file paths for a given template.
 * Used when zipping / copying the site for deployment.
 */
export function getTemplateAssets(templateId: string): string[] {
  const templateDir = path.join(TEMPLATES_DIR, templateId);
  if (!fs.existsSync(templateDir)) {
    throw new AppError(`Template "${templateId}" not found`, 404);
  }

  const allFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name !== 'index.html' && entry.name !== 'meta.json') {
        allFiles.push(full);
      }
    }
  };
  walk(templateDir);
  return allFiles;
}

/**
 * Renders the template HTML by replacing {{placeholders}} with real data.
 * Complex arrays (experience, projects, etc.) are handled via section templates
 * embedded directly in the HTML with data-template attributes.
 */
export function renderTemplate(templateId: string, data: ResumeData): string {
  let html = getTemplateHtml(templateId);

  // Simple scalar replacements
  const scalars: Record<string, string> = {
    name: data.name,
    headline: data.headline,
    about: data.about,
    avatarUrl: data.avatarUrl || '',
    email: data.contact?.email || '',
    phone: data.contact?.phone || '',
    location: data.contact?.location || '',
    githubUrl: data.links.github || '',
    linkedinUrl: data.links.linkedin || '',
    websiteUrl: data.links.website || '',
    skills: Array.isArray(data.skills)
      ? data.skills.join(', ')
      : typeof data.skills === 'object' && data.skills !== null
      ? Object.values(data.skills as Record<string, unknown>).flat().join(', ')
      : String(data.skills || ''),
  };

  for (const [key, value] of Object.entries(scalars)) {
    html = html.split(`{{${key}}}`).join(escapeHtml(value));
  }

  // Inject the full data JSON so the frontend JS can read it
  html = html.replace(
    '{{DATA_JSON}}',
    JSON.stringify(data, null, 2)
      .replace(/<\/script>/gi, '<\\/script>'), // XSS-safe
  );

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
