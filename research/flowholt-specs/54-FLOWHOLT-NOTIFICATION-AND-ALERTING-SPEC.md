# FlowHolt Notification, Alerting, and Log Streaming Specification

> **Status:** New file created 2026-04-17  
> **Direction:** FlowHolt merges Make's email-based notification model with n8n's structured log streaming to create a multi-channel alerting system with event taxonomy.  
> **Vault:** [[wiki/concepts/runtime-operations]], [[wiki/concepts/observability-analytics]]  
> **Raw sources:**  
> - n8n log streaming: `research/n8n-docs-export/pages_markdown/log-streaming/` (7 pages)  
> - n8n audit logs: `research/n8n-docs-export/pages_markdown/log-streaming/log-streaming-node.md`  
> - Make notifications: `research/make-help-center-export/pages_markdown/email-notifications.md`  
> - Make audit log: `research/make-pdf-full.txt` §Audit Log  
> - FlowHolt observability: `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`  

---

## 1. Notification Architecture

### Three Layers

| Layer | Purpose | Trigger Source | Delivery |
|-------|---------|---------------|----------|
| **System Notifications** | Platform-level alerts | Runtime engine, scheduler, health checks | In-app + email digest |
| **Workflow Notifications** | Per-workflow status changes | Execution engine, error handlers | In-app + email + webhook |
| **Log Streaming** | Structured event firehose | All platform events | Syslog, webhook, Sentry, custom |

### Notification Flow

```
Event occurs → Event Bus → Notification Router
                              ├── In-app notification store → UI bell icon
                              ├── Email digest aggregator → scheduled email
                              ├── Webhook dispatcher → user-configured URL
                              └── Log stream destinations → Syslog/Sentry/webhook
```

---

## 2. System Notifications (In-App)

### Notification Center UI

- Bell icon in top navigation bar with unread count badge
- Dropdown panel showing latest 50 notifications
- Click notification → navigate to relevant page (workflow, execution, settings)
- "Mark all read" and per-notification dismiss
- Full notification history page at `/notifications`

### System Notification Types

| Type | Trigger | Severity | Auto-Clear |
|------|---------|----------|------------|
| `workflow.error` | Execution failed (non-retryable) | error | No |
| `workflow.warning` | ExecutionInterruptedWarning or OutOfSpaceWarning | warning | No |
| `workflow.deactivated` | Consecutive error threshold reached → auto-deactivated | error | No |
| `workflow.reactivated` | User manually reactivated a deactivated workflow | info | 24h |
| `execution.incomplete` | Execution stored as incomplete, pending retry | warning | On resolution |
| `execution.retry_exhausted` | All 8 retry attempts failed → dead-letter | error | No |
| `webhook.queue_overflow` | Webhook queue reached plan limit | warning | 1h |
| `webhook.rejected` | Webhook rejected (schema mismatch, auth failure) | warning | No |
| `connection.expiring` | OAuth token expires within 7 days | warning | On refresh |
| `connection.expired` | OAuth token expired, workflows affected | error | On refresh |
| `connection.test_failed` | Scheduled connection health check failed | warning | On success |
| `credits.threshold` | Credits at 80% / 90% / 100% of plan limit | warning | Monthly reset |
| `credits.exhausted` | All credits consumed, executions paused | error | On purchase/reset |
| `deployment.pending_approval` | Workflow promotion awaiting review | info | On decision |
| `deployment.approved` | Workflow promotion approved | info | 24h |
| `deployment.rejected` | Workflow promotion rejected | warning | No |
| `team.member_added` | New member joined team | info | 7d |
| `team.member_removed` | Member removed from team | info | 7d |
| `security.login_new_device` | Login from unrecognized device/location | warning | 7d |
| `security.api_key_expiring` | API key expires within 30 days | warning | On rotation |

### Notification Preferences (per user)

