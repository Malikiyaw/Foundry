import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { exportZip, deploySubdomain, deployItchIo } from '../controllers/deployController.js';

const router = Router();

router.get('/projects/:projectId/export', authenticate, exportZip);
router.post('/projects/:projectId/deploy/subdomain', authenticate, deploySubdomain);
router.post('/projects/:projectId/deploy/itchio', authenticate, deployItchIo);

export default router;
