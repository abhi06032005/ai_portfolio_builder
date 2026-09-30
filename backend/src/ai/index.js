import { AIProviderError } from './provider';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { logger } from '../utils/logger';
export * from './provider';
export * from './openai';
export * from './gemini';
export * from './groq';
export class ResilientAIService {
    env;
    primaryProvider;
    fallbackProvider;
    constructor(env) {
        this.env = env;
        const primaryName = (env.PRIMARY_AI_PROVIDER || 'openai').toLowerCase();
        const fallbackName = env.FALLBACK_AI_PROVIDER?.toLowerCase();
        this.primaryProvider = this.instantiateProvider(primaryName);
        if (fallbackName && fallbackName !== primaryName) {
            try {
                this.fallbackProvider = this.instantiateProvider(fallbackName);
            }
            catch (err) {
                logger.warn(`Could not instantiate fallback provider (${fallbackName}): ${err.message}`);
            }
        }
    }
    instantiateProvider(name) {
        switch (name) {
            case 'openai':
                if (!this.env.OPENAI_API_KEY) {
                    throw new Error('OPENAI_API_KEY is not configured in environment');
                }
                return new OpenAIProvider(this.env.OPENAI_API_KEY);
            case 'gemini':
                if (!this.env.GEMINI_API_KEY) {
                    throw new Error('GEMINI_API_KEY is not configured in environment');
                }
                return new GeminiProvider(this.env.GEMINI_API_KEY);
            case 'groq':
                if (!this.env.GROQ_API_KEY) {
                    throw new Error('GROQ_API_KEY is not configured in environment');
                }
                return new GroqProvider(this.env.GROQ_API_KEY);
            default:
                throw new Error(`Unsupported AI provider: ${name}`);
        }
    }
    /**
     * Executes an AI operation with automatic fallback on transient failure (Section 16)
     */
    async executeWithFallback(operationName, fn) {
        try {
            const data = await fn(this.primaryProvider);
            return { data, providerUsed: this.primaryProvider.name };
        }
        catch (err) {
            const isTransient = err instanceof AIProviderError ? err.isTransient : true;
            // Only attempt fallback if error is transient and fallback is configured
            if (this.fallbackProvider && isTransient) {
                logger.warn(`Primary AI provider (${this.primaryProvider.name}) failed with transient error for ${operationName}. Switching to fallback provider (${this.fallbackProvider.name}).`, { error: err.message });
                const data = await fn(this.fallbackProvider);
                return { data, providerUsed: this.fallbackProvider.name };
            }
            throw err;
        }
    }
    async generateStructuredResume(rawText) {
        const res = await this.executeWithFallback('generateStructuredResume', (p) => p.generateStructuredResume(rawText));
        return { resume: res.data, provider: res.providerUsed };
    }
    async generatePortfolioContent(resume, theme) {
        const res = await this.executeWithFallback('generatePortfolioContent', (p) => p.generatePortfolioContent(resume, theme));
        return { content: res.data, provider: res.providerUsed };
    }
}
