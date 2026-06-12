import Dexie, { Table } from 'dexie';

export interface Project {
  id: string;
  name: string;
  description: string;
  gameType: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  fileType: string;
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  provider: string;
  keyHint: string;
  encryptedKey: string;
  iv: string;
  isActive: boolean;
  usageCount: number;
  budgetLimit: number | null;
  createdAt: string;
}

export interface Settings {
  id: string;
  passphraseHash: string;
  salt: string;
  encryptionIv: string;
  encryptedData: string;
}

class FoundryDB extends Dexie {
  projects!: Table<Project, string>;
  files!: Table<ProjectFile, string>;
  keys!: Table<ApiKey, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('FoundryDB');
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      files: 'id, projectId, path',
      keys: 'id, provider, isActive',
      settings: 'id',
    });
  }
}

export const db = new FoundryDB();

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
