export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export function errorHandler(err, req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
}
// Wrap async route handlers to forward errors to errorHandler
export function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
