import { Env } from '../types/env';
import { ResumeData, ResumeDataSchema } from '../types/resume';
import { repairJsonString } from '../portfolio/validator';
import { logger } from '../utils/logger';

/**
 * Heuristic fallback parser in case AI APIs are unreachable or offline
 */
export function extractHeuristicResumeData(rawText: string, filename = ''): ResumeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Extract email
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract phone
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extract candidate name from first clean line or filename
  let name = '';
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 40 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !/resume|curriculum|vitae|page|profile/i.test(line)
    ) {
      name = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (name.split(/\s+/).length >= 2) break;
    }
  }

  if (!name && filename) {
    name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
  }
  if (!name) name = 'Developer';

  // 4. Extract common technical skills
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go',
    'Rust', 'Java', 'C++', 'HTML', 'CSS', 'Tailwind CSS', 'PostgreSQL', 'MySQL',
    'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Cloudflare',
    'GraphQL', 'Git', 'Linux', 'Figma', 'CI/CD', 'REST APIs', 'System Design'
  ];

  const foundSkills = commonSkills.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(rawText)
  );

  // 5. Extract Headline / Role
  let headline = 'Software Engineer & Builder';
  const roles = [
    'Full Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'Software Engineer',
    'DevOps Engineer', 'Cloud Architect', 'Product Designer', 'Mobile Developer', 'Data Scientist'
  ];
  for (const r of roles) {
    if (new RegExp(`\\b${r}\\b`, 'i').test(rawText)) {
      headline = r;
      break;
    }
  }

  // 6. Extract summary/about
  const about = lines.find((l) => l.length > 50 && l.length < 400 && !l.includes('@')) ||
    `Passionate ${headline.toLowerCase()} dedicated to building high-performance, user-friendly digital experiences.`;

  return ResumeDataSchema.parse({
    name,
    headline,
    about,
    contact: { email, phone, location: '' },
    links: { github: '', linkedin: '', website: '' },
    skills: foundSkills.length > 0 ? foundSkills : ['TypeScript', 'React', 'Node.js'],
    experience: [],
    education: [],
    projects: [],
  });
}

/**
 * Fast synchronous AI extraction using Groq (LLaMA 3.3 70B) or OpenAI
 */
export async function parseResumeWithAI(env: Env, rawText: string, filename = ''): Promise<ResumeData> {
  const truncatedText = rawText.slice(0, 16000);

  const systemPrompt = `You are a world-class AI resume parser and portfolio generator.
Analyze the user's resume and extract high-fidelity structured data in strict JSON.
Rules:
- Output ONLY valid JSON, no markdown fences, no conversational text.
- Fill as many fields as possible from the provided text.
- Normalize skills into a flat array of string names.
- Provide a clear, engaging 2-3 sentence 'about' bio based on their background.
- Experience array must have: company, role, start, end, description.
- Projects array must have: name, description, url, tech (array of strings).
- Education array must have: school, degree, start, end.`;

  const userPrompt = `Extract this resume into JSON matching this exact structure:
{
  "name": "Full Name",
  "headline": "Professional Title / Headline",
  "about": "Compelling 2-3 sentence bio",
  "contact": { "email": "", "phone": "", "location": "" },
  "links": { "github": "", "linkedin": "", "website": "", "twitter": "" },
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    { "company": "", "role": "", "start": "", "end": "", "description": "" }
  ],
  "education": [
    { "school": "", "degree": "", "start": "", "end": "" }
  ],
  "projects": [
    { "name": "", "description": "", "url": "", "tech": [] }
  ]
}

RESUME CONTENT:
${truncatedText}`;

  // 1. Try Groq (Ultra-fast, LLaMA 3.3 70B)
  if (env.GROQ_API_KEY) {
    try {
      logger.info('Calling Groq API for instant resume extraction');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (response.ok) {
        const json: any = await response.json();
        const content = json.choices?.[0]?.message?.content || '{}';
        const cleaned = repairJsonString(content);
        const parsed = JSON.parse(cleaned);
        const validated = ResumeDataSchema.parse(parsed);
        logger.info('Successfully parsed resume with Groq LLaMA 3.3', { name: validated.name });
        return validated;
      } else {
        const errText = await response.text();
        logger.warn('Groq API error during resume parse', { status: response.status, error: errText });
      }
    } catch (err: any) {
      logger.warn('Groq extraction error', { error: err.message });
    }
  }

  // 2. Try OpenAI fallback if configured
  if (env.OPENAI_API_KEY) {
    try {
      logger.info('Calling OpenAI API fallback for resume extraction');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (response.ok) {
        const json: any = await response.json();
        const content = json.choices?.[0]?.message?.content || '{}';
        const cleaned = repairJsonString(content);
        const parsed = JSON.parse(cleaned);
        return ResumeDataSchema.parse(parsed);
      }
    } catch (err: any) {
      logger.warn('OpenAI extraction error', { error: err.message });
    }
  }

  // 3. Robust Heuristic fallback if AI is unreachable
  logger.info('Falling back to heuristic extraction engine');
  return extractHeuristicResumeData(rawText, filename);
}
