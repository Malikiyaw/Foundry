import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function listFiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const files = await prisma.projectFile.findMany({
      where: { projectId: req.params.projectId as string },
      orderBy: { path: 'asc' },
    });
    res.json(files);
  } catch (error) {
    next(error);
  }
}

export async function getFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = await prisma.projectFile.findFirst({
      where: { id: req.params.fileId as string, projectId: req.params.projectId as string },
    });
    if (!file) throw new AppError(404, 'File not found');
    res.json(file);
  } catch (error) {
    next(error);
  }
}

export async function createFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { path, content, fileType } = req.body;
    if (!path) throw new AppError(400, 'File path is required');

    const existing = await prisma.projectFile.findUnique({
      where: { projectId_path: { projectId: req.params.projectId as string, path } },
    });
    if (existing) throw new AppError(409, 'File already exists at this path');

    const file = await prisma.projectFile.create({
      data: {
        projectId: req.params.projectId as string,
        path,
        content: content || '',
        fileType: fileType || 'code',
        hash: hashContent(content || ''),
      },
    });
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
}

export async function updateFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.projectFile.findFirst({
      where: { id: req.params.fileId as string, projectId: req.params.projectId as string },
    });
    if (!existing) throw new AppError(404, 'File not found');

    const updates: Record<string, unknown> = {};
    if (req.body.content !== undefined) {
      updates.content = req.body.content;
      updates.hash = hashContent(req.body.content);
    }
    if (req.body.path !== undefined) updates.path = req.body.path;
    if (req.body.fileType !== undefined) updates.fileType = req.body.fileType;

    const file = await prisma.projectFile.update({
      where: { id: req.params.fileId as string },
      data: updates,
    });

    // Broadcast file change via Socket.IO
    const io = (req.app.get('io') as any);
    if (io) {
      io.to(`project:${req.params.projectId as string}`).emit('file-updated', {
        filePath: file.path,
        content: file.content,
        userId: req.userId,
      });
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
}

export async function deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = await prisma.projectFile.findFirst({
      where: { id: req.params.fileId as string, projectId: req.params.projectId as string },
    });
    if (!file) throw new AppError(404, 'File not found');
    await prisma.projectFile.delete({ where: { id: req.params.fileId as string } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function renameFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { newPath } = req.body;
    if (!newPath) throw new AppError(400, 'New path is required');

    const existing = await prisma.projectFile.findFirst({
      where: { id: req.params.fileId as string, projectId: req.params.projectId as string },
    });
    if (!existing) throw new AppError(404, 'File not found');

    const conflict = await prisma.projectFile.findUnique({
      where: { projectId_path: { projectId: req.params.projectId as string, path: newPath } },
    });
    if (conflict) throw new AppError(409, 'A file already exists at the new path');

    const file = await prisma.projectFile.update({
      where: { id: req.params.fileId as string },
      data: { path: newPath },
    });
    res.json(file);
  } catch (error) {
    next(error);
  }
}

export async function batchUpdateFiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { files } = req.body;
    if (!Array.isArray(files)) throw new AppError(400, 'files must be an array');

    const results = [];
    for (const f of files) {
      const upserted = await prisma.projectFile.upsert({
        where: { projectId_path: { projectId: req.params.projectId as string, path: f.path } },
        update: { content: f.content, hash: hashContent(f.content || ''), fileType: f.fileType || 'code' },
        create: {
          projectId: req.params.projectId as string,
          path: f.path,
          content: f.content || '',
          fileType: f.fileType || 'code',
          isGenerated: f.isGenerated || false,
          hash: hashContent(f.content || ''),
        },
      });
      results.push(upserted);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
}

function hashContent(content: string): string {
  return crypto.createHash('md5').update(content || '').digest('hex');
}
