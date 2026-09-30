import { z, ZodSchema, ZodError } from 'zod';
import { StructuredResumeSchema, StructuredResume } from '../types/resume';
import { PortfolioContentSchema, PortfolioContent } from '../types/portfolio';
import { logger } from '../utils/logger';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  repaired?: boolean;
}

/**
 * Attempts to repair malformed JSON from LLM output (Section 11)
 */
export function repairJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip Markdown code fences if present: ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  // Find boundaries of first JSON object { ... } or array [ ... ]
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Common LLM formatting fixes:
  // 1. Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  return cleaned;
}

/**
 * Parses and validates raw LLM JSON response against a Zod schema.
 * Automatically tries structured repair if first parse fails.
 */
export function validateWithRepair<T>(
  rawText: string,
  schema: z.ZodType<T, any, any>,
  schemaName = 'Schema',
): ValidationResult<T> {
  // Step 1: Direct parse
  try {
    const parsed = JSON.parse(rawText);
    const validated = schema.parse(parsed);
    return { success: true, data: validated, repaired: false };
  } catch (err: any) {
    logger.warn(`Initial JSON parse/validation failed for ${schemaName}, attempting repair...`, {
      error: err.message,
    });
  }

  // Step 2: Attempt structured repair
  try {
    const repairedText = repairJsonString(rawText);
    const parsed = JSON.parse(repairedText);
    const validated = schema.parse(parsed);
    logger.info(`Successfully repaired and validated ${schemaName} JSON`);
    return { success: true, data: validated, repaired: true };
  } catch (err: any) {
    let errorDetail = err.message;
    if (err instanceof ZodError) {
      errorDetail = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
    logger.error(`Structured repair failed for ${schemaName}`, { error: errorDetail });
    return { success: false, error: errorDetail };
  }
}

/**
 * Helper to validate StructuredResume
 */
export function validateStructuredResume(raw: string): ValidationResult<StructuredResume> {
  return validateWithRepair(raw, StructuredResumeSchema, 'StructuredResume');
}

/**
 * Helper to validate PortfolioContent
 */
export function validatePortfolioContent(raw: string): ValidationResult<PortfolioContent> {
  return validateWithRepair(raw, PortfolioContentSchema, 'PortfolioContent');
}
