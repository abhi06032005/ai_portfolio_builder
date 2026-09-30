import { AIProvider, AIProviderError } from './provider';
import { StructuredResume } from '../types/resume';
import { PortfolioContent } from '../types/portfolio';
import { validateStructuredResume, validatePortfolioContent } from '../portfolio/validator';
import { logger } from '../utils/logger';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';

  constructor(
    private apiKey: string,
    private model: string = 'gemini-1.5-flash',
  ) {}

  private async callGenerate(prompt: string): Promise<string> {
    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        const isTransient = response.status === 429 || response.status >= 500;
        logger.error('Gemini API call failed', {
          status: response.status,
          durationMs,
          error: errorText,
        });
        throw new AIProviderError(
          `Gemini API error (${response.status}): ${errorText}`,
          this.name,
          isTransient,
          response.status,
        );
      }

      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      logger.info('Gemini completion successful', { durationMs });
      return text;
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      throw new AIProviderError(err.message, this.name, true);
    }
  }

  async generateStructuredResume(rawText: string): Promise<StructuredResume> {
    const prompt = `You are a resume parsing engine. Return strict JSON matching this schema:
{
  "profile": {
    "name": "Full Name",
    "headline": "Professional Title / Headline",
    "bio": "2-3 sentence engaging summary",
    "location": "City, Country",
    "email": "email@example.com",
    "phone": "phone number or empty string",
    "avatarUrl": ""
  },
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "e.g. Jan 2022",
      "endDate": "e.g. Present",
      "description": "Short overview",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University / School",
      "degree": "Degree e.g. B.S.",
      "fieldOfStudy": "Computer Science",
      "startDate": "e.g. 2018",
      "endDate": "e.g. 2022"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Clear description of what was built and impact",
      "technologies": ["React", "TypeScript", "Node.js"],
      "link": "",
      "github": ""
    }
  ],
  "achievements": ["Notable achievement or award"],
  "certifications": ["Certification name"],
  "links": [
    { "platform": "GitHub", "url": "https://github.com/..." }
  ]
}

Parse the following resume text into this exact JSON schema:
${rawText.slice(0, 15000)}`;

    const content = await this.callGenerate(prompt);
    const valResult = validateStructuredResume(content);
    if (!valResult.success || !valResult.data) {
      throw new AIProviderError(`Validation failed: ${valResult.error}`, this.name, false);
    }
    return valResult.data;
  }

  async generatePortfolioContent(
    resume: StructuredResume,
    themePreference = 'minimal',
  ): Promise<PortfolioContent> {
    const prompt = `You are a portfolio copywriter and designer. Convert this resume into high-impact portfolio JSON.
Schema:
{
  "meta": { "title": "${resume.profile.name} - Portfolio", "description": "Engaging description", "theme": "${themePreference}" },
  "hero": {
    "greeting": "Hello, I'm",
    "name": "${resume.profile.name}",
    "tagline": "Dynamic 1-line punchline",
    "subheadline": "2-sentence value proposition",
    "ctaPrimary": { "label": "View Projects", "url": "#projects" },
    "ctaSecondary": { "label": "Contact Me", "url": "#contact" }
  },
  "about": {
    "summary": "Engaging narrative bio",
    "highlights": ["Key achievement 1", "Key achievement 2"]
  },
  "skills": [{ "category": "Core Technologies", "items": ["Skill 1", "Skill 2"] }],
  "projects": [{ "title": "Project Title", "description": "Impact description", "technologies": ["Tech"], "link": "", "github": "", "featured": true }],
  "experience": [{ "company": "Company", "role": "Role", "period": "2022 - Present", "description": "Summary", "highlights": ["Highlight 1"] }],
  "education": [{ "institution": "School", "degree": "Degree", "year": "2022" }],
  "contact": { "email": "${resume.profile.email || ''}", "socials": [] }
}

Resume Data:
${JSON.stringify(resume)}`;

    const content = await this.callGenerate(prompt);
    const valResult = validatePortfolioContent(content);
    if (!valResult.success || !valResult.data) {
      throw new AIProviderError(`Portfolio validation failed: ${valResult.error}`, this.name, false);
    }
    return valResult.data;
  }
}
