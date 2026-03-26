# Webhook Trigger Quickstart

This guide shows how to run FlowHolt workflows from an incoming webhook.

## 1. Configure environment

In `flowholt-web/.env.local`, set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ENGINE_URL`

## 2. Create a webhook integration connection

In the app, open Integrations and create a `Webhook connection` with:

- `config.method`: `POST` (or another method)
- `config.direction`: `inbound`
- `secrets.api_key`: a secret key value (recommended)

## 3. Bind trigger node to that connection

Open the workflow in Studio:

- Select the `Trigger` node
- Use the `Connection` dropdown
- Pick your webhook connection
- Save the workflow

## 4. Call the webhook endpoint

Use:

`/api/webhooks/{workflowId}`

Example:

```bash
curl -X POST "http://localhost:3000/api/webhooks/YOUR_WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -H "x-flowholt-key: YOUR_WEBHOOK_KEY" \
  -d '{"customer":"Acme","task":"Run the automation"}'
```

## 5. Verify output

- Open Runs page in the app
- Open the workflow run details/logs
- Check that trigger source is `webhook`
- Confirm node logs and final output were recorded

## Runtime template access

Webhook payload and metadata are available to node templates via:

- `{{workflow.trigger_payload}}`
- `{{workflow.trigger_meta}}`
- `{{trigger.payload}}`
- `{{trigger.meta}}`
