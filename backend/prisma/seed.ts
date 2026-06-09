import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@foundry.gg' },
    update: {},
    create: {
      email: 'demo@foundry.gg',
      passwordHash,
      displayName: 'Demo User',
      subscriptionTier: 'pro',
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      userId: user.id,
      title: 'Demo Platformer',
      template: 'platformer',
      gameEngine: 'phaser',
      slug: 'demo-platformer',
      isPublic: true,
      files: {
        create: [
          {
            path: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Demo Game</title><link rel="stylesheet" href="style.css"></head>
<body><div id="game-container"></div><script src="https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js"></script><script src="src/main.js"></script></body>
</html>`,
            fileType: 'code',
          },
          {
            path: 'style.css',
            content: '* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }',
            fileType: 'code',
          },
          {
            path: 'src/main.js',
            content: `const config = {
  type: Phaser.AUTO, width: 800, height: 600, parent: 'game-container',
  physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
  scene: { preload, create, update }
};
let player, cursors, score = 0, scoreText;

function preload() {
  // Placeholder graphics
  const g = this.make.graphics();
  g.fillStyle(0x4ecdc4); g.fillRect(0, 0, 32, 48);
  g.generateTexture('player', 32, 48);
  g.fillStyle(0xff6b6b); g.fillRect(0, 0, 32, 32);
  g.generateTexture('enemy', 32, 32);
  g.fillStyle(0xffe66d); g.fillRect(0, 0, 24, 24);
  g.generateTexture('coin', 24, 24);
  g.fillStyle(0x45b7d1); g.fillRect(0, 0, 800, 32);
  g.generateTexture('ground', 800, 32);
  g.destroy();
}
function create() {
  this.add.text(400, 50, 'Demo Platformer', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '18px', color: '#fff' });
  const ground = this.physics.add.staticGroup();
  ground.create(400, 584, 'ground');
  player = this.physics.add.sprite(100, 450, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0.1);
  this.physics.add.collider(player, ground);
  cursors = this.input.keyboard.createCursorKeys();
  // Enemies
  const enemies = this.physics.add.group();
  for (let i = 0; i < 3; i++) {
    const e = enemies.create(300 + i * 150, 500, 'enemy');
    e.setVelocityX(-50 + Math.random() * 100);
    e.setBounce(1, 0);
    e.setCollideWorldBounds(true);
  }
  this.physics.add.collider(enemies, ground);
  // Coins
  const coins = this.physics.add.staticGroup();
  for (let i = 0; i < 5; i++) {
    coins.create(150 + i * 120, 400, 'coin');
  }
  this.physics.add.overlap(player, coins, (player, coin) => {
    coin.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  }, null, this);
  this.physics.add.overlap(player, enemies, () => {
    player.setTint(0xff0000);
    this.time.delayedCall(500, () => { player.clearTint(); });
  });
}
function update() {
  if (!player || !cursors) return;
  player.setVelocityX(0);
  if (cursors.left.isDown) player.setVelocityX(-200);
  else if (cursors.right.isDown) player.setVelocityX(200);
  if (cursors.up.isDown && player.body.touching.down) player.setVelocityY(-400);
}
new Phaser.Game(config);`,
            fileType: 'code',
          },
        ],
      },
    },
  });

  console.log('Seed complete:', { user: user.email, project: project.title });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