| Setting | Options | Default | Scope |
|---------|---------|---------|-------|
| In-app notifications | On/Off | On | User |
| Email notifications | On/Off | On | User |
| Email frequency | Instant / Hourly digest / Daily digest | Hourly | User |
| Notification types to suppress | Per-type toggle | None suppressed | User |
| Quiet hours | Start/end time + timezone | None | User |

---

## 3. Email Notifications (from Make patterns)

### Email Notification Events

Based on Make's email notification system:

| Event | Email Subject Pattern | Recipients | Timing |
|-------|----------------------|------------|--------|
| Execution error | "[FlowHolt] Workflow '{name}' failed" | Workflow owner + watchers | Digest |
| Auto-deactivation | "[FlowHolt] Workflow '{name}' has been deactivated" | Workflow owner + team admins | Instant |
| Warning (execution interrupted) | "[FlowHolt] Workflow '{name}' ended with warning" | Workflow owner | Digest |
| Credit exhaustion | "[FlowHolt] Credit limit reached for workspace '{name}'" | Workspace admins + billing roles | Instant |
| Connection expiring | "[FlowHolt] {N} connections expiring soon" | Connection owner | Daily |
| Dead-letter items | "[FlowHolt] {N} items in dead-letter queue" | Workflow owner | Daily |
| Deployment approval needed | "[FlowHolt] Review requested: '{workflow}' → {environment}" | Approvers | Instant |

### Email Digest Aggregation

Instead of sending one email per event (spam), aggregate into digests:

```
Subject: [FlowHolt] Daily summary for workspace "Production"

Errors (3 workflows affected):
  • "Sync Customers" failed 12 times (last: 2h ago) — ConnectionError
  • "Process Orders" failed 3 times — StepTimeoutError
  • "Update CRM" auto-deactivated after 8 consecutive failures

Warnings:
  • 2 executions interrupted (duration limit)
  • Webhook queue at 82% capacity

Connections:
  • Slack OAuth expires in 5 days
  • Stripe API key test failed

Credits: 78% consumed (15,600 / 20,000)
```

### Email Templates

All emails use a consistent template:
- FlowHolt logo header
- Event type badge (error=red, warning=amber, info=blue)
- Event details with deep links to relevant pages
- Quick action buttons ("View execution", "Reactivate workflow", "Manage connections")
- Unsubscribe link per notification type
- Footer: workspace name, help link

---

## 4. Webhook Notifications (Push)

Users can configure webhook endpoints to receive notification events as structured JSON.

### Configuration

```
Settings → Workspace → Notifications → Webhook Endpoints
```

| Field | Type | Description |
|-------|------|-------------|
| URL | string | HTTPS endpoint |
| Events | multi-select | Which event types to send |
| Secret | string | HMAC-SHA256 signing secret |
| Active | boolean | Enable/disable |

### Webhook Payload Format

```json
{
    "id": "notif_abc123",
    "type": "workflow.error",
    "timestamp": "2026-04-17T14:32:00.000Z",
    "workspace_id": "ws_123",
    "data": {
        "workflow_id": "wf_456",
        "workflow_name": "Sync Customers",
        "execution_id": "exec_789",
        "error_type": "ConnectionError",
        "error_message": "Slack API returned 429 Too Many Requests",
        "node_name": "Send Slack Message",
        "consecutive_errors": 3
    }
}
```

### Webhook Delivery

- Retry on failure: 3 attempts with exponential backoff (10s, 60s, 300s)
- Timeout: 10 seconds per attempt
- Signature: `X-FlowHolt-Signature: sha256=<HMAC of body>`
- Content-Type: `application/json`
- On 3 consecutive delivery failures → disable endpoint + notify user

---

## 5. Log Streaming (from n8n patterns)

### Event Taxonomy (100+ events)

Structured events emitted by every platform action, organized by domain.

#### Workflow Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `workflow.created` | New workflow saved | id, name, creator_id |
| `workflow.updated` | Workflow definition changed | id, name, editor_id, changes_summary |
| `workflow.deleted` | Workflow removed | id, name, deleter_id |
| `workflow.activated` | Scheduling turned on | id, name, activator_id |
| `workflow.deactivated` | Scheduling turned off (manual or auto) | id, name, reason, deactivator_id |
| `workflow.promoted` | Published to higher environment | id, from_env, to_env, promoter_id |
| `workflow.rolled_back` | Reverted to previous version | id, from_version, to_version |
| `workflow.shared` | Sharing settings changed | id, share_type, target_id |

