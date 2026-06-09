# Foundry — BYOK AI Game Generator

A VS Code‑like browser IDE where you bring your own API keys to generate, edit, and deploy complete games using AI.

**You own the keys. You own the costs. You own the data.**

## Features

- **VS Code Layout**: File explorer, multi‑tab Monaco editor, integrated xterm terminal, AI chat pane
- **Dual Preview**: Saved state snapshot + live hot‑reload iframe (debounced 300ms)
- **BYOK Vault**: Encrypt and store API keys (OpenAI, Anthropic, Google, Replicate, Stability, ElevenLabs, OpenRouter)
- **AI Game Generation**: Multi‑agent system (Design → Code → Assets → Sound → Playtest)
- **Template System**: Platformer, RPG, Endless Runner, Match‑3, Visual Novel, Card Battler, Blank
- **File Management**: Tree explorer, right‑click context menu, drag‑and‑drop upload, batch file updates
- **Collaboration**: Real‑time cursor sync, file edits, line comments (Socket.IO)
- **Deployment**: ZIP export, itch.io publish, subdomain deploy
- **Community Gallery**: Browse and remix public games

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |
| Editor | Monaco Editor (@monaco-editor/react) |
| State | Redux Toolkit |
| Real‑time | Socket.IO |
| Terminal | xterm.js |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ (Redis) |
| Auth | JWT + Passport.js (Google, GitHub) |
| Encryption | AES‑256‑GCM |
| Storage | S3‑compatible (AWS / R2 / MinIO) |
| AI SDKs | openai, @anthropic‑ai/sdk, replicate, stability‑ai, elevenlabs |

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized setup)

### 1. Clone and install

```bash
cd foundry

# Backend
cd backend
cp ../.env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev

# Frontend (in another terminal)
cd ../frontend
npm install
npm run dev
```

### 2. Environment Variables

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `ENCRYPTION_MASTER_KEY` | 64‑char hex key for AES‑256‑GCM |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `FRONTEND_URL` | URL of the frontend (CORS) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth credentials |
| `STRIPE_SECRET_KEY` | Stripe API key (subscriptions) |

### 3. Docker Compose (optional)

```bash
docker-compose -f docker/docker-compose.yml up --build
```

### 4. Open the app

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health

## Project Structure

```
foundry/
├── frontend/          # React + Vite + Tailwind + Monaco
│   └── src/
│       ├── components/    # Auth, Editor, Preview, Sidebar, BottomPanel, KeyVault...
│       ├── store/         # Redux Toolkit slices
│       ├── services/      # API client, Socket.IO connection
│       ├── types/         # TypeScript interfaces
│       └── utils/         # Encryption, diff, zip helpers
├── backend/           # Express + Prisma + Socket.IO
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # BYOK relay, AI orchestrator, providers
│       │   ├── aiOrchestrator/  # DesignAgent, CodingAgent, AssetAgent...
│       │   └── providers/       # OpenAI, Anthropic, Google, Replicate...
│       ├── routes/       # Express routes
│       ├── socket/       # WebSocket handlers
│       └── middleware/   # Auth, rate limiting, error handling
├── docker/            # Docker Compose + Dockerfiles
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/google` — Google OAuth
- `GET /api/auth/me` — Current user

### Projects
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project with files
- `PATCH /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `POST /api/projects/:id/fork` — Remix/fork project

### Files
- `GET /api/projects/:pid/files` — List files
- `POST /api/projects/:pid/files` — Create file
- `PUT /api/projects/:pid/files/:fid` — Update file content
- `DELETE /api/projects/:pid/files/:fid` — Delete file
- `POST /api/projects/:pid/files/batch` — Batch upsert files

### API Keys (BYOK)
- `GET /api/keys` — List keys (masked)
- `POST /api/keys` — Add key (encrypted)
- `POST /api/keys/:id/test` — Test key validity
- `PATCH /api/keys/:id` — Update key
- `DELETE /api/keys/:id` — Delete key

### Generation
- `POST /api/projects/:pid/generate` — Generate game from prompt
- `POST /api/projects/:pid/modify` — Modify game with instruction
- `GET /api/projects/:pid/history` — Generation history
- `GET /api/generations/stats` — Usage statistics

### Deployment
- `GET /api/projects/:pid/export` — Download ZIP
- `POST /api/projects/:pid/deploy/subdomain` — Deploy to subdomain
- `POST /api/projects/:pid/deploy/itchio` — Publish to itch.io

## License

MIT
