import { PrismaClient } from '@prisma/client';
import { decrypt, hashKey } from './encryptionService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { callOpenAI } from './providers/openai.js';
import { callAnthropic } from './providers/anthropic.js';
import { callGoogle } from './providers/google.js';
import { callReplicate } from './providers/replicate.js';
import { callStability } from './providers/stability.js';
import { callElevenLabs } from './providers/elevenlabs.js';
import { callOpenRouter } from './providers/openrouter.js';

const prisma = new PrismaClient();

type ProviderName = 'openai' | 'anthropic' | 'google' | 'replicate' | 'stability' | 'elevenlabs' | 'openrouter' | 'custom';

interface ProviderCallOptions {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  imageData?: Buffer;
}

interface ProviderResponse {
  content: string;
  modelUsed: string;
  tokensUsed?: number;
  costUsd?: number;
}

const providerHandlers: Record<string, (apiKey: string, opts: ProviderCallOptions) => Promise<ProviderResponse>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  google: callGoogle,
  replicate: callReplicate,
  stability: callStability,
  elevenlabs: callElevenLabs,
  openrouter: callOpenRouter,
};

export async function callAIWithUserKey(
  userId: string,
  providerName: ProviderName,
  options: ProviderCallOptions,
  projectId?: string
): Promise<ProviderResponse> {
  const apiKey = await getBestKeyForUser(userId, providerName);

  if (!apiKey) {
    throw new AppError(402, `No active API key found for ${providerName}. Add one in Key Vault.`);
  }

  if (apiKey.monthlyBudgetUsd && Number(apiKey.usedThisMonth) >= Number(apiKey.monthlyBudgetUsd)) {
    throw new AppError(402, `Monthly budget of $${apiKey.monthlyBudgetUsd} exhausted for key "${apiKey.label}".`);
  }

  const decryptedKey = decrypt(apiKey.encryptedKey);

  const handler = providerHandlers[providerName] || callOpenAI;

  const startTime = Date.now();
  try {
    const response = await handler(decryptedKey, options);

    const costUsd = response.costUsd || estimateCost(providerName, response.tokensUsed || 0);

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        usedThisMonth: { increment: costUsd },
        lastUsed: new Date(),
      },
    });

    if (projectId) {
      await prisma.generation.create({
        data: {
          projectId,
          userId,
          prompt: options.prompt,
          modelUsed: response.modelUsed,
          provider: providerName,
          costUsd,
          tokensUsed: response.tokensUsed,
          succeeded: true,
        },
      });
    }

    logger.info('AI call succeeded', {
      provider: providerName,
      model: response.modelUsed,
      latency: Date.now() - startTime,
      cost: costUsd,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('AI call failed', { provider: providerName, error: errorMessage });

    if (projectId) {
      await prisma.generation.create({
        data: {
          projectId,
          userId,
          prompt: options.prompt,
          provider: providerName,
          succeeded: false,
          errorMessage,
        },
      });
    }

    throw new AppError(502, `AI provider ${providerName} returned an error: ${errorMessage}`);
  }
}

async function getBestKeyForUser(userId: string, providerName: ProviderName) {
  const keys = await prisma.apiKey.findMany({
    where: {
      userId,
      provider: providerName,
      isActive: true,
    },
    orderBy: { fallbackOrder: 'asc' },
  });

  if (keys.length === 0) return null;

  for (const key of keys) {
    if (key.monthlyBudgetUsd && Number(key.usedThisMonth) >= Number(key.monthlyBudgetUsd)) {
      continue;
    }
    return key;
  }

  return keys[0];
}

function estimateCost(provider: string, tokens: number): number {
  const rates: Record<string, number> = {
    openai: 0.00001,
    anthropic: 0.000015,
    google: 0.000008,
    openrouter: 0.00001,
  };
  return (rates[provider] || 0.00001) * tokens;
}
