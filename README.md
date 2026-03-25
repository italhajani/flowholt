# FlowHolt

FlowHolt is an advanced AI workflow platform that turns a user's messy task description into an editable, runnable workflow.

## Product direction

- The product should feel chat-first and simple.
- User-facing labels should stay plain: use words like `Create`, `Chat`, `Run`, and `Save`.
- Avoid technical language like `orchestrator` in the visible UI.
- The visual style should stay clean, modern, and a little classical rather than noisy or overly futuristic.
- Studio design quality is a top-tier priority, not a later polish step.

## Current build status

- Auth works with Supabase.
- Workspaces and workflows persist in Supabase.
- Users can create workflow drafts from chat.
- Draft generation uses Groq first, then Hugging Face, then a local fallback if no provider key is present.
- Studio has a functional visual canvas, but it still needs a major polish pass to reach the target UI standard.

## Repositories in this workspace

- `flowholt-web`: Next.js app for landing, dashboard, create flow, and studio.
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

## Recommended repo strategy

Use one GitHub monorepo for the whole MVP:

- `flowholt-web` for Vercel
- `flowholt-engine` for Render
- `docs` for setup and product planning

This keeps the free setup simpler because Vercel and Render can both deploy from different folders inside the same repository.
