import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { gameOrchestrator } from '../services/aiOrchestrator/index.js';

const prisma = new PrismaClient();

export async function generateGame(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { prompt, template } = req.body;
    const projectId = req.params.projectId as string;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await gameOrchestrator.generateGame(
      req.userId!,
      projectId,
      prompt,
      template || 'blank'
    );

    const files = await prisma.projectFile.findMany({
      where: { projectId },
    });

    res.json({
      design: result.design,
      files,
      newFiles: result.files,
      assets: result.assets,
      sounds: result.sounds,
      playtestResults: result.playtestResults,
    });
  } catch (error) {
    next(error);
  }
}

export async function modifyGame(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { instruction } = req.body;
    const projectId = req.params.projectId as string;

    if (!instruction) {
      res.status(400).json({ error: 'Instruction is required' });
      return;
    }

    const existingFiles = await prisma.projectFile.findMany({
      where: { projectId },
      select: { path: true, content: true },
    });

    const modifiedFiles = await gameOrchestrator.modifyProject(
      req.userId!,
      projectId,
      instruction,
      existingFiles
    );

    for (const file of modifiedFiles) {
      await prisma.projectFile.upsert({
        where: { projectId_path: { projectId, path: file.path } },
        update: { content: file.content, hash: hashContent(file.content) },
        create: {
          projectId,
          path: file.path,
          content: file.content,
          isGenerated: true,
          hash: hashContent(file.content),
        },
      });
    }

    const updatedFiles = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });

    res.json({ files: modifiedFiles, allFiles: updatedFiles });
  } catch (error) {
    next(error);
  }
}

export async function getGenerationHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await prisma.generation.findMany({
      where: { projectId: req.params.projectId as string },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
}

export async function getGenerationStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await prisma.generation.groupBy({
      by: ['provider', 'modelUsed'],
      where: { userId: req.userId },
      _count: { id: true },
      _sum: { costUsd: true, tokensUsed: true },
      orderBy: { _count: { id: 'desc' } },
    });
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < (content?.length || 0); i++) {
    hash = (hash * 31 + content.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}
