import { BaseAgent, getKeyForProvider } from './baseAgent';
import { DesignDocument } from './designAgent';

interface GeneratedAsset {
  filename: string;
  prompt: string;
  data: string;
}

export class AssetAgent extends BaseAgent {
  protected systemPrompt = 'You describe game assets (sprites, backgrounds, tilemaps) in vivid detail for AI image generation.';

  async generate(
    userId: string,
    projectId: string,
    design: DesignDocument
  ): Promise<GeneratedAsset[]> {
    const assets: GeneratedAsset[] = [];

    const stabilityKey = await getKeyForProvider('stability');

    for (const asset of design.assets) {
      const svgData = this.generatePlaceholderSVG(asset.description, asset.filename);
      assets.push({
        filename: asset.filename,
        prompt: asset.description,
        data: btoa(svgData),
      });
    }

    if (assets.length === 0) {
      const defaultAssets = [
        { type: 'sprite', description: 'player character', filename: 'player.png' },
        { type: 'sprite', description: 'enemy character', filename: 'enemy.png' },
        { type: 'background', description: 'game background with sky and ground', filename: 'background.png' },
      ];

      for (const asset of defaultAssets) {
        const svgData = this.generatePlaceholderSVG(asset.description, asset.filename);
        assets.push({
          filename: asset.filename,
          prompt: asset.description,
          data: btoa(svgData),
        });
      }
    }

    return assets;
  }

  private generatePlaceholderSVG(description: string, filename: string): string {
    const isBackground = filename.includes('background');
    const width = isBackground ? 800 : 64;
    const height = isBackground ? 600 : 64;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
    const color = colors[Math.abs(this.hashCode(filename)) % colors.length];

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${color}" rx="4"/>
  <text x="${width / 2}" y="${height / 2 + 6}" text-anchor="middle" fill="white" font-size="12" font-family="monospace">${description}</text>
</svg>`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}
