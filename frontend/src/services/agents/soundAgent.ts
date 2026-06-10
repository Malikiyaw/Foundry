import { BaseAgent, getKeyForProvider } from './baseAgent';
import { DesignDocument } from './designAgent';

interface GeneratedSound {
  filename: string;
  prompt: string;
  data: string;
}

export class SoundAgent extends BaseAgent {
  protected systemPrompt = 'You describe game sounds and music for text-to-sound generation.';

  async generate(
    userId: string,
    projectId: string,
    design: DesignDocument
  ): Promise<GeneratedSound[]> {
    const sounds: GeneratedSound[] = [];

    for (const sound of design.sounds) {
      if (sounds.length >= 4) break;
      // Sound generation from browser requires ElevenLabs API key with CORS
      // For now, we skip sound generation in browser mode
      continue;
    }

    return sounds;
  }
}
