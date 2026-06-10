import { DesignAgent, DesignDocument } from './agents/designAgent';
import { CodingAgent, GeneratedFile } from './agents/codingAgent';
import { AssetAgent } from './agents/assetAgent';
import { SoundAgent } from './agents/soundAgent';
import { PlaytestAgent } from './agents/playtestAgent';

export interface GenerationResult {
  design: DesignDocument;
  files: GeneratedFile[];
  assets: { filename: string; prompt: string; data: string }[];
  sounds: { filename: string; prompt: string; data: string }[];
  playtestResults?: string;
}

export type GenerationStage = 'design' | 'coding' | 'assets' | 'sounds' | 'playtest';

export interface StageProgress {
  stage: GenerationStage;
  message: string;
  complete: boolean;
}

export class GameOrchestrator {
  async generateGame(
    userId: string,
    projectId: string,
    prompt: string,
    template: string,
    onProgress?: (progress: StageProgress) => void
  ): Promise<GenerationResult> {
    const designAgent = new DesignAgent();
    const codingAgent = new CodingAgent();
    const assetAgent = new AssetAgent();
    const soundAgent = new SoundAgent();
    const playtestAgent = new PlaytestAgent();

    onProgress?.({ stage: 'design', message: 'Designing your game...', complete: false });
    const design = await designAgent.generate(userId, projectId, prompt, template);
    onProgress?.({ stage: 'design', message: `Game design complete: "${design.title}"`, complete: true });

    onProgress?.({ stage: 'coding', message: 'Writing game code...', complete: false });
    const files = await codingAgent.generate(userId, projectId, design, template);
    onProgress?.({ stage: 'coding', message: `Generated ${files.length} source files`, complete: true });

    onProgress?.({ stage: 'assets', message: 'Creating placeholder assets...', complete: false });
    const assets = await assetAgent.generate(userId, projectId, design);
    onProgress?.({ stage: 'assets', message: `Created ${assets.length} assets`, complete: true });

    onProgress?.({ stage: 'sounds', message: 'Preparing sounds...', complete: false });
    const sounds = await soundAgent.generate(userId, projectId, design);
    onProgress?.({ stage: 'sounds', message: `${sounds.length > 0 ? `Generated ${sounds.length} sounds` : 'No sounds generated'}`, complete: true });

    onProgress?.({ stage: 'playtest', message: 'Reviewing code quality...', complete: false });
    const playtestResults = await playtestAgent.run(userId, projectId, files);
    onProgress?.({ stage: 'playtest', message: 'Playtest review complete', complete: true });

    return { design, files, assets, sounds, playtestResults };
  }

  async modifyProject(
    userId: string,
    projectId: string,
    instruction: string,
    existingFiles: { path: string; content: string }[]
  ): Promise<GeneratedFile[]> {
    const codingAgent = new CodingAgent();
    return codingAgent.modify(userId, projectId, instruction, existingFiles);
  }
}

export const gameOrchestrator = new GameOrchestrator();
