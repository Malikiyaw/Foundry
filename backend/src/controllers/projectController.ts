import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export async function listProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        collaborations: { where: { userId: req.userId } },
        _count: { select: { files: true, assets: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function getProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id as string,
        OR: [
          { userId: req.userId },
          { collaborations: { some: { userId: req.userId } } },
        ],
      },
      include: {
        files: { orderBy: { path: 'asc' } },
        assets: true,
        collaborations: { include: { user: { select: { id: true, email: true, displayName: true } } } },
      },
    });
    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, template, gameEngine } = req.body;

    const project = await prisma.project.create({
      data: {
        userId: req.userId!,
        title: title || 'Untitled Game',
        template: template || 'blank',
        gameEngine: gameEngine || 'phaser',
        slug: `${title || 'game'}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      },
    });

    const templateFiles = getTemplateFiles(template || 'blank', gameEngine || 'phaser');
    if (templateFiles.length > 0) {
      await prisma.projectFile.createMany({
        data: templateFiles.map((f) => ({
          projectId: project.id,
          path: f.path,
          content: f.content,
          fileType: f.fileType,
          isGenerated: false,
          hash: hashContent(f.content),
        })),
      });
    }

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: { files: true },
    });
    res.status(201).json(fullProject);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const updated = await prisma.project.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!project) throw new AppError(404, 'Project not found');

    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function forkProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sourceProject = await prisma.project.findFirst({
      where: { id: req.params.id as string, isPublic: true },
      include: { files: true },
    });
    if (!sourceProject) throw new AppError(404, 'Project not found or not public');

    const newProject = await prisma.project.create({
      data: {
        userId: req.userId!,
        title: `${sourceProject.title} (remix)`,
        template: sourceProject.template,
        gameEngine: sourceProject.gameEngine,
        slug: `${sourceProject.slug}-fork-${Date.now()}`,
        remixParentId: sourceProject.id,
        files: {
          create: sourceProject.files.map((f) => ({
            path: f.path,
            content: f.content,
            fileType: f.fileType,
            isGenerated: f.isGenerated,
            hash: f.hash,
          })),
        },
      },
      include: { files: true },
    });
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

function getTemplateFiles(template: string, engine: string): Array<{ path: string; content: string; fileType: 'code' | 'image' | 'audio' | 'json' | 'tilemap' }> {
  const engineScript = engine === 'kaboom'
    ? 'https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs'
    : 'https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js';

  const defaultFiles = [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundry Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container"></div>
  <script src="${engineScript}"></script>
  <script src="src/main.js" type="module"></script>
</body>
</html>`,
      fileType: 'code' as const,
    },
    {
      path: 'style.css',
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
#game-container canvas { display: block; }`,
      fileType: 'code' as const,
    },
    {
      path: 'src/main.js',
      content: engine === 'kaboom'
        ? `import k from "https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs";
k({ global: true, width: 800, height: 600 });
loadBean();
add([
  bean(),
  pos(80, 80),
  area(),
  body(),
]);
keyDown("left", () => move(-120, 0));
keyDown("right", () => move(120, 0));
keyDown("up", () => jump());
keyDown("down", () => move(0, 120));`
        : `const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
  scene: { create, update }
};

function create() {
  this.add.text(400, 300, 'Foundry Game', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
}

function update() {}

new Phaser.Game(config);`,
      fileType: 'code' as const,
    },
  ];

  if (template === 'blank') {
    return defaultFiles;
  }

  return defaultFiles;
}
