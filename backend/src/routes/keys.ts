import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listKeys, addKey, testKey, updateKey, deleteKey } from '../controllers/keyController.js';

const router = Router();

router.get('/', authenticate, listKeys);
router.post('/', authenticate, addKey);
router.post('/:id/test', authenticate, testKey);
router.patch('/:id', authenticate, updateKey);
router.delete('/:id', authenticate, deleteKey);

export default router;
