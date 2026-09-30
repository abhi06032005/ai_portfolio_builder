import OpenAI from 'openai';
import { config } from '../config';
import { ResumeDataSchema } from '../types/resume';
import { AppError } from '../middleware/errorHandler';
const client = new OpenAI({ apiKey: config.openai.apiKey });
const SYSTEM_PROMPT = `
You are a resume parser. Extract structured data from the provided resume text and return it as valid JSON.
Follow this exact JSON schema:

{
  "name": "Full Name",
  "headline": "Short professional headline (1 sentence, e.g. 'Full-Stack Engineer with 5 years experience')",
  "about": "2-3 sentence bio summarizing background and value",
  "contact": {
    "email": "email or empty string",
    "phone": "phone or empty string",
    "location": "city, country or empty string"
  },
  "links": {
    "github": "https://... or omit",
    "linkedin": "https://... or omit",
    "website": "https://... or omit"
  },
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start": "Month YYYY or YYYY",
      "end": "Month YYYY or 'Present'",
      "description": "2-3 sentence summary of responsibilities and achievements"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree and Field",
      "start": "YYYY or empty",
      "end": "YYYY or empty"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "1-2 sentence description",
      "url": "https://... or omit",
      "tech": ["tech1", "tech2"]
    }
  ],
  "sections": {
    "showProjects": true,
    "showEducation": true,
    "showExperience": true,
    "showSkills": true
  }
}

Rules:
- Set showProjects to false if there are no projects.
- Set showEducation to false if there is no education.
- Do NOT invent data – use only what is in the resume.
- Return ONLY the JSON object, no markdown fences, no extra text.
`.trim();
/**
 * Calls the OpenAI API with the resume text and returns a validated ResumeData object.
 */
export async function extractResumeData(resumeText) {
    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Resume text:\n\n${resumeText}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
    });
    const raw = response.choices[0]?.message?.content;
    if (!raw) {
        throw new AppError('AI returned an empty response', 500);
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new AppError('AI returned invalid JSON', 500);
    }
    const result = ResumeDataSchema.safeParse(parsed);
    if (!result.success) {
        console.error('ResumeData validation failed:', result.error.flatten());
        throw new AppError('AI response did not match expected schema', 500);
    }
    return result.data;
}
