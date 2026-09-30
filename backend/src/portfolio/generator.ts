import { ResilientAIService } from '../ai';
import { DbService } from '../db/client';
import { StructuredResume } from '../types/resume';
import { PortfolioContent } from '../types/portfolio';
import { validatePortfolioContent } from './validator';
import { logger } from '../utils/logger';

export class PortfolioGenerator {
  constructor(
    private aiService: ResilientAIService,
    private dbService: DbService,
  ) {}

  /**
   * Stage 3 & 4 & 5:
   * Structured resume JSON -> portfolio content JSON -> validation -> save to D1 atomically
   */
  async generateAndPersist(params: {
    userId: string;
    resumeId: string;
    resumeData: StructuredResume;
    theme?: string;
  }): Promise<{
    portfolioId: string;
    versionId: string;
    content: PortfolioContent;
    providerUsed: string;
  }> {
    const { userId, resumeId, resumeData, theme = 'minimal' } = params;

    logger.info('Generating portfolio content from structured resume', {
      userId,
      resumeId,
      theme,
    });

    // 1. Stage 3: AI generation of portfolio content
    const { content, provider } = await this.aiService.generatePortfolioContent(
      resumeData,
      theme,
    );

    // 2. Stage 4: Validation (strict schema verification + repair if needed)
    const valResult = validatePortfolioContent(JSON.stringify(content));
    if (!valResult.success || !valResult.data) {
      throw new Error(`Generated portfolio content failed schema validation: ${valResult.error}`);
    }

    const validatedContent = valResult.data;

    // 3. Stage 5: Save to D1 atomically (portfolio + version)
    // Section 21: Never mark completed before portfolio data has successfully persisted
    const { portfolioId, versionId } = await this.dbService.savePortfolioAndVersion({
      userId,
      resumeId,
      portfolioDataJson: JSON.stringify(validatedContent),
      theme,
    });

    logger.info('Successfully saved portfolio version to D1', {
      portfolioId,
      versionId,
      provider,
    });

    return {
      portfolioId,
      versionId,
      content: validatedContent,
      providerUsed: provider,
    };
  }
}
