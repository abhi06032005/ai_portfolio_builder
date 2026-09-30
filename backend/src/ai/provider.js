export class AIProviderError extends Error {
    provider;
    isTransient;
    statusCode;
    constructor(message, provider, isTransient = false, statusCode) {
        super(`[${provider}] ${message}`);
        this.provider = provider;
        this.isTransient = isTransient;
        this.statusCode = statusCode;
        this.name = 'AIProviderError';
    }
}
