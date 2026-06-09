import { BaseAgent } from './BaseAgent.js';

export interface DesignDocument {
  title: string;
  description: string;
  engine: string;
  files: { path: string; description: string }[];
  assets: { type: string; description: string; filename: string }[];
  sounds: { type: string; description: string; filename: string }[];
  gameConfig: Record<string, unknown>;
}

const TEMPLATE_PROMPTS: Record<string, string> = {
  platformer: 'a 2D side-scrolling platformer game with player movement, jumping, enemies, and collectibles',
  rpg: 'a top-down 2D RPG with player movement, NPCs, dialogue, and inventory',
  runner: 'an endless runner game with obstacles, scoring, and increasing difficulty',
  match3: 'a match-3 puzzle game with grid swapping and combo mechanics',
  visualnovel: 'a visual novel with character sprites, dialogue choices, and branching paths',
  card: 'a card battle game with deck management and turn-based combat',
  blank: 'a game',
};

export class DesignAgent extends BaseAgent {
  protected systemPrompt = `You are a senior game designer. Given a user's prompt and a game template, you produce a detailed game design document in JSON format.
Output ONLY valid JSON with this structure:
{
  "title": "Game title",
  "description": "Short description",
  "engine": "phaser" | "kaboom",
  "files": [{"path": "src/main.js", "description": "Entry point, creates Phaser game config"}],
  "assets": [{"type": "sprite|tilemap|background", "description": "What the asset looks like", "filename": "player.png"}],
  "sounds": [{"type": "sfx|music", "description": "Sound description", "filename": "jump.wav"}],
  "gameConfig": {"width": 800, "height": 600, "physics": { "gravity": { "y": 800 } }}
}

Include ALL files needed: index.html, style.css, src/main.js, src/Player.js, src/Enemy.js, src/Collectible.js, src/UI.js. Each must have a meaningful description. Do NOT wrap in markdown.`; //";

  async generate(
    userId: string,
    projectId: string,
    prompt: string,
    template: string
  ): Promise<DesignDocument> {
    const templateDesc = TEMPLATE_PROMPTS[template] || TEMPLATE_PROMPTS.blank;
    const fullPrompt = `User wants to make ${templateDesc}.
Their specific request: "${prompt}"

Produce a complete game design document as JSON. Include every file needed, all assets, all sounds, and the Phaser game configuration.`;

    const response = await this.callAI(userId, projectId, fullPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    });

    let design: DesignDocument;
    try {
      design = JSON.parse(response) as DesignDocument;
    } catch {
      const extracted = this.extractJson(response);
      design = extracted as unknown as DesignDocument;
    }

    return this.validateDesign(design, template);
  }

  private validateDesign(design: Partial<DesignDocument>, template: string): DesignDocument {
    const defaultFiles = [
      { path: 'index.html', description: 'HTML entry point' },
      { path: 'style.css', description: 'Game styles' },
      { path: 'src/main.js', description: 'Main game config and scene' },
      { path: 'src/Player.js', description: 'Player character class' },
    ];

    return {
      title: design.title || `${template}-game`,
      description: design.description || `A ${template} game`,
      engine: design.engine || 'phaser',
      files: design.files && design.files.length > 0 ? design.files : defaultFiles,
      assets: design.assets || [],
      sounds: design.sounds || [],
      gameConfig: design.gameConfig || { width: 800, height: 600 },
    };
  }
}
