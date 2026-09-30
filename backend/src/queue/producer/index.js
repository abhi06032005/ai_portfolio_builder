import { logger } from '../../utils/logger';
export class QueueProducer {
    queue;
    constructor(queue) {
        this.queue = queue;
    }
    /**
     * Pushes a generation job to Cloudflare Queue (Section 7)
     */
    async enqueueJob(message) {
        logger.info('Enqueuing generation job to Cloudflare Queue', {
            jobId: message.jobId,
            userId: message.userId,
            resumeId: message.resumeId,
            attempt: message.attempt,
        });
        await this.queue.send(message);
    }
}
