import { AIProvider, AIProviderError } from './provider';
import { StructuredResume } from '../types/resume';
import { PortfolioContent } from '../types/portfolio';
import { validateStructuredResume, validatePortfolioContent } from '../portfolio/validator';
import { logger } from '../utils/logger';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  constructor(
    private apiKey: string,
    private model: string = 'gpt-4o-mini',
  ) {}

  private async callChat(systemPrompt: string, userPrompt: string): Promise<string> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        logger.error('OpenAI API call failed', {
          status: response.status,
          durationMs,
          error: errorText,
        });
        throw new AIProviderError(
          `OpenAI API error (${response.status}): ${errorText}`,
          this.name,
          isTransient,
          response.status,
        );
      }

      const data: any = await response.json();
      logger.info('OpenAI completion successful', {
        durationMs,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      });

      return data.choices[0]?.message?.content || '{}';
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      throw new AIProviderError(err.message, this.name, true);
    }
  }

  async generateStructuredResume(rawText: string): Promise<StructuredResume> {
    const systemPrompt = `You are an expert resume parsing engine.
Convert the provided raw resume text into a strict structured JSON matching this schema:
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
Return ONLY pure valid JSON with no markdown wrapping or additional text.`;

    const content = await this.callChat(systemPrompt, `RESUME TEXT:\n${rawText.slice(0, 15000)}`);
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
    const systemPrompt = `You are an elite developer portfolio designer and copywriter.
Transform the provided structured resume into a modern, high-converting portfolio website JSON content.
Generate engaging punchlines, polished hero text, organized skill categories, and highlight project impact.
The output must match this JSON structure:
{
  "meta": {
    "title": "Name - Portfolio",
    "description": "Compelling meta description under 160 characters",
    "theme": "${themePreference}"
  },
  "hero": {
    "greeting": "Hello, I'm",
    "name": "${resume.profile.name}",
    "tagline": "Dynamic 1-line punchline",
    "subheadline": "Compelling 2-sentence value proposition",
    "ctaPrimary": { "label": "View Projects", "url": "#projects" },
    "ctaSecondary": { "label": "Contact Me", "url": "#contact" }
  },
  "about": {
    "summary": "Polished biographical overview",
    "highlights": ["Highlight 1", "Highlight 2"]
  },
  "skills": [
    { "category": "Frontend", "items": ["React", "TypeScript"] },
    { "category": "Backend", "items": ["Node.js", "PostgreSQL"] }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Engaging description showcasing challenges and solutions",
      "technologies": ["Next.js", "Tailwind"],
      "link": "",
      "github": "",
      "featured": true
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "period": "2022 - Present",
      "description": "High-impact summary",
      "highlights": ["Delivered X resulting in Y% improvement"]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "Degree",
      "year": "2022"
    }
  ],
  "contact": {
    "email": "${resume.profile.email || ''}",
    "socials": []
  }
}
Return ONLY valid JSON.`;

    const content = await this.callChat(
      systemPrompt,
      `STRUCTURED RESUME DATA:\n${JSON.stringify(resume)}`,
    );

    const valResult = validatePortfolioContent(content);
    if (!valResult.success || !valResult.data) {
      throw new AIProviderError(`Portfolio validation failed: ${valResult.error}`, this.name, false);
    }

    return valResult.data;
  }
}
