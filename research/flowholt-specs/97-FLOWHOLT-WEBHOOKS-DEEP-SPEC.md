# Spec 97 — FlowHolt Webhooks Deep Spec
**Sources:** Make `webhooks.md`, n8n webhook docs, prior cross-platform synthesis (Spec 89)
**Status:** Research Complete — Ready for Implementation
**Priority:** ⭐⭐⭐⭐⭐ Critical (most common trigger mechanism)

---

## 1. Overview

Webhooks are the primary way external services trigger FlowHolt workflows in real-time. FlowHolt supports:

1. **Instant Webhooks** — Real-time triggers; executes workflow immediately when data arrives
2. **Scheduled Webhooks** — Data accumulates in queue; processed on schedule (like n8n polling)
3. **Custom Webhook Responses** — Return custom HTTP response to caller
4. **Webhook Response Module** — Node that can be placed mid-workflow to respond early

---

## 2. Webhook Queue System

### 2.1 Queue Limits
| Parameter | Value |
|-----------|-------|
| Max items per webhook | 10,000 |
| Queue allocation | 667 items per 10,000 credits/month |
| Rate limit | 300 requests per 10-second window |
| Rate limit response | `429 Too Many Requests` |
| Queue full response | `400 Bad Request` (body: "Queue is full") |

### 2.2 Default Responses (no Webhook Response module)
| Condition | HTTP Code | Body |
|-----------|-----------|------|
| Accepted successfully | `200 OK` | `"Accepted"` |
| Queue is full | `400 Bad Request` | `"Queue is full"` |
| Rate limited | `429 Too Many Requests` | `"Too many requests"` |
| Webhook deactivated | `410 Gone` | `"Webhook not active"` |

### 2.3 Processing Modes
| Mode | Behavior | How to enable |
|------|----------|---------------|
| **Parallel (default)** | Multiple simultaneous executions | Instant webhook default |
| **Sequential** | Wait for previous execution to finish | Workflow Settings → Sequential |

**Sequential mode use cases:**
- Webhook responses must be ordered (e.g., database state machine)
- Prevent race conditions in data updates
- Webhook triggers Stripe events that must process in order

---

## 3. Webhook Lifecycle

### 3.1 States
```
Created
  ↓
Active (connected to workflow + workflow is active)
  ↓
Idle (workflow paused, but webhook URL still alive — queues data)
  ↓
Inactive/Auto-deactivated (not connected for 5+ days → returns 410)
  ↓
Deleted
```

**Auto-deactivation:**
- Webhook not connected to an active workflow for **5+ consecutive days** → automatically deactivated
- Returns `410 Gone` for all incoming requests
- User receives notification when auto-deactivated
- Reactivation: Connect to workflow + re-enable

### 3.2 Webhook URL Format
```
https://hook.flowholt.com/{unique-id}
```
- Unique ID generated at creation (UUID-based)
- **Immutable** — URL never changes even if workflow is renamed

---

## 4. Webhook Creation UI

### 4.1 In Canvas (Webhook Trigger node)
1. Add "Webhook" trigger node to canvas
2. Node panel opens with:
   - Webhook URL (auto-generated, copy button)
   - Method filter: GET, POST, PUT, PATCH, DELETE, or Any
   - Content type expectation: JSON, Form data, Raw, Auto-detect
   - **[Test webhook]** button — opens listener mode (waits for first call)
3. After saving workflow and activating:
   - URL is live and accepting requests

### 4.2 Webhooks Management Page (`/webhooks`)
```
Webhooks                                              [+ Create webhook]

Name           URL                        Status       Workflows    Last triggered
─────────────────────────────────────────────────────────────────────────────────
Order received  hook.flowholt.com/abc123  ● Active     Order Proc.  2 min ago
Slack events    hook.flowholt.com/def456  ⚠ Idle       Slack Notif  3 hours ago
Old webhook     hook.flowholt.com/ghi789  ✕ Inactive   —            Never
```

**Per-webhook actions:**
- Copy URL
- View logs
- Test (send test payload)
- Edit (name, attached workflow)
- Delete (with confirmation warning)