#### Execution Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `execution.started` | Execution begins | execution_id, workflow_id, mode, trigger_type |
| `execution.completed` | Execution finished successfully | execution_id, duration_ms, items_processed, credits_used |
| `execution.failed` | Execution errored | execution_id, error_type, error_message, failed_node |
| `execution.warning` | Warning emitted | execution_id, warning_type, message |
| `execution.retrying` | Auto-retry triggered | execution_id, retry_attempt, next_retry_at |
| `execution.dead_lettered` | Moved to dead-letter queue | execution_id, reason, item_id |
| `execution.replayed` | Manual replay triggered | execution_id, original_execution_id |
| `execution.cancelled` | User cancelled running execution | execution_id, canceller_id |

#### Node Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `node.started` | Node begins processing | execution_id, node_name, node_type, item_count |
| `node.completed` | Node finished | execution_id, node_name, duration_ms, output_items |
| `node.failed` | Node errored | execution_id, node_name, error_type, error_message |
| `node.retrying` | Node-level retry | execution_id, node_name, attempt, max_attempts |

#### Connection Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `connection.created` | New connection saved | connection_id, type, creator_id |
| `connection.updated` | Connection modified | connection_id, type, updater_id |
| `connection.deleted` | Connection removed | connection_id, type, deleter_id |
| `connection.test_success` | Health check passed | connection_id, type, response_time_ms |
| `connection.test_failed` | Health check failed | connection_id, type, error_message |
| `connection.token_refreshed` | OAuth token refreshed | connection_id, type |
| `connection.token_expired` | OAuth token expired | connection_id, type |

#### Auth Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `auth.login` | User logged in | user_id, ip, user_agent, method |
| `auth.logout` | User logged out | user_id |
| `auth.login_failed` | Login attempt failed | email, ip, reason |
| `auth.password_changed` | Password updated | user_id |
| `auth.api_key_created` | New API key generated | user_id, key_prefix |
| `auth.api_key_revoked` | API key revoked | user_id, key_prefix |
| `auth.mfa_enabled` | MFA turned on | user_id, method |
| `auth.mfa_disabled` | MFA turned off | user_id |

#### Team/Org Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `team.member_invited` | Invitation sent | team_id, invitee_email, role, inviter_id |
| `team.member_joined` | Invitation accepted | team_id, user_id, role |
| `team.member_removed` | Member removed | team_id, user_id, remover_id |
| `team.member_role_changed` | Role updated | team_id, user_id, old_role, new_role |
| `workspace.created` | New workspace | workspace_id, name, creator_id |
| `workspace.deleted` | Workspace removed | workspace_id, name, deleter_id |
| `org.settings_changed` | Org-level setting modified | setting_key, old_value, new_value, changer_id |

#### Credit Events

| Event | When | Payload Fields |
|-------|------|---------------|
| `credits.consumed` | Credits used by execution | workspace_id, amount, remaining, execution_id |
| `credits.threshold_reached` | Usage hit 80/90/100% | workspace_id, percentage, plan_limit |
| `credits.reset` | Monthly credit reset | workspace_id, new_balance |
| `credits.purchased` | Extra credits bought | workspace_id, amount, cost |

### Log Stream Destinations

| Destination | Protocol | Configuration |
|-------------|----------|---------------|
| **Syslog** | RFC 5424 over TCP/TLS | Host, port, facility, app_name |
| **Webhook** | HTTPS POST | URL, auth header, batch_size, batch_interval |
| **Sentry** | Sentry SDK | DSN, environment tag |
| **Custom** | Stdout/file | File path or stdout (for container log aggregation) |

### Destination Configuration UI

```
Settings → Workspace → Log Streaming
```

