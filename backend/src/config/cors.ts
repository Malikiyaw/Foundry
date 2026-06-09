import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsConfig: CorsOptions = {
  origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