### 4.3 Webhook Detail Panel
```
Webhook: Order received
──────────────────────────────────────────────────
URL:          hook.flowholt.com/abc123  [Copy] [QR]
Status:       ● Active
Method:       POST
Workflow:     Order Processing v3
Queue:        0/10,000 items
Rate:         3 req/10s (of 300 allowed)
Created:      Jan 12, 2025
Last trigger: Jan 22, 2:30 PM

[Logs tab] [Settings tab] [Test tab]
```

---

## 5. Webhook Logs

### 5.1 Log Retention
| Plan | Log retention |
|------|--------------|
| Free | 24 hours |
| Pro | 3 days |
| Business | 7 days |
| Enterprise | 30 days |

### 5.2 Log Entry Schema
```json
{
  "id": "whl_abc123",
  "webhook_id": "whk_def456",
  "received_at": "2025-01-22T14:30:00Z",
  "method": "POST",
  "status_code": 200,
  "processing_status": "success",  // "success" | "error" | "queued" | "skipped"
  "execution_id": "exec_xyz789",
  "headers": { "content-type": "application/json", "x-source": "stripe" },
  "body_preview": "{ \"event\": \"payment.completed\", \"amount\": 99.99 }",
  "body_size_bytes": 1024,
  "latency_ms": 245
}
```

### 5.3 Logs UI
```
[Date range] [Status ▾] [Method ▾]                    [Export]

Time          Method  Status    Code  Latency  Execution
──────────────────────────────────────────────────────────────────
14:30:00      POST    ● Success  200   245ms    exec_xyz → View
14:28:15      POST    ✕ Error    500   1.2s     exec_abc → View
14:25:00      POST    ⏳ Queued  200   12ms     —
```

**Click row → expand details:**
- Full headers
- Full body (raw JSON)
- Request replay button: "Re-send this request to current workflow"

---

## 6. Webhook Response Module

### 6.1 What It Does
Placed anywhere in the workflow (not just the end), it immediately sends an HTTP response to the webhook caller while the workflow continues executing.

**Why important:** 
- Stripe, Shopify require HTTP 200 response within 5 seconds or they retry
- But your workflow processing might take 30+ seconds
- Solution: Webhook Response node early in workflow → 200 immediately → rest of workflow continues

### 6.2 Node Configuration
```
Webhook Response node
├── HTTP Status Code: [200] (input: 100-599)
├── Response Type: JSON | Text | HTML | Custom Headers
├── Response Body:
│   ├── JSON mode: Key-value builder (or expression editor)
│   └── Text mode: Plain text / template expression
└── Custom Headers: Key-value list
```

### 6.3 Important Behavior
- **If placed at end of workflow:** Same as default response (200 on success)
- **If placed in middle:** Errors in modules AFTER the Webhook Response node do NOT deactivate the workflow (because response already sent)
- **Multiple Webhook Response nodes:** Only the first one encountered executes
- **Without Webhook Response:** Entire workflow must complete before response sent

### 6.4 Canvas Visualization
- Webhook Response node shown with different styling (response icon, distinct color)
- Dotted line after it showing "async continuation" 
- Tooltip: "Response sent here — subsequent errors won't affect webhook caller"

---

## 7. HMAC Validation

### 7.1 Webhook Signature Verification
For webhooks from services that sign their payloads (Stripe, GitHub, etc.):

```
Trigger node → Advanced Settings → Signature Verification
├── Header name: [X-Stripe-Signature]
├── Secret: [paste shared secret]
├── Algorithm: HMAC-SHA256 | HMAC-SHA1 | HMAC-MD5
└── Encoding: Hex | Base64
```

**What FlowHolt does:**
1. Extract raw request body (before JSON parsing)
2. Compute `HMAC(secret, body)` using specified algorithm
3. Compare with value in signature header
4. If mismatch → reject request (403) + log "Invalid signature"

### 7.2 IP Allowlist
Optional: Restrict webhook to only accept requests from specific IPs:
```
Trigger node → Advanced Settings → IP Allowlist
├── Add IP or CIDR range (e.g., 192.168.0.0/24)
└── "Reject requests from all other IPs" toggle
```

