import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listFiles, getFile, createFile, updateFile,
  deleteFile, renameFile, batchUpdateFiles,
} from '../controllers/fileController.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, listFiles);
router.post('/', authenticate, createFile);
router.post('/batch', authenticate, batchUpdateFiles);
router.get('/:fileId', authenticate, getFile);
router.put('/:fileId', authenticate, updateFile);
router.patch('/:fileId/rename', authenticate, renameFile);
router.delete('/:fileId', authenticate, deleteFile);

export default router;