| Field | Type | Description |
|-------|------|-------------|
| Destination type | dropdown | Syslog / Webhook / Sentry / Custom |
| Active | boolean | Enable/disable |
| Event filter | multi-select | Which event domains to stream (workflow, execution, node, auth, etc.) |
| Severity filter | multi-select | error / warning / info / debug |
| Batch settings | number × 2 | batch_size (events), batch_interval_seconds |

### Syslog Format (RFC 5424)

```
<134>1 2026-04-17T14:32:00.000Z flowholt.app workflow.execution - - - 
{"event":"execution.failed","execution_id":"exec_789","workflow_id":"wf_456",
"error_type":"ConnectionError","error_message":"Slack API 429"}
```

### Webhook Batch Format

```json
{
    "events": [
        {"event": "execution.started", "timestamp": "...", "data": {...}},
        {"event": "node.completed", "timestamp": "...", "data": {...}},
        {"event": "execution.completed", "timestamp": "...", "data": {...}}
    ],
    "batch_id": "batch_abc",
    "count": 3
}
```

---

## 6. Audit Log

### Purpose

Immutable record of all security-relevant and administrative actions. Required for compliance (SOC 2, GDPR).

### Audit Log Entry Schema

```python
class AuditLogEntry(Base):
    __tablename__ = "audit_log"
    
    id: str               # UUID
    timestamp: datetime    # UTC
    actor_id: str          # user who performed action (nullable for system)
    actor_type: str        # "user" | "system" | "api_key" | "webhook"
    action: str            # event type (e.g., "workflow.deleted")
    resource_type: str     # "workflow" | "connection" | "team" | "user" | ...
    resource_id: str       # ID of affected resource
    workspace_id: str      # context
    org_id: str            # context
    ip_address: str        # actor's IP (nullable for system)
    user_agent: str        # actor's user agent (nullable)
    metadata: dict         # additional event-specific data (JSONB)
    status: str            # "success" | "failure" | "denied"
```

### Audit Log Retention

| Plan | Retention |
|------|-----------|
| Free | 7 days |
| Core | 30 days |
| Pro | 90 days |
| Teams | 180 days |
| Enterprise | 365 days (configurable) |

### Audit Log UI

Route: `/workspace/:id/settings/audit-log`

- Filterable table: by actor, action, resource type, date range, status
- Export to CSV/JSON
- Real-time streaming (new entries appear live)
- Link from audit entry → resource page

---

## 7. Alerting Rules (Phase 2)

User-defined alert conditions that trigger notifications or webhooks.

### Alert Rule Schema

```python
class AlertRule:
    id: str
    workspace_id: str
    name: str                    # "High error rate on Sync workflow"
    condition_type: str          # "threshold" | "consecutive" | "absence"
    condition_config: dict       # type-specific config
    actions: list[AlertAction]   # what to do when triggered
    cooldown_minutes: int        # don't re-fire within N minutes
    active: bool
```

### Condition Types

| Type | Config | Example |
|------|--------|---------|
| `threshold` | `{metric, operator, value, window_minutes}` | Error count > 10 in 60 minutes |
| `consecutive` | `{event_type, count}` | 5 consecutive execution failures |
| `absence` | `{event_type, expected_interval_minutes}` | No execution.completed in 120 minutes (cron missed?) |

### Alert Actions

| Action | Config | Description |
|--------|--------|-------------|
| `notify_in_app` | `{user_ids}` | Send in-app notification |
| `send_email` | `{recipients}` | Send email to addresses |
| `call_webhook` | `{url, secret}` | POST alert payload to URL |
| `deactivate_workflow` | `{workflow_id}` | Auto-deactivate on alert |
| `run_workflow` | `{workflow_id}` | Trigger an "alert handler" workflow |

---

## 8. Consecutive Error Tracking → Auto-Deactivation

From Make's pattern, refined for FlowHolt:

### Mechanism

1. Track consecutive execution errors per workflow (not per node)
2. Warnings do NOT increment the counter
3. Successful execution resets the counter to 0
4. Threshold: configurable per workspace (default: 8)

