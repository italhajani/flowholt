# FlowHolt Setup Checklist

This is the cheapest and cleanest order for the MVP.

## 1. Create GitHub repo now

Create one repo, not multiple repos.

Recommended name:
- `flowholt`

Reason:
- Vercel can deploy `flowholt-web`
- Render can deploy `flowholt-engine`
- one repo is easier to manage on a zero-budget setup

### Local commands after repo creation

```powershell
cd "D:\My work\flowholt"
git add .
git commit -m "Initial FlowHolt scaffold"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Create Supabase project after GitHub push

In Supabase create a new project for FlowHolt.

Bring back these values:
- Project URL
- Publishable key
- Secret key
- Service role key
- Database password you chose
- Connection string or direct connection details if you want later migrations

Put these in:
- `flowholt-web/.env.local`
- `flowholt-engine/.env`

## Important auth setting

In Supabase, re-enable the `Email` provider.

Reason:
- FlowHolt login and signup will use email/password first
- it is the simplest free MVP path

## 3. Install the next web dependencies locally

Run this inside `flowholt-web`:

```powershell
npm.cmd install @supabase/supabase-js @supabase/ssr
```

After that, we will wire real auth and session handling.

## 4. Connect Vercel after Supabase exists

Create a Vercel project from the same GitHub repo.

Important settings:
- Root directory: `flowholt-web`
- Framework: Next.js
- Add env vars from `flowholt-web/.env.local`

## 5. Connect Render later, not first

Create Render only after:
- Python is installed and working locally
- the engine has at least one real runnable endpoint

Render settings later:
- Root directory: `flowholt-engine`
- Runtime: Python
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 6. What is left in code

### Web app
- Supabase clients
- login/signup forms
- protected dashboard session flow
- orchestrator chat UI
- workflow JSON schema handling
- React Flow studio graph editor
- workflow save/load to Supabase

### Engine
- Python setup on your machine
- workflow execution logic
- AI provider wrappers for free APIs
- run logs and result persistence

### Database
- users/workspaces workflow tables
- runs/logs tables
- row level security policies
- storage buckets for uploaded files

## 7. Best immediate next move

Do these in this order:
1. Create the GitHub repo and push the current code.
2. Create Supabase and bring me the URL and keys names you see.
3. Run the Supabase package install command locally.
4. Then I will wire the real auth layer and database helpers.
