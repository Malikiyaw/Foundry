import { BaseAgent } from './BaseAgent.js';
import { DesignDocument } from './DesignAgent.js';
import { callAIWithUserKey } from '../byokRelay.js';

interface GeneratedSound {
  filename: string;
  prompt: string;
  data: string; // base64-encoded audio data
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

      try {
        const soundPrompt = `Generate a game sound effect: ${sound.description}. Style: 8-bit, chiptune, game-ready.`;

        const response = await callAIWithUserKey(
          userId,
          'elevenlabs',
          {
            model: '21m00Tcm4TlvDq8ikWAM',
            prompt: soundPrompt,
          },
          projectId
        );

        sounds.push({
          filename: sound.filename,
          prompt: soundPrompt,
          data: response.content,
        });
      } catch {
        // Sound generation failed, skip
        continue;
      }
    }

    return sounds;
  }
}
