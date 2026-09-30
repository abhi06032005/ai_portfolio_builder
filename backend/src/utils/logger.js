export const logger = {
    info(message, context) {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            message,
            ...context,
        }));
    },
    warn(message, context) {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...context,
        }));
    },
    error(message, context) {
        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            message,
            ...context,
        }));
    },
};
