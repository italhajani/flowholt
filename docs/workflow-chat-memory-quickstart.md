# Workflow Chat Memory Quickstart

This adds persistent chat memory for each workflow.

## 1. Run migration

Execute this SQL file in Supabase SQL Editor:

- `supabase/migrations/20260326_0005_workflow_chat.sql`

## 2. Create a chat thread

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/chat/threads" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"title":"Main builder thread"}'
```

## 3. Add and read messages

List messages:

```bash
curl "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/chat/threads/YOUR_THREAD_ID/messages" \
  -b "your-auth-cookie"
```

Append a message:

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/chat/threads/YOUR_THREAD_ID/messages" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"role":"user","message":"Add approval before final output"}'
```

## 4. Composer + chat memory together

When calling composer, pass `threadId` and it auto-saves both user + assistant messages.

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/compose" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"threadId":"YOUR_THREAD_ID","message":"Improve this flow for retries","mode":"preview"}'
```

Response includes `chat_write` details.
