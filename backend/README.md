# FlowHolt Backend

Zero-budget backend foundation for FlowHolt.

## Why this stack

- `FastAPI`: free, fast, production-capable Python API framework.
- `sqlite3`: built into Python, no hosted database bill while validating the product.
- `Ollama` optional: local model runtime for zero recurring model spend.
- `HTTPX`: lets us call local or remote model/tool endpoints later.

## Run locally

1. Create a virtual environment.
2. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Copy env values:

```powershell
Copy-Item backend/.env.example backend/.env
```

4. Start the API:

```powershell
python -m uvicorn backend.app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /api/templates`
- `GET /api/workflows`
- `POST /api/workflows`
- `GET /api/executions`
- `POST /api/workflows/{workflow_id}/run`

## Recommended zero-budget path

- Start local-first with SQLite.
- Move database/auth to Supabase free tier when you need multi-user cloud access.
- Keep model execution on `LLM_MODE=mock` for development and switch to `LLM_MODE=ollama` for local open-source models.
- Add a lightweight worker layer next for scheduled runs and webhooks.
