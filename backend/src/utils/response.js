export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
    }
}
export function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}
export function okResponse(c, data, status = 200) {
    return c.json({
        success: true,
        data,
    }, status);
}
export function errorResponse(message, status = 400, code = 'BAD_REQUEST') {
    return jsonResponse({
        success: false,
        error: {
            code,
            message,
        },
    }, status);
}
