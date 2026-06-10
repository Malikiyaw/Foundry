import { BaseAgent } from './baseAgent';
import { DesignDocument } from './designAgent';

export interface GeneratedFile {
  path: string;
  content: string;
}

const TEMPLATE_ENGINES: Record<string, string> = {
  phaser: 'Phaser 3 (CDN: https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js)',
  kaboom: 'Kaboom.js (CDN: https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs)',
};

const ENGINE_CDN: Record<string, string> = {
  phaser: 'https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js',
  kaboom: 'https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs',
};

export class CodingAgent extends BaseAgent {
  protected systemPrompt = `You are a senior game developer specializing in browser-based game development with Phaser 3 and Kaboom.js.
You write complete, runnable game code. Every file must be production-quality, fully implemented, and ready to run in a browser.

Rules:
- Use ES modules or plain script tags as appropriate.
- The game must work in an iframe.
- index.html must load the engine CDN and your scripts.
- All game logic must be in separate JS files organized in src/.
- The game must have actual player controls (arrow keys / WASD), scoring, and game states.
- Include a restart mechanism (e.g., press R to restart or game over screen).
- Output each file wrapped in triple backticks with the path as a comment: /* FILE: path/to/file.js */
- Do NOT use placeholders. Fill in all game mechanics.
- The game must be fun and playable immediately.`;

  async generate(
    userId: string,
    projectId: string,
    design: DesignDocument,
    template: string
  ): Promise<GeneratedFile[]> {
    const engineInfo = TEMPLATE_ENGINES[design.engine] || TEMPLATE_ENGINES.phaser;

    const filesList = design.files.map((f) => `- ${f.path}: ${f.description}`).join('\n');
    const assetsInfo = design.assets.map((a) => `- ${a.filename} (${a.type}): ${a.description}`).join('\n');
    const gameConfig = JSON.stringify(design.gameConfig, null, 2);

    const prompt = `Generate a complete game using ${engineInfo}.

Game Design:
- Title: ${design.title}
- Description: ${design.description}
- Template: ${template}
- Config: ${gameConfig}

Required files:
${filesList}

Assets (generate colored rectangles as placeholder sprites if real assets aren't available):
${assetsInfo}

Generate each file with the comment /* FILE: path/to/file.js */ at the top. The game MUST be fully playable.`;

    const response = await this.callAI(userId, projectId, prompt, {
      temperature: 0.4,
      maxTokens: 16384,
    });

    return this.parseGeneratedFiles(response, design.engine);
  }

  async modify(
    userId: string,
    projectId: string,
    instruction: string,
    existingFiles: { path: string; content: string }[]
  ): Promise<GeneratedFile[]> {
    const filesContext = existingFiles
      .map((f) => `/* FILE: ${f.path} */\n${f.content}`)
      .join('\n\n');

    const prompt = `User wants to modify their game with this instruction: "${instruction}"

Current project files:
${filesContext}

Apply the user's modification. Output the FULL content of any files that need changes, with the /* FILE: path */ marker. If no changes are needed for a file, omit it. Ensure the game remains fully playable.`;

    const response = await this.callAI(userId, projectId, prompt, {
      temperature: 0.3,
      maxTokens: 16384,
    });

    return this.parseGeneratedFiles(response, 'phaser');
  }

  private parseGeneratedFiles(response: string, engine: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const fileRegex = /\/\*\s*FILE:\s*([^\s*]+)\s*\*\/\s*([\s\S]*?)(?=\/\*\s*FILE:|$)/g;
    let match;

    while ((match = fileRegex.exec(response)) !== null) {
      const path = match[1].trim();
      let content = match[2].trim();

      content = content.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();

      if (path && content) {
        files.push({ path, content });
      }
    }

    if (files.length === 0) {
      const blocks = this.extractCodeBlocks(response);
      const defaultPaths = ['src/main.js', 'src/Player.js', 'src/Enemy.js', 'style.css', 'index.html'];
      blocks.forEach((content, i) => {
        files.push({
          path: defaultPaths[i] || `src/generated_${i}.js`,
          content,
        });
      });
    }

    if (!files.find((f) => f.path === 'index.html')) {
      const cdnUrl = ENGINE_CDN[engine] || ENGINE_CDN.phaser;
      files.unshift({
        path: 'index.html',
        content: this.generateDefaultHtml(engine, cdnUrl, files),
      });
    }

    return files;
  }

  private generateDefaultHtml(engine: string, cdnUrl: string, files: GeneratedFile[]): string {
    const scripts = files
      .filter((f) => f.path.endsWith('.js'))
      .map((f) => `    <script src="${f.path}"></script>`)
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundry Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container"></div>
  <script src="${cdnUrl}"></script>
${scripts}
</body>
</html>`;
  }
}
