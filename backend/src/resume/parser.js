import { logger } from '../utils/logger';
export class ResumeParser {
    aiService;
    dbService;
    constructor(aiService, dbService) {
        this.aiService = aiService;
        this.dbService = dbService;
    }
    /**
     * Stage 2: Extracted text -> structured resume JSON
     * Persists extracted text and structured JSON in D1 permanently (Section 3 & 12).
     */
    async parseAndPersist(resumeId, extractedText) {
        logger.info('Parsing resume text into structured JSON', { resumeId, textLength: extractedText.length });
        const { resume, provider } = await this.aiService.generateStructuredResume(extractedText);
        // Save extracted text and parsed JSON to D1 resumes table (Permanent data retention)
        await this.dbService.updateResumeExtraction(resumeId, extractedText, JSON.stringify(resume));
        logger.info('Saved extracted resume data to D1', { resumeId, provider });
        return { structuredResume: resume, providerUsed: provider };
    }
}