---

## 8. Scheduled Webhook (Data Accumulation Mode)

### 8.1 How It Works
1. Webhook receives data (e.g., form submissions throughout the day)
2. Data queues up instead of triggering immediately
3. At scheduled time (e.g., 9 AM daily) workflow runs
4. **"Max results" setting** controls how many queue items processed per run
5. After processing, those items are dequeued

### 8.2 Configuration
```
Trigger node → Scheduling mode: Scheduled
├── Schedule: [cron picker]
├── Max results per run: [100] (1–10,000)
└── Queue: Currently 47 items waiting
```

### 8.3 Use Case Example
```
Receive customer feedback (throughout day)
  → Queue accumulates 150 responses
  → At 8 PM daily run:
    → Process 100 responses (max 100 per run)
    → 50 remain in queue → processed next run or next day
```

---

## 9. Advanced Webhook Features

### 9.1 Webhook Input Variables (n8n pattern)
FlowHolt supports exposing webhook parameters as "workflow inputs" (from Spec 93):
- URL path parameters: `/webhook/{id}/process/{action}`
- Query parameters: `?source=slack&version=2`
- These become available as `$input.params.id`, `$input.query.source` in expressions

### 9.2 Webhook Testing Mode
- **"Listen for test event"** in canvas: Workflow waits for one real webhook call
- Incoming data shown in trigger node output panel
- Can pin this test data for repeated use during development

### 9.3 Multiple Trigger Types
The Webhook Trigger node covers:
- **Instant webhook** (HTTP push)
- **Polling** (check URL on schedule)
- **SSE** (Server-Sent Events, future)
- **WebSocket** (future)

---

## 10. Backend Architecture

### 10.1 Webhook Ingestion Service
```
External Service → [Load Balancer] → [Webhook Ingestion API]
                                          ↓
                               [Redis Queue (per webhook)]
                                          ↓
                           [Execution Worker (pulls from queue)]
                                          ↓
                                [Execution Engine]
```

### 10.2 Database Schema
```sql
CREATE TABLE webhooks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID REFERENCES teams(id),
  workflow_id   UUID REFERENCES workflows(id),  -- nullable (not yet attached)
  name          TEXT,
  unique_path   TEXT UNIQUE NOT NULL,           -- the /hook/{unique_path} part
  method        TEXT DEFAULT 'POST',
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','idle','inactive','deleted')),
  sequential    BOOLEAN DEFAULT FALSE,
  hmac_secret   TEXT,                           -- encrypted
  hmac_header   TEXT,
  hmac_algo     TEXT DEFAULT 'sha256',
  ip_allowlist  INET[],
  last_trigger  TIMESTAMPTZ,
  queue_size    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id        UUID REFERENCES webhooks(id),
  received_at       TIMESTAMPTZ DEFAULT NOW(),
  method            TEXT,
  status_code       INTEGER,
  processing_status TEXT,
  execution_id      UUID,
  headers           JSONB,
  body              TEXT,
  body_size_bytes   INTEGER,
  latency_ms        INTEGER
);

CREATE INDEX webhook_log_webhook_received ON webhook_log(webhook_id, received_at DESC);
```

---

## 11. FlowHolt Decision Summary

| Decision | Chosen Approach | Reason |
|----------|-----------------|--------|
| Default parallel processing | Yes (match Make) | Better throughput for most use cases |
| Sequential mode | Per-workflow setting | When ordering matters |
| Max queue | 10,000 per webhook | Match Make; prevents abuse |
| Rate limit | 300 req/10s | Match Make; protects infra |
| Log retention | Plan-tiered (24h–30d) | Storage cost management |
| HMAC validation | Built-in on trigger node | Security baseline for webhooks |
| Webhook Response module | Yes (Place anywhere) | Critical for 5-second SLAs |
| Auto-deactivation | 5 days inactive | Prevent zombie webhooks consuming queue |
| URL immutability | Yes | Prevent breakage when workflow renamed |
| IP allowlist | Optional (on trigger node) | Enterprise security requirement |
