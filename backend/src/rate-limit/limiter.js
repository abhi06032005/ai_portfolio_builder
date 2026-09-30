import { AppError } from '../utils/response';
export class RateLimiter {
    dbService;
    env;
    constructor(dbService, env) {
        this.dbService = dbService;
        this.env = env;
    }
    /**
     * Enforces per-user generation limits (Section 9: Fair scheduling & abuse prevention)
     */
    async checkUserGenerationLimit(userId, isPaid = false) {
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
    async assertCanGenerate(userId, isPaid = false) {
        const res = await this.checkUserGenerationLimit(userId, isPaid);
        if (!res.allowed) {
            throw new AppError(res.reason || 'Generation limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
        }
    }
}
