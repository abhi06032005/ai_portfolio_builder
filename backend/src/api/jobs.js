import { Hono } from 'hono';
import { DbService } from '../db/client';
import { AppError, okResponse } from '../utils/response';
export const jobRouter = new Hono();
/**
 * GET /api/jobs/:id
 * Polls the current status, stage, and progress percentage of a generation job (Section 19).
 */
jobRouter.get('/:id', async (c) => {
    const userId = c.get('userId');
    const jobId = c.req.param('id');
    const dbService = new DbService(c.env.DB);
    const job = await dbService.getJob(jobId, userId);
    if (!job) {
        throw new AppError('Job not found or access denied', 404, 'JOB_NOT_FOUND');
    }
    return okResponse(c, {
        id: job.id,
        resumeId: job.resume_id,
        jobType: job.job_type,
        status: job.status,
        stage: job.stage,
        progress: job.progress,
        attempts: job.attempts,
        errorCode: job.error_code,
        errorMessage: job.error_message,
        createdAt: job.created_at,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        updatedAt: job.updated_at,
    });
});
