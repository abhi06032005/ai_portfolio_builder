export interface QueueJobMessage {
  jobId: string;
  userId: string;
  resumeId: string;
  type: string;
  attempt: number;
  priority?: number;
  theme?: string;
}

export interface Env {
  // Cloudflare D1 Database
  DB: D1Database;

  // Cloudflare R2 Storage Bucket
  STORAGE: R2Bucket;

  // Cloudflare Queue Producer
  PORTFOLIO_QUEUE: Queue<QueueJobMessage>;

  // Cloudflare KV Namespace (Optional for caching / config)
  CACHE_KV?: KVNamespace;

  // Environment Variables & Secrets
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  CLERK_SECRET_KEY?: string;
  JWT_SECRET?: string;

  // Concurrency & Rate Limit Configuration
  AI_MAX_CONCURRENCY?: string;
  PRIMARY_AI_PROVIDER?: string;
  FALLBACK_AI_PROVIDER?: string;
  MAX_ACTIVE_JOBS_PER_USER?: string;
  MAX_HOURLY_JOBS_PER_USER?: string;
  MAX_FILE_SIZE_MB?: string;
}
