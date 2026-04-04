# Zero-Budget Backend Stack

## Phase 1: launch with near-zero cost

- API: FastAPI
- Runtime: Python
- Primary database: SQLite locally, Supabase Postgres later
- Auth: Supabase Auth free tier when multi-user login is needed
- File storage: Supabase Storage free tier later, local disk at first
- AI execution: `mock` mode in development, `Ollama` for local open-source models
- Vector search: start with none, add local Qdrant only when retrieval is truly needed
- Scheduling: in-process scheduler first, dedicated worker later
- Webhooks: FastAPI endpoints
- Secrets and variables: SQLite-backed Vault records first, dedicated secret manager later
- Observability: structured logs + execution history in SQLite

## Why this is realistic

- No mandatory monthly bill to start
- Can run on one VPS or even one local machine
- Keeps the architecture compatible with later upgrades
- Avoids vendor lock-in during the first product-validation stage

## Recommended upgrade path

1. Start local with SQLite and local models.
2. Move auth and Postgres to Supabase free tier.
3. Move Vault secret storage to a stronger encrypted store when the team or compliance surface grows.
4. Add Redis or Postgres-backed queue when background volume grows.
5. Move from local Ollama to hosted models only after usage justifies spend.
