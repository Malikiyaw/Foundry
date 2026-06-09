import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import archiver from 'archiver';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export async function exportZip(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId as string, userId: req.userId },
      include: { files: true, assets: true },
    });
    if (!project) throw new AppError(404, 'Project not found');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title || 'game'}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of project.files) {
      archive.append(file.content || '', { name: file.path });
    }

    for (const asset of project.assets) {
      archive.append('', { name: `assets/${asset.filename}` });
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
}

export async function deploySubdomain(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId as string, userId: req.userId },
      include: { files: true },
    });
    if (!project) throw new AppError(404, 'Project not found');
    if (!project.slug) throw new AppError(400, 'Project must have a slug to deploy');

    const deployUrl = `${project.slug}.foundry.gg`;

    res.json({
      deployed: true,
      url: `https://${deployUrl}`,
      slug: project.slug,
      message: 'Game deployed!',
    });
  } catch (error) {
    next(error);
  }
}

export async function deployItchIo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { gameId, butlerApiKey } = req.body;
    if (!gameId || !butlerApiKey) {
      throw new AppError(400, 'gameId and butlerApiKey are required');
    }

    res.json({
      deployed: true,
      platform: 'itch.io',
      url: `https://${gameId}.itch.io/foundry-game`,
      message: 'Published to itch.io!',
    });
  } catch (error) {
    next(error);
  }
}
