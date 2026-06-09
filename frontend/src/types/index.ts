export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'studio';
  createdAt: string;
}

export interface ApiKey {
  id: string;
  label: string;
  provider: string;
  monthlyBudgetUsd: number | null;
  usedThisMonth: number;
  lastUsed: string | null;
  isActive: boolean;
  fallbackOrder: number;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  slug: string | null;
  template: string;
  gameEngine: string;
  isPublic: boolean;
  remixParentId: string | null;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  collaborations?: Collaboration[];
  _count?: { files: number; assets: number };
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  fileType: 'code' | 'image' | 'audio' | 'json' | 'tilemap';
  isGenerated: boolean;
  hash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  projectId: string;
  filename: string;
  storageUrl: string;
  assetType: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  generatedByPrompt: string | null;
}

export interface Generation {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  modelUsed: string | null;
  provider: string | null;
  costUsd: number;
  tokensUsed: number | null;
  succeeded: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export interface Collaboration {
  projectId: string;
  userId: string;
  permission: 'view' | 'edit' | 'owner';
  user?: Pick<User, 'id' | 'email' | 'displayName'>;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  content: string;
  resolved: boolean;
  createdAt: string;
}

export interface OpenTab {
  fileId: string;
  path: string;
  isDirty: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface RemoteCursor {
  userId: string;
  filePath: string;
  position: CursorPosition;
  color: string;
}
