# FlowHolt

FlowHolt is an advanced AI workflow platform that turns a user's messy task description into an editable, runnable workflow.

## Repositories in this workspace

- `flowholt-web`: Next.js app for landing, dashboard, orchestrator, and studio.
- `flowholt-engine`: FastAPI execution engine for running workflows and streaming logs.
- `docs`: product and system blueprint assets.

## Free-tier stack

- Frontend: Vercel + Next.js
- Backend: Render + FastAPI
- Database/Auth/Storage: Supabase
- AI providers: Groq, Hugging Face, and optional OpenAI-compatible providers

## First local setup

### Web

```powershell
cd "D:\My work\flowholt\flowholt-web"
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

### Engine

```powershell
cd "D:\My work\flowholt\flowholt-engine"
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Immediate next milestones

1. Connect Supabase auth and database.
2. Add orchestrator chat to generate workflow JSON.
3. Render workflow graphs in the studio.
4. Send approved workflows to the execution engine.

## Recommended repo strategy

Use one GitHub monorepo for the whole MVP:

- `flowholt-web` for Vercel
- `flowholt-engine` for Render
- `docs` for setup and product planning

This keeps the free setup simpler because Vercel and Render can both deploy from different folders inside the same repository.
