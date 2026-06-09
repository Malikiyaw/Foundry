import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const { template, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = { isPublic: true };
    if (template) where.template = template;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true } },
          _count: { select: { files: true, remixes: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/visibility', async (req, res, next) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { isPublic: req.body.isPublic },
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

export default router;
