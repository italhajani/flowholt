# Event Trigger Quickstart

This adds a new backend-first trigger style for FlowHolt: named workspace events.

## What this means

Instead of only using manual runs, webhooks, or schedules, you can now tell FlowHolt:

- when event `lead.created` happens, start this workflow
- when event `invoice.paid` happens, start this workflow
- when event `invoice.*` happens, start this workflow

## Setup

1. Open `flowholt-web/.env.local`
2. Add:
   `FLOWHOLT_EVENT_KEY=your-long-random-secret`
3. Restart `flowholt-web`

## Configure a workflow

1. Open Studio for any workflow
2. Click the trigger node
3. Set `Mode` to `Event`
4. Fill `Event name`
   Example: `lead.created`
   Example: `invoice.*`
5. Optionally fill `Event source`
   Example: `crm`

## Send an event into FlowHolt

POST `/api/events/ingest`

Headers:

- `Content-Type: application/json`
- `x-flowholt-event-key: your-long-random-secret`

Example body:

```json
{
  "workspaceId": "your-workspace-id",
  "eventName": "lead.created",
  "eventSource": "crm",
  "payload": {
    "lead_id": "lead_123",
    "name": "Aisha"
  },
  "metadata": {
    "source_id": "evt_001"
  }
}
```

## How to see output

1. Send the event request
2. Open `/app/runs`
3. You should see a new run with `trigger_source = event`
4. Open the run to watch logs and node timeline

## Easy meaning

- webhook = an outside app calls one workflow directly
- event trigger = your system sends a named event, and FlowHolt finds the right workflows automatically
