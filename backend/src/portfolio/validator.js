import { ZodError } from 'zod';
import { StructuredResumeSchema } from '../types/resume';
import { PortfolioContentSchema } from '../types/portfolio';
import { logger } from '../utils/logger';
/**
 * Attempts to repair malformed JSON from LLM output (Section 11)
 */
export function repairJsonString(raw) {
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
export function validateWithRepair(rawText, schema, schemaName = 'Schema') {
    // Step 1: Direct parse
    try {
        const parsed = JSON.parse(rawText);
        const validated = schema.parse(parsed);
        return { success: true, data: validated, repaired: false };
    }
    catch (err) {
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
    }
    catch (err) {
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
export function validateStructuredResume(raw) {
    return validateWithRepair(raw, StructuredResumeSchema, 'StructuredResume');
}
/**
 * Helper to validate PortfolioContent
 */
export function validatePortfolioContent(raw) {
    return validateWithRepair(raw, PortfolioContentSchema, 'PortfolioContent');
}
