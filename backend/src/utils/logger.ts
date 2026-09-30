export interface StructuredLogContext {
  jobId?: string;
  userId?: string;
  resumeId?: string;
  stage?: string;
  provider?: string;
  attempt?: number;
  durationMs?: number;
  status?: string | number;
  error?: string;
  [key: string]: any;
}

export const logger = {
  info(message: string, context?: StructuredLogContext): void {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  },

  warn(message: string, context?: StructuredLogContext): void {
    console.warn(
      JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  },

  error(message: string, context?: StructuredLogContext): void {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  },
};
