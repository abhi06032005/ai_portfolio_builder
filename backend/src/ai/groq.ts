import { AIProvider, AIProviderError } from './provider';
import { StructuredResume } from '../types/resume';
import { PortfolioContent } from '../types/portfolio';
import { validateStructuredResume, validatePortfolioContent } from '../portfolio/validator';
import { logger } from '../utils/logger';

export class GroqProvider implements AIProvider {
  readonly name = 'groq';

  constructor(
    private apiKey: string,
    private model: string = 'llama-3.3-70b-versatile',
  ) {}

  private async callChat(systemPrompt: string, userPrompt: string): Promise<string> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        const isTransient = response.status === 429 || response.status >= 500;
        logger.error('Groq API call failed', {
          status: response.status,
          durationMs,
          error: errorText,
        });
        throw new AIProviderError(
          `Groq API error (${response.status}): ${errorText}`,
          this.name,
          isTransient,
          response.status,
        );
      }

      const data: any = await response.json();
      logger.info('Groq completion successful', { durationMs });
      return data.choices[0]?.message?.content || '{}';
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      throw new AIProviderError(err.message, this.name, true);
    }
  }

  async generateStructuredResume(rawText: string): Promise<StructuredResume> {
    const systemPrompt = `You are an expert resume parsing engine. Parse resume text to strict JSON.`;
    const userPrompt = `Parse the following text into JSON matching this schema:
{
  "profile": { "name": "", "headline": "", "bio": "", "location": "", "email": "", "phone": "", "avatarUrl": "" },
  "skills": [],
  "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "description": "", "highlights": [] }],
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "" }],
  "projects": [{ "title": "", "description": "", "technologies": [], "link": "", "github": "" }],
  "achievements": [],
  "certifications": [],
  "links": [{ "platform": "", "url": "" }]
}

RESUME:
${rawText.slice(0, 15000)}`;

    const content = await this.callChat(systemPrompt, userPrompt);
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
    const systemPrompt = `You are a portfolio copywriter. Return only valid JSON for a developer portfolio.`;
    const userPrompt = `Create a developer portfolio based on this resume in JSON:
{
  "meta": { "title": "${resume.profile.name} - Portfolio", "description": "", "theme": "${themePreference}" },
  "hero": { "greeting": "Hello, I'm", "name": "${resume.profile.name}", "tagline": "", "subheadline": "", "ctaPrimary": { "label": "Projects", "url": "#projects" }, "ctaSecondary": { "label": "Contact", "url": "#contact" } },
  "about": { "summary": "", "highlights": [] },
  "skills": [{ "category": "", "items": [] }],
  "projects": [{ "title": "", "description": "", "technologies": [], "link": "", "github": "", "featured": true }],
  "experience": [{ "company": "", "role": "", "period": "", "description": "", "highlights": [] }],
  "education": [{ "institution": "", "degree": "", "year": "" }],
  "contact": { "email": "${resume.profile.email || ''}", "socials": [] }
}

RESUME:
${JSON.stringify(resume)}`;

    const content = await this.callChat(systemPrompt, userPrompt);
    const valResult = validatePortfolioContent(content);
    if (!valResult.success || !valResult.data) {
      throw new AIProviderError(`Portfolio validation failed: ${valResult.error}`, this.name, false);
    }
    return valResult.data;
  }
}
