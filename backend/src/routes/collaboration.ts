import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/projects/:projectId/members', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const members = await prisma.collaboration.findMany({
      where: { projectId: req.params.projectId as string },
      include: { user: { select: { id: true, email: true, displayName: true, avatarUrl: true } } },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

router.post('/projects/:projectId/invite', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { email, permission } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existing = await prisma.collaboration.findUnique({
      where: { projectId_userId: { projectId: req.params.projectId as string, userId: user.id } },
    });
    if (existing) {
      res.status(409).json({ error: 'User already a collaborator' });
      return;
    }

    const collab = await prisma.collaboration.create({
      data: {
        projectId: req.params.projectId as string,
        userId: user.id,
        permission: permission || 'edit',
        invitedBy: req.userId!,
      },
    });
    res.status(201).json(collab);
  } catch (error) {
    next(error);
  }
});

router.delete('/projects/:projectId/members/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.collaboration.delete({
      where: { projectId_userId: { projectId: req.params.projectId as string, userId: req.params.userId as string } },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
