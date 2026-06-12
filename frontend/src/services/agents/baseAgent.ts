import { callAIProvider } from '../aiProviders';
import { db } from '../db';
import { getDecryptedKey } from '../../store/keysSlice';

export async function getKeyForProvider(provider: string): Promise<string | null> {
  const keys = await db.keys.where({ provider, isActive: true }).toArray();
  if (keys.length === 0) return null;
  return getDecryptedKey(keys[0].id);
}

export abstract class BaseAgent {
  protected abstract systemPrompt: string;

  async callAI(
    userId: string,
    projectId: string,
    prompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number; provider?: string } = {}
  ): Promise<string> {
    const provider = options.provider || 'openai';
    const apiKey = await getKeyForProvider(provider);
    if (!apiKey) throw new Error(`No active API key found for ${provider}. Add one in API Keys.`);

    return callAIProvider(provider, apiKey, prompt, this.systemPrompt);
  }

  protected extractCodeBlocks(text: string): string[] {
    const blocks: string[] = [];
    const regex = /```(?:\w+)?\n?([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks.length > 0 ? blocks : [text.trim()];
  }

  protected extractJson(text: string): Record<string, unknown> {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }
    return {};
  }
}
