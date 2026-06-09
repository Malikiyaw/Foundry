import { BaseAgent } from './BaseAgent.js';
import { GeneratedFile } from './CodingAgent.js';

export class PlaytestAgent extends BaseAgent {
  protected systemPrompt = `You are a game playtester. Review the game code and identify:
1. Bugs or errors that would prevent the game from running
2. Missing files or imports
3. Gameplay balance issues
4. Suggestions for improvement

Be specific and reference line numbers or file paths.`;

  async run(
    userId: string,
    projectId: string,
    files: GeneratedFile[]
  ): Promise<string> {
    const filesContext = files
      .map((f) => `--- ${f.path} ---\n${f.content}`)
      .join('\n\n');

    const prompt = `Review this game code for bugs and issues:

${filesContext}

Provide a structured report: bugs, missing files, gameplay issues, and improvement suggestions.`;

    const response = await this.callAI(userId, projectId, prompt, {
      temperature: 0.3,
      maxTokens: 2048,
    });

    return response;
  }
}
