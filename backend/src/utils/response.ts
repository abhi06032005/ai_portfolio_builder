import { Context } from 'hono';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function jsonResponse<T>(data: T, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function okResponse<T>(c: Context<any>, data: T, status = 200): Response {
  return c.json(
    {
      success: true,
      data,
    },
    status as any,
  );
}

export function errorResponse(message: string, status = 400, code = 'BAD_REQUEST'): Response {
  return jsonResponse(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    status,
  );
}
