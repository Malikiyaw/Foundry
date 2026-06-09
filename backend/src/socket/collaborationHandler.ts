import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

interface CursorPosition {
  line: number;
  column: number;
}

interface EditAction {
  filePath: string;
  range: { startLine: number; startCol: number; endLine: number; endCol: number };
  text: string;
  origin?: string;
}

export function setupCollaborationHandler(io: Server): void {
  const collaborationNamespace = io.of('/collab');

  collaborationNamespace.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Collab connected: ${userId}`);

    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user-joined', { userId, socketId: socket.id });
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user-left', { userId });
    });

    socket.on('cursor-update', (data: { projectId: string; position: CursorPosition; filePath: string }) => {
      socket.to(`project:${data.projectId}`).emit('cursor-move', {
        userId,
        filePath: data.filePath,
        position: data.position,
      });
    });

    socket.on('file-edit', (data: { projectId: string; edit: EditAction }) => {
      socket.to(`project:${data.projectId}`).emit('remote-edit', {
        userId,
        edit: data.edit,
      });
    });

    socket.on('file-saved', (data: { projectId: string; filePath: string; content: string }) => {
      socket.to(`project:${data.projectId}`).emit('file-updated', {
        userId,
        filePath: data.filePath,
        content: data.content,
      });
    });

    socket.on('comment-added', (data: { projectId: string; comment: any }) => {
      socket.to(`project:${data.projectId}`).emit('new-comment', {
        userId,
        comment: data.comment,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Collab disconnected: ${userId}`);
    });
  });
}