### Deactivation Flow

```
Error #1 → counter=1, no action
Error #2 → counter=2, no action
...
Error #8 → counter=8 → auto-deactivate workflow
  → Set workflow.active = false
  → Create notification: workflow.deactivated
  → Send instant email to owner + team admins
  → Log audit entry: workflow.deactivated (reason: consecutive_errors)
  → Log stream event: workflow.deactivated
```

### Reactivation

- User manually reactivates → counter resets to 0
- If first execution after reactivation fails → counter=1 (not back to 8)
- Notification: workflow.reactivated

---

## 9. Implementation Phases

### Phase 1 — Core Notifications

- [ ] Notification center UI (bell icon, dropdown, notification list page)
- [ ] In-app notification store (database table + API)
- [ ] System notification types (workflow.error, workflow.deactivated, execution.incomplete)
- [ ] Email notification templates (error, deactivation, credit alerts)
- [ ] Email digest aggregation (hourly default)
- [ ] Notification preferences per user
- [ ] Consecutive error tracking → auto-deactivation
- [ ] Audit log table + basic UI

### Phase 2 — Log Streaming + Webhooks

- [ ] Event bus (internal pub/sub for all platform events)
- [ ] Full event taxonomy (100+ events across all domains)
- [ ] Syslog destination
- [ ] Webhook destination (batched)
- [ ] Sentry destination
- [ ] Webhook notification endpoints (user-configured push)
- [ ] Log streaming configuration UI
- [ ] Audit log filters, export, retention policies

### Phase 3 — Alerting Rules

- [ ] Alert rule engine (threshold, consecutive, absence)
- [ ] Alert action execution (notify, email, webhook, deactivate, run workflow)
- [ ] Alert history and cooldown tracking
- [ ] Alert rule UI (create, edit, test, history)
- [ ] Prometheus metrics endpoint for external monitoring

---

## 10. Database Schema

```sql
-- Notification store
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    type VARCHAR(100) NOT NULL,          -- notification type enum
    severity VARCHAR(20) NOT NULL,       -- error, warning, info
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,                          -- type-specific payload
    read BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    auto_clear_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE NOT read;

-- Audit log (append-only)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID,
    actor_type VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    workspace_id UUID NOT NULL,
    org_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'success'
);

CREATE INDEX idx_audit_log_workspace_time ON audit_log(workspace_id, timestamp DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Webhook notification endpoints
CREATE TABLE notification_webhooks (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    url TEXT NOT NULL,
    secret TEXT NOT NULL,                -- HMAC signing key (encrypted)
    events TEXT[] NOT NULL,              -- array of event type patterns
    active BOOLEAN DEFAULT TRUE,
    consecutive_failures INT DEFAULT 0,
    last_failure_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log stream destinations
CREATE TABLE log_stream_destinations (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    destination_type VARCHAR(20) NOT NULL,  -- syslog, webhook, sentry, custom
    config JSONB NOT NULL,                  -- type-specific config (encrypted secrets)
    event_filter TEXT[],                    -- event domain filter
    severity_filter TEXT[],                 -- severity filter
    batch_size INT DEFAULT 100,
    batch_interval_seconds INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert rules
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    condition_type VARCHAR(20) NOT NULL,
    condition_config JSONB NOT NULL,
    actions JSONB NOT NULL,              -- array of AlertAction
    cooldown_minutes INT DEFAULT 60,
    active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consecutive error tracking
CREATE TABLE workflow_error_counters (
    workflow_id UUID PRIMARY KEY REFERENCES workflows(id),
    consecutive_errors INT DEFAULT 0,
    last_error_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ
);
```

---

## Related Files

- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` — credit model, analytics dashboard
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — error types, warning taxonomy, dead-letter
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` — queue management
- `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` — alert wireframes
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` — runtime API contracts
- [[wiki/concepts/runtime-operations]] — runtime operations dashboard
- [[wiki/concepts/observability-analytics]] — observability surfaces
