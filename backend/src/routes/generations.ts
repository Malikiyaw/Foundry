import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateGame, modifyGame, getGenerationHistory, getGenerationStats } from '../controllers/generationController.js';
import { generationLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/projects/:projectId/generate', authenticate, generationLimiter, generateGame);
router.post('/projects/:projectId/modify', authenticate, generationLimiter, modifyGame);
router.get('/projects/:projectId/history', authenticate, getGenerationHistory);
router.get('/stats', authenticate, getGenerationStats);

export default router;
