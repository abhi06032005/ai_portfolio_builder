// Helper to build success/error responses uniformly
export const ok = (data) => ({ success: true, data });
export const err = (error, details) => ({
    success: false,
    error,
    details,
});
