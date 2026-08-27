interface YandexGPTConfig {
  apiKey: string;
  catalogId: string;
  modelUri?: string;
}

interface AIRecommendation {
  blockId: number;
  recommendation: 'mandatory' | 'recommended' | 'optional';
  reason: string;
}

interface OrganizationContext {
  name: string;
  industry: string;
  accountType: string;
}

interface SupBlock {
  id: number;
  number: string;
  title: string;
  text: string;
}

class YandexGPTService {
  private apiKey: string;
  private modelUri: string;
  private apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

  constructor(config: YandexGPTConfig) {
    this.apiKey = config.apiKey;
    this.modelUri = config.modelUri ?? `gpt://${config.catalogId}/yandexgpt-lite`;
  }

  async getBlockRecommendation(
    organization: OrganizationContext,
    block: SupBlock
  ): Promise<AIRecommendation | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Api-Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          modelUri: this.modelUri,
          completionOptions: {
            stream: false,
            temperature: 0.2,
            maxTokens: 300,
          },
          messages: [
            {
              role: 'system',
              text: 'Проанализируй применимость блока СУП к указанной организации. Верни только JSON с полями recommendation и reason. recommendation: mandatory, recommended или optional.',
            },
            {
              role: 'user',
              text: this.buildPrompt(organization, block),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`YandexGPT API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data?.result?.alternatives?.[0]?.message?.text;
      if (typeof text !== 'string') {
        throw new Error('YandexGPT response does not contain message text');
      }

      const parsed = this.parseResponse(text);
      if (!parsed) return null;

      return {
        blockId: block.id,
        recommendation: parsed.recommendation,
        reason: parsed.reason,
      };
    } catch (error) {
      console.error(`Recommendation failed for block ${block.number}:`, error);
      return null;
    }
  }

  async getBulkRecommendations(
    organization: OrganizationContext,
    blocks: SupBlock[]
  ): Promise<AIRecommendation[]> {
    const batchSize = 5;
    const results: AIRecommendation[] = [];

    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(block => this.getBlockRecommendation(organization, block))
      );

      results.push(...batchResults.filter((item): item is AIRecommendation => item !== null));

      if (i + batchSize < blocks.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  private buildPrompt(organization: OrganizationContext, block: SupBlock): string {
    return JSON.stringify(
      {
        organization: {
          name: organization.name,
          industry: organization.industry,
          accountType: organization.accountType,
        },
        block: {
          number: block.number,
          title: block.title,
          text: block.text.slice(0, 1200),
        },
      },
      null,
      2
    );
  }

  private parseResponse(
    text: string
  ): { recommendation: AIRecommendation['recommendation']; reason: string } | null {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      const allowed = new Set(['mandatory', 'recommended', 'optional']);

      if (!allowed.has(parsed.recommendation) || typeof parsed.reason !== 'string') {
        return null;
      }

      return {
        recommendation: parsed.recommendation,
        reason: parsed.reason.trim(),
      };
    } catch {
      return null;
    }
  }
}

let yandexGPTInstance: YandexGPTService | null = null;

export function initYandexGPT(config: YandexGPTConfig): void {
  yandexGPTInstance = new YandexGPTService(config);
}

export function getYandexGPT(): YandexGPTService {
  if (!yandexGPTInstance) {
    throw new Error('YandexGPT service is not initialized');
  }

  return yandexGPTInstance;
}

export function isYandexGPTInitialized(): boolean {
  return yandexGPTInstance !== null;
}

export type { YandexGPTConfig, AIRecommendation, OrganizationContext, SupBlock };
