# Email Trigger Quickstart

This adds a new backend-first trigger style for FlowHolt: inbound email intake.

## What this means

Instead of only using manual runs, webhooks, schedules, or named events, you can now tell FlowHolt:

- when email arrives at `leads@yourcompany.com`, start this workflow
- when support mail arrives with `refund` in the subject, start this workflow
- when a parsed mailbox event is sent into FlowHolt, match the right workflow automatically

## Setup

1. Open `flowholt-web/.env.local`
2. Add:
   `FLOWHOLT_EMAIL_KEY=your-long-random-secret`
3. Restart `flowholt-web`

## Configure a workflow

1. Open Studio for any workflow
2. Click the trigger node
3. Set `Mode` to `Email`
4. Fill `Inbox address`
   Example: `leads@yourcompany.com`
5. Optionally fill `Subject must contain`
   Example: `new lead`

## Send an email event into FlowHolt

POST `/api/email/ingest`

Headers:

- `Content-Type: application/json`
- `x-flowholt-email-key: your-long-random-secret`

Example body:

```json
{
  "workspaceId": "your-workspace-id",
  "to": "leads@yourcompany.com",
  "from": "customer@example.com",
  "subject": "New lead from landing page",
  "text": "Hi, I want a demo.",
  "metadata": {
    "provider": "resend",
    "mailbox": "sales"
  }
}
```

## How to see output

1. Save the workflow trigger as `Email`
2. Send the email ingest request
3. Open `/app/runs`
4. You should see a new run with `trigger_source = email`
5. Open the run to watch logs and node timeline

## Easy meaning

- webhook = one outside app calls one workflow directly
- event trigger = your system sends a named event and FlowHolt finds matching workflows
- email trigger = an inbox/parser sends email data and FlowHolt starts workflows for matching inbox rules
