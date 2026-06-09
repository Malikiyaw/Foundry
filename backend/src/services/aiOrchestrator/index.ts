import { DesignAgent, DesignDocument } from './DesignAgent.js';
import { CodingAgent, GeneratedFile } from './CodingAgent.js';
import { AssetAgent } from './AssetAgent.js';
import { SoundAgent } from './SoundAgent.js';
import { PlaytestAgent } from './PlaytestAgent.js';
import { callAIWithUserKey } from '../byokRelay.js';
import { logger } from '../../utils/logger.js';

export interface GenerationResult {
  design: DesignDocument;
  files: GeneratedFile[];
  assets: { filename: string; prompt: string; data: string }[];
  sounds: { filename: string; prompt: string; data: string }[];
  playtestResults?: string;
}

export class GameOrchestrator {
  async generateGame(
    userId: string,
    projectId: string,
    prompt: string,
    template: string
  ): Promise<GenerationResult> {
    logger.info('Starting game generation', { userId, projectId, template });

    const designAgent = new DesignAgent();
    const design = await designAgent.generate(userId, projectId, prompt, template);

    const codingAgent = new CodingAgent();
    const files = await codingAgent.generate(userId, projectId, design, template);

    const assetAgent = new AssetAgent();
    const assets = await assetAgent.generate(userId, projectId, design);

    const soundAgent = new SoundAgent();
    const sounds = await soundAgent.generate(userId, projectId, design);

    const playtestAgent = new PlaytestAgent();
    const playtestResults = await playtestAgent.run(userId, projectId, files);

    return { design, files, assets, sounds, playtestResults };
  }

  async modifyProject(
    userId: string,
    projectId: string,
    instruction: string,
    existingFiles: { path: string; content: string }[]
  ): Promise<GeneratedFile[]> {
    logger.info('Modifying project', { userId, projectId, instruction });

    const codingAgent = new CodingAgent();
    return codingAgent.modify(userId, projectId, instruction, existingFiles);
  }

  async regenerateFile(
    userId: string,
    projectId: string,
    filePath: string,
    context: string
  ): Promise<string> {
    logger.info('Regenerating file', { userId, projectId, filePath });

    const prompt = `Regenerate the file "${filePath}" for a game project. ${context}\n\nOutput only the file contents, no markdown or explanation.`;
    const response = await callAIWithUserKey(userId, 'openai', {
      model: 'gpt-4o',
      prompt,
      systemPrompt: 'You are a game development expert. Output only the raw file content.',
      temperature: 0.3,
    }, projectId);

    return response.content;
  }

  async generatePlaytestReport(
    userId: string,
    projectId: string,
    files: { path: string; content: string }[]
  ): Promise<string> {
    const playtestAgent = new PlaytestAgent();
    return playtestAgent.run(userId, projectId, files);
  }
}

export const gameOrchestrator = new GameOrchestrator();
