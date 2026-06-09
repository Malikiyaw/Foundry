import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { encrypt, hashKey } from '../services/encryptionService.js';
import { callOpenAI } from '../services/providers/openai.js';

const prisma = new PrismaClient();

export async function listKeys(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        label: true,
        provider: true,
        monthlyBudgetUsd: true,
        usedThisMonth: true,
        lastUsed: true,
        isActive: true,
        fallbackOrder: true,
        createdAt: true,
      },
      orderBy: [{ fallbackOrder: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(keys);
  } catch (error) {
    next(error);
  }
}

export async function addKey(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { label, provider, key: apiKeyValue, monthlyBudgetUsd, fallbackOrder } = req.body;

    if (!label || !provider || !apiKeyValue) {
      throw new AppError(400, 'label, provider, and key are required');
    }

    const encryptedKey = encrypt(apiKeyValue);
    const keyHash = hashKey(apiKeyValue);

    const newKey = await prisma.apiKey.create({
      data: {
        userId: req.userId!,
        label,
        provider,
        encryptedKey,
        keyHash,
        monthlyBudgetUsd: monthlyBudgetUsd ? parseFloat(monthlyBudgetUsd) : null,
        fallbackOrder: fallbackOrder || 0,
      },
      select: {
        id: true,
        label: true,
        provider: true,
        monthlyBudgetUsd: true,
        usedThisMonth: true,
        lastUsed: true,
        isActive: true,
        fallbackOrder: true,
        createdAt: true,
      },
    });

    res.status(201).json(newKey);
  } catch (error) {
    next(error);
  }
}

export async function testKey(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const keyRecord = await prisma.apiKey.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!keyRecord) throw new AppError(404, 'Key not found');

    const { decrypt } = await import('../services/encryptionService.js');
    const decryptedKey = decrypt(keyRecord.encryptedKey);

    let valid = false;
    let balanceInfo = '';

    try {
      const response = await callOpenAI(decryptedKey, {
        model: 'gpt-4o-mini',
        prompt: 'Respond with only the word "ok".',
        maxTokens: 10,
        temperature: 0,
      });

      if (response.content.trim().toLowerCase().includes('ok')) {
        valid = true;
        balanceInfo = `Responded with ${response.tokensUsed} tokens used`;
      }
    } catch (e) {
      valid = false;
      balanceInfo = e instanceof Error ? e.message : 'Key test failed';
    }

    res.json({ valid, balanceInfo });
  } catch (error) {
    next(error);
  }
}

export async function updateKey(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.apiKey.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!existing) throw new AppError(404, 'Key not found');

    const updates: Record<string, unknown> = {};
    if (req.body.label !== undefined) updates.label = req.body.label;
    if (req.body.monthlyBudgetUsd !== undefined) updates.monthlyBudgetUsd = parseFloat(req.body.monthlyBudgetUsd);
    if (req.body.fallbackOrder !== undefined) updates.fallbackOrder = req.body.fallbackOrder;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    if (req.body.key) {
      updates.encryptedKey = encrypt(req.body.key);
      updates.keyHash = hashKey(req.body.key);
    }

    const updated = await prisma.apiKey.update({
      where: { id: req.params.id as string },
      data: updates,
      select: {
        id: true, label: true, provider: true, monthlyBudgetUsd: true,
        usedThisMonth: true, isActive: true, fallbackOrder: true, lastUsed: true,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteKey(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const key = await prisma.apiKey.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!key) throw new AppError(404, 'Key not found');
    await prisma.apiKey.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
