# ShakSpace OS

> A personal "operating system" for your work — workspaces, a knowledge base, an AI assistant, and automation, unified behind one auth layer and one UI.

ShakSpace OS isn't a single-purpose app. It's a shell that holds several focused tools (workspaces, notes, AI chat, automations) and ties them together with one identity, so context doesn't get lost jumping between five different SaaS tabs.

## What makes it different

- **One owner graph, not five silos.** Every workspace, note, conversation, and automation is scoped to the authenticated user via consistent `owner`/`workspace` indexes — there's no cross-tenant leakage by construction, not by convention.
- **Knowledge base that lives *inside* workspaces, not next to them.** Notes (`Knowledge` documents) belong to a workspace, carry tags, categories, word count, and auto-tracked `lastEdited`/`lastOpened` timestamps — so "recent" and "pinned" views are real, queryable state, not client-side guesses.
- **AI assistant with real conversation history**, not a stateless prompt box. Conversations and messages are persisted (Mongo-backed), support per-conversation model/provider switching, and the provider layer is abstracted (`gemini.provider.js`, with `ollama`/`openai` slots already wired) so swapping models doesn't mean rewriting the chat logic.
- **Automation templates as first-class data**, not hardcoded UI strings — triggers, conditions, actions, and execution history are modeled (`Automation.executionHistory[]`) so "what happened and when" is auditable, not just "what's configured."
- **Security-first auth**, not bolted-on: httpOnly cookies with refresh-token rotation (old token revoked the moment a new one is issued), bcrypt password hashing, and a Bearer-token fallback for non-browser clients — all behind one `authJwt` middleware.
- **A backend that degrades gracefully.** MongoDB connects asynchronously and non-blockingly — the API process comes up and serves `/health` even if the database is briefly unreachable, instead of crash-looping on boot.
- **Demo mode.** The frontend can run entirely client-side (`localStorage`-backed) with zero backend calls, so the product can be explored without anyone standing up a database first.

## Feature tour

### 🔐 Auth
Register / login / refresh / logout / `me`, all behind JWT access + refresh tokens. Access tokens live in an httpOnly cookie (with header fallback); refresh tokens are hashed before storage and rotated on every use, so a stolen refresh token only works once.

### 🗂️ Workspaces
Create, categorize (general / personal / team / education / business / research), color-code, pin, favorite, archive/restore, and track "last opened" — with full pagination, search, and sorting on the list endpoint.

### 📚 Knowledge Hub
Notes scoped to a workspace, with tags, categories, rich filtering (by tag, workspace, status), grid/list views, and computed reading time / word count. Pin, favorite, and archive work the same way they do for workspaces — consistent mental model across the app.

### 🤖 AI Assistant
Persistent, multi-conversation chat backed by Gemini (`gemini-2.0-flash` by default), with conversation search, pinning, archiving, and per-conversation model selection. Every message — user and assistant — is stored, so history survives a refresh.

### ⚙️ Automations
Define triggers → conditions → actions, with a library of starter templates (daily backups, AI-generated meeting notes, code review hooks, document auto-organization) and a full execution history per automation.

### 🔔 Notifications & Settings
Scaffolded with the same indexed-by-user, typed (`info`/`success`/`warning`/`error`/`task`/`system`) data model as the rest of the app — these are mid-build, see [Roadmap](#roadmap).

## Stack

| Layer    | Tech                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | React 19, Vite, Tailwind CSS, Zustand, React Router, Motion (Framer Motion)    |
| Backend  | Node.js, Express, MongoDB/Mongoose, JWT + bcrypt, Cloudinary, express-validator |
| AI       | Google Gemini (pluggable provider layer)                                       |

## Project structure

```
ShakSpace_OS/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # auth, workspace, knowledge, ai, layout, common, splash
│   ├── pages/               # WorkspacePage, KnowledgeHubPage, AIAssistantPage, AutomationPage, SettingsPage
│   ├── services/            # API client (fetch, cookie-based auth, timeouts)
│   ├── stores/              # Zustand stores (auth, workspace, knowledge, ai, toast)
│   └── utils/
└── backend/                # Backend (Express)
    └── src/
        ├── routes/v1/       # auth, users, workspaces, knowledge, automations, notifications, settings, ai
        ├── controllers/
        ├── services/        # business logic, query building, pagination
        ├── models/           # User, Workspace, Knowledge, Automation, Conversation, Message, Notification
        ├── validators/       # express-validator chains
        ├── middleware/       # authJwt, errorHandler
        ├── providers/        # gemini.provider.js (+ ollama/openai slots)
        ├── config/           # env.js
        └── utils/
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas)
- Cloudinary account (for uploads)
- Gemini API key (for the AI assistant)

### 1. Clone & install

```bash
git clone https://github.com/TheShakSpace/ShakSpace_OS.git
cd ShakSpace_OS

npm install              # frontend deps
cd backend && npm install && cd ..   # backend deps
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets for signing auth tokens |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials for uploads |
| `GEMINI_API_KEY` | Google Gemini API key powering the AI assistant |
| `CORS_ORIGIN` | Frontend origin allowed to call the API (default `http://localhost:5173`) |

### 3. Run it

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```

No backend handy? Flip on demo mode from the login screen — workspaces, notes, and AI chat all run against `localStorage` instead.

## Available scripts

**Frontend** (root)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the codebase |

**Backend** (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with nodemon (auto-reload) |
| `npm start` | Start the API |

## Roadmap

Honest state of in-progress pieces:

- **Notifications & Settings** — data models and routes exist; controllers are still stubs.
- **Automation execution** — triggers/actions are modeled and templated, but there's no scheduler running them yet.
- **File uploads** — Cloudinary/Multer are configured but not yet wired to an upload route.
- **AI streaming** — responses currently render with a client-side typing animation rather than true server-sent streaming.

## Security

Never commit `.env` files — they're git-ignored. Rotate credentials in `backend/.env` only; `backend/.env.example` should stay free of real secrets.
