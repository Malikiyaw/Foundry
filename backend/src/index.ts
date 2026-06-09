import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { corsConfig } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { setupSocketIO } from './socket/index.js';
import { logger } from './utils/logger.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import fileRoutes from './routes/files.js';
import keyRoutes from './routes/keys.js';
import generationRoutes from './routes/generations.js';
import deploymentRoutes from './routes/deployment.js';
import assetRoutes from './routes/assets.js';
import galleryRoutes from './routes/gallery.js';
import collaborationRoutes from './routes/collaboration.js';

const app = express();
const server = http.createServer(app);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsConfig));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

const io = setupSocketIO(server);
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/files', fileRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api', generationRoutes);
app.use('/api', deploymentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/collaboration', collaborationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

server.listen(env.PORT, () => {
  logger.info(`Foundry backend running on port ${env.PORT}`);
  logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});

export default app;
