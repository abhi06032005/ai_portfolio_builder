import { logger } from '../utils/logger';
export const STAGE_PROGRESS_MAP = {
    queued: 0,
    uploading: 10,
    extracting: 25,
    analyzing: 45,
    generating: 65,
    validating: 85,
    publishing: 95,
    completed: 100,
    failed: 0,
};
export class JobTracker {
    dbService;
    jobId;
    userId;
    constructor(dbService, jobId, userId) {
        this.dbService = dbService;
        this.jobId = jobId;
        this.userId = userId;
    }
    async updateStage(stage, customProgress) {
        const progress = customProgress !== undefined ? customProgress : STAGE_PROGRESS_MAP[stage];
        const isFirstProcessing = stage === 'extracting' || stage === 'analyzing';
        logger.info('Job stage updated', {
            jobId: this.jobId,
            userId: this.userId,
            stage,
            progress,
        });
        await this.dbService.updateJobProgress(this.jobId, stage, progress, isFirstProcessing);
    }
    async markCompleted() {
        logger.info('Job completed successfully', {
            jobId: this.jobId,
            userId: this.userId,
            stage: 'completed',
            progress: 100,
        });
        await this.dbService.markJobCompleted(this.jobId);
    }
    async markFailed(errorCode, errorMessage, attemptCount) {
        logger.error('Job failed', {
            jobId: this.jobId,
            userId: this.userId,
            stage: 'failed',
            errorCode,
            errorMessage,
            attempt: attemptCount,
        });
        await this.dbService.markJobFailed(this.jobId, errorCode, errorMessage, attemptCount);
    }
}
