import { Server, Socket } from 'socket.io';
import { gameOrchestrator } from '../services/aiOrchestrator/index.js';
import { logger } from '../utils/logger.js';

export function setupGenerationHandler(io: Server): void {
  const genNamespace = io.of('/generation');

  genNamespace.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    socket.on('generate-game', async (data: { projectId: string; prompt: string; template: string }) => {
      try {
        socket.emit('generation-status', { stage: 'design', message: 'Analyzing your prompt...' });

        const result = await gameOrchestrator.generateGame(userId, data.projectId, data.prompt, data.template);

        socket.emit('generation-status', { stage: 'complete', message: 'Game generated successfully!' });
        socket.emit('generation-complete', {
          design: result.design,
          files: result.files,
          assets: result.assets.map((a) => ({ filename: a.filename, prompt: a.prompt })),
          playtestResults: result.playtestResults,
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Generation failed';
        logger.error('Generation error', { error: errMsg });
        socket.emit('generation-error', { error: errMsg });
      }
    });

    socket.on('modify-game', async (data: { projectId: string; instruction: string; files: { path: string; content: string }[] }) => {
      try {
        socket.emit('generation-status', { stage: 'modifying', message: 'Applying changes...' });

        const modifiedFiles = await gameOrchestrator.modifyProject(
          userId,
          data.projectId,
          data.instruction,
          data.files
        );

        socket.emit('modification-complete', { files: modifiedFiles });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Modification failed';
        socket.emit('generation-error', { error: errMsg });
      }
    });

    socket.on('regenerate-file', async (data: { projectId: string; filePath: string; context: string }) => {
      try {
        const content = await gameOrchestrator.regenerateFile(
          userId,
          data.projectId,
          data.filePath,
          data.context
        );
        socket.emit('file-regenerated', { filePath: data.filePath, content });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Regeneration failed';
        socket.emit('generation-error', { error: errMsg });
      }
    });
  });
}
