import { callAIWithUserKey } from '../byokRelay.js';

export interface AgentOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export abstract class BaseAgent {
  protected abstract systemPrompt: string;

  async callAI(
    userId: string,
    projectId: string,
    prompt: string,
    options: AgentOptions = {}
  ): Promise<string> {
    const response = await callAIWithUserKey(
      userId,
      'openai',
      {
        model: options.model || 'gpt-4o',
        prompt,
        systemPrompt: this.systemPrompt,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens || 8192,
      },
      projectId
    );

    return response.content;
  }

  protected extractCodeBlocks(text: string): string[] {
    const blocks: string[] = [];
    const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
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
