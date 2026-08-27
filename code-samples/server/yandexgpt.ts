/**
 * YANDEXGPT INTEGRATION MODULE
 * Простая интеграция для ИИ-рекомендаций блоков СУП
 */

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
  inn: string;
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
  private catalogId: string;
  private modelUri: string;
  private apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

  constructor(config: YandexGPTConfig) {
    this.apiKey = config.apiKey;
    this.catalogId = config.catalogId;
    this.modelUri = config.modelUri || `gpt://${this.catalogId}/yandexgpt-lite`;
  }

  async getBlockRecommendation(
    organization: OrganizationContext,
    block: SupBlock
  ): Promise<AIRecommendation> {
    const prompt = this.buildPrompt(organization, block);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          modelUri: this.modelUri,
          completionOptions: {
            stream: false,
            temperature: 0.3,
            maxTokens: 500,
          },
          messages: [
            {
              role: 'system',
              text: 'Ты — эксперт-аудитор по бухгалтерскому учету в государственных учреждениях России. Твоя задача — анализировать блоки СУП и давать рекомендации. Отвечай ТОЛЬКО в формате JSON без дополнительного текста.',
            },
            {
              role: 'user',
              text: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`YandexGPT API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiText = data.result.alternatives[0].message.text;
      const parsed = this.parseAIResponse(aiText);

      return {
        blockId: block.id,
        recommendation: parsed.recommendation,
        reason: parsed.reason,
      };
    } catch (error) {
      console.error(`Error getting AI recommendation for block ${block.number}:`, error);
      return {
        blockId: block.id,
        recommendation: 'optional',
        reason: 'Не удалось получить рекомендацию от ИИ. Обратитесь к специалисту.',
      };
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
      const batchPromises = batch.map((block) =>
        this.getBlockRecommendation(organization, block)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < blocks.length) {
        await this.delay(200);
      }
    }

    return results;
  }

  private buildPrompt(organization: OrganizationContext, block: SupBlock): string {
    return `[ДАННЫЕ ОБ ОРГАНИЗАЦИИ]
{
  "name": "${organization.name}",
  "inn": "${organization.inn}",
  "industry": "${organization.industry}",
  "account_type": "${organization.accountType}"
}

[ДАННЫЕ О БЛОКЕ СУП]
{
  "number": "${block.number}",
  "title": "${block.title}",
  "text": "${block.text.substring(0, 500)}..."
}

[ЗАДАЧА]
Оцени этот блок СУП для указанной организации. Определи его статус: "mandatory" (обязательный), "recommended" (рекомендуемый) или "optional" (опциональный). Дай краткое обоснование (1-2 предложения).

[ФОРМАТ ОТВЕТА]
Верни JSON:
{
  "recommendation": "mandatory" | "recommended" | "optional",
  "reason": "краткое обоснование"
}`;
  }

  private parseAIResponse(text: string): { recommendation: 'mandatory' | 'recommended' | 'optional'; reason: string } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        let recommendation: 'mandatory' | 'recommended' | 'optional' = 'optional';
        if (parsed.recommendation === 'mandatory' || parsed.recommendation === 'обязательный') {
          recommendation = 'mandatory';
        } else if (parsed.recommendation === 'recommended' || parsed.recommendation === 'рекомендуемый') {
          recommendation = 'recommended';
        }

        return {
          recommendation,
          reason: parsed.reason || 'Нет обоснования',
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    return {
      recommendation: 'optional',
      reason: 'Не удалось обработать ответ ИИ',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

let yandexGPTInstance: YandexGPTService | null = null;

export function initYandexGPT(config: YandexGPTConfig): void {
  yandexGPTInstance = new YandexGPTService(config);
}

export function getYandexGPT(): YandexGPTService {
  if (!yandexGPTInstance) {
    throw new Error('YandexGPT service not initialized. Call initYandexGPT() first.');
  }
  return yandexGPTInstance;
}

export function isYandexGPTInitialized(): boolean {
  return yandexGPTInstance !== null;
}

export type { YandexGPTConfig, AIRecommendation, OrganizationContext, SupBlock };
