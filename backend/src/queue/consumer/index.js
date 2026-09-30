import { DbService } from '../../db/client';
import { StorageService } from '../../storage/r2';
import { JobTracker } from '../../jobs/tracker';
import { extractResumeText } from '../../resume/extraction';
import { ResumeParser } from '../../resume/parser';
import { PortfolioGenerator } from '../../portfolio/generator';
import { ResilientAIService } from '../../ai';
import { logger } from '../../utils/logger';
export async function processQueueBatch(batch, env) {
    const dbService = new DbService(env.DB);
    const storageService = new StorageService(env.STORAGE);
    const aiService = new ResilientAIService(env);
    const resumeParser = new ResumeParser(aiService, dbService);
    const portfolioGenerator = new PortfolioGenerator(aiService, dbService);
    logger.info(`Queue consumer received batch of ${batch.messages.length} messages`, {
        batchSize: batch.messages.length,
        queueName: batch.queue,
    });
    // Process messages concurrently up to AI_MAX_CONCURRENCY buffer
    const maxConcurrency = parseInt(env.AI_MAX_CONCURRENCY || '5', 10);
    const chunks = [];
    for (let i = 0; i < batch.messages.length; i += maxConcurrency) {
        chunks.push(batch.messages.slice(i, i + maxConcurrency));
    }
    for (const chunk of chunks) {
        await Promise.all(chunk.map((msg) => processSingleJob(msg, {
            dbService,
            storageService,
            resumeParser,
            portfolioGenerator,
            env,
        })));
    }
}
/**
 * Processes a single job independently with strict failure isolation (Section 20).
 * A failure in Job A will NEVER crash or block Job B!
 */
async function processSingleJob(message, services) {
    const { jobId, userId, resumeId, theme } = message.body;
    const tracker = new JobTracker(services.dbService, jobId, userId);
    const startTime = Date.now();
    try {
        // ── 1. IDEMPOTENCY CHECK (Section 13) ───────────────────────────────────
        const job = await services.dbService.getJob(jobId);
        if (!job) {
            logger.warn('Job record not found in D1, acknowledging message to prevent infinite retry', { jobId });
            message.ack();
            return;
        }
        if (job.status === 'completed') {
            logger.info('Job already completed, skipping duplicate queue execution (Idempotent)', { jobId });
            message.ack();
            return;
        }
        const currentAttempt = await services.dbService.incrementJobAttempt(jobId);
        logger.info('Starting job execution', {
            jobId,
            userId,
            resumeId,
            attempt: currentAttempt,
        });
        // ── 2. RETRIEVE RESUME RECORD ──────────────────────────────────────────
        const resume = await services.dbService.getResume(resumeId, userId);
        if (!resume) {
            throw new Error(`Resume record ${resumeId} not found in D1`);
        }
        // ── 3. STAGE 1: TEXT EXTRACTION (Section 10 & 12) ──────────────────────
        let rawText = resume.extracted_text;
        if (!rawText) {
            await tracker.updateStage('extracting');
            logger.info('Fetching original resume from R2 permanent storage', { storageKey: resume.storage_key });
            const fileBuffer = await services.storageService.getFile(resume.storage_key);
            const extraction = await extractResumeText(fileBuffer, resume.mime_type, resume.original_filename);
            rawText = extraction.text;
            if (!rawText || rawText.length < 20) {
                throw new Error('Extracted resume text is empty or too short to generate a portfolio.');
            }
        }
        else {
            logger.info('Reusing previously extracted resume text (Cost & speed optimization)', { resumeId });
        }
        // ── 4. STAGE 2: STRUCTURED RESUME JSON (Section 10 & 12) ────────────────
        let structuredResume = null;
        if (resume.parsed_data_json) {
            try {
                structuredResume = JSON.parse(resume.parsed_data_json);
                logger.info('Reusing previously parsed structured resume JSON', { resumeId });
            }
            catch {
                structuredResume = null;
            }
        }
        if (!structuredResume) {
            await tracker.updateStage('analyzing');
            const { structuredResume: parsed } = await services.resumeParser.parseAndPersist(resumeId, rawText);
            structuredResume = parsed;
        }
        // ── 5. STAGE 3, 4, 5: PORTFOLIO GENERATION, VALIDATION, PERSISTENCE ─────
        await tracker.updateStage('generating');
        const { portfolioId, versionId } = await services.portfolioGenerator.generateAndPersist({
            userId,
            resumeId,
            resumeData: structuredResume,
            theme,
        });
        // ── 6. STAGE 6: PUBLISHING & COMPLETION ─────────────────────────────────
        await tracker.updateStage('publishing');
        await tracker.markCompleted();
        const durationMs = Date.now() - startTime;
        logger.info('Job successfully processed end-to-end', {
            jobId,
            userId,
            portfolioId,
            versionId,
            durationMs,
            attempt: currentAttempt,
        });
        message.ack();
    }
    catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error('Error processing job in queue consumer', {
            jobId,
            userId,
            resumeId,
            durationMs,
            error: error.message,
            stack: error.stack,
        });
        const maxRetries = 4;
        const currentAttempts = message.attempts || 1;
        if (currentAttempts < maxRetries) {
            // Exponential backoff retry: 10s, 20s, 40s, 80s (Section 14)
            const delaySeconds = Math.min(300, Math.pow(2, currentAttempts) * 10);
            logger.warn(`Scheduling job retry with exponential backoff (${delaySeconds}s delay)`, {
                jobId,
                attempt: currentAttempts,
                delaySeconds,
            });
            try {
                await tracker.updateStage('failed');
            }
            catch { }
            message.retry({ delaySeconds });
        }
        else {
            // Retries exhausted -> mark permanently failed in D1, preserve all resume data!
            logger.error('Job exceeded maximum retry attempts, marking as failed in D1', {
                jobId,
                attempts: currentAttempts,
            });
            await tracker.markFailed('GENERATION_FAILED', error.message, currentAttempts);
            message.ack();
        }
    }
}
