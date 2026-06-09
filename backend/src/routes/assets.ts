import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/projects/:projectId', authenticate, async (req, res) => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const assets = await prisma.asset.findMany({ where: { projectId: req.params.projectId as string } });
  res.json(assets);
});

router.post('/projects/:projectId', authenticate, async (req, res) => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const asset = await prisma.asset.create({
    data: { ...req.body, projectId: req.params.projectId as string },
  });
  res.status(201).json(asset);
});

router.delete('/:id', authenticate, async (req, res) => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.asset.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;
