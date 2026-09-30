import { StructuredResume } from '../types/resume';
import { PortfolioContent } from '../types/portfolio';

export interface AIProvider {
  readonly name: string;

  /**
   * Stage 2: Convert raw resume text to strict StructuredResume JSON schema
   */
  generateStructuredResume(rawText: string): Promise<StructuredResume>;

  /**
   * Stage 3: Convert StructuredResume to high-converting, professional PortfolioContent JSON
   */
  generatePortfolioContent(
    resume: StructuredResume,
    themePreference?: string,
  ): Promise<PortfolioContent>;

  /**
   * Optional section improver (for targeted re-generations without re-doing the whole portfolio)
   */
  improveSection?(section: string, content: unknown): Promise<unknown>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly isTransient: boolean = false,
    public readonly statusCode?: number,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'AIProviderError';
  }
}
