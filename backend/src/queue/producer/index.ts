import { QueueJobMessage } from '../../types/env';
import { logger } from '../../utils/logger';

export class QueueProducer {
  constructor(private queue: Queue<QueueJobMessage>) {}

  /**
   * Pushes a generation job to Cloudflare Queue (Section 7)
   */
  async enqueueJob(message: QueueJobMessage): Promise<void> {
    logger.info('Enqueuing generation job to Cloudflare Queue', {
      jobId: message.jobId,
      userId: message.userId,
      resumeId: message.resumeId,
      attempt: message.attempt,
    });

    await this.queue.send(message);
  }
}
