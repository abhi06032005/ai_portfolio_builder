import { DbService } from '../db/client';
import { Env } from '../types/env';
import { AppError } from '../utils/response';

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  activeJobs: number;
  hourlyJobs: number;
}

export class RateLimiter {
  constructor(
    private dbService: DbService,
    private env: Env,
  ) {}

  /**
   * Enforces per-user generation limits (Section 9: Fair scheduling & abuse prevention)
   */
  async checkUserGenerationLimit(userId: string, isPaid = false): Promise<RateLimitResult> {
    const maxActive = isPaid
      ? 10
      : parseInt(this.env.MAX_ACTIVE_JOBS_PER_USER || '2', 10);
    const maxHourly = isPaid
      ? 50
      : parseInt(this.env.MAX_HOURLY_JOBS_PER_USER || '10', 10);

    const [activeJobs, hourlyJobs] = await Promise.all([
      this.dbService.getUserActiveJobCount(userId),
      this.dbService.getUserHourlyJobCount(userId),
    ]);

    if (activeJobs >= maxActive) {
      return {
        allowed: false,
        reason: `Maximum concurrent jobs reached (${activeJobs}/${maxActive}). Please wait for current jobs to complete.`,
        activeJobs,
        hourlyJobs,
      };
    }

    if (hourlyJobs >= maxHourly) {
      return {
        allowed: false,
        reason: `Hourly generation limit exceeded (${hourlyJobs}/${maxHourly}). Please try again later.`,
        activeJobs,
        hourlyJobs,
      };
    }

    return {
      allowed: true,
      activeJobs,
      hourlyJobs,
    };
  }

  /**
   * Throws AppError if limit exceeded
   */
  async assertCanGenerate(userId: string, isPaid = false): Promise<void> {
    const res = await this.checkUserGenerationLimit(userId, isPaid);
    if (!res.allowed) {
      throw new AppError(res.reason || 'Generation limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }
  }
}
