import { Router } from 'express';
import { listProjects, getProject, createProject, updateProject, deleteProject, forkProject } from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, listProjects);
router.post('/', authenticate, createProject);
router.get('/:id', authenticate, getProject);
router.patch('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);
router.post('/:id/fork', authenticate, forkProject);

export default router;
