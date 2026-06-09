import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { setupCollaborationHandler } from './collaborationHandler.js';
import { setupGenerationHandler } from './generationHandler.js';
import { logger } from '../utils/logger.js';

let io: Server;

export function setupSocketIO(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as { userId: string; email: string };
      (socket as any).userId = decoded.userId;
      (socket as any).email = decoded.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: ${userId} (${socket.id})`);

    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${userId} joined project ${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  setupCollaborationHandler(io);
  setupGenerationHandler(io);

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
