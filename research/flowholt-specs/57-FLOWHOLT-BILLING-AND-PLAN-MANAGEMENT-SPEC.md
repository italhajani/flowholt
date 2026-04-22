# FlowHolt Billing, Plan Management, and Credit System Specification

> **Status:** New file created 2026-04-17  
> **Direction:** FlowHolt adopts Make's proven credit-based billing model (1 operation = 1 credit), adapted for FlowHolt's workspace-centric architecture and AI agent pricing.  
> **Vault:** [[wiki/concepts/observability-analytics]]  
> **Raw sources:**  
> - Make billing: `research/make-help-center-export/pages_markdown/billing.md`, `pricing.md`, `operations.md`  
> - Make PDF pricing sections: `research/make-pdf-full.txt` §Pricing, §Plans, §Credits  
> - Make team credit allocation: `research/make-pdf-full.txt` §Teams  
> - n8n community edition licensing: `research/n8n-docs-export/pages_markdown/hosting/` (self-host pricing context)  
> **See also:** `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md`  

---

## 1. Credit System Architecture

### Core Unit: 1 Operation = 1 Credit

Every node execution consumes 1 credit. This is the foundational billing metric.

| Action | Credits |
|--------|---------|
| 1 node processes 1 item | 1 credit |
| 1 node processes 5 items | 5 credits |
| Trigger node fires | 1 credit |
| Trigger node fires, no data (empty poll) | 0 credits |
| Internal flow control node (Router, If/Else, Merge) | 1 credit per item |
| Error handler executes | 1 credit |
| Sub-workflow call | 1 credit (call) + credits for all nodes inside sub-workflow |

### AI Token Pricing (Separate from Operations)

AI nodes (LLM calls, embeddings, vector search) consume additional AI credits:

| AI Action | Credit Cost |
|-----------|-------------|
| LLM call (per 1K input tokens) | 0.5 credits |
| LLM call (per 1K output tokens) | 1.5 credits |
| Embedding (per 1K tokens) | 0.1 credits |
| Vector search (per query) | 0.2 credits |

AI credits are deducted from the same credit pool as operation credits. Plans include a base allocation of AI credits.

### What Does NOT Consume Credits

| Action | Cost |
|--------|------|
| Saving/editing a workflow | 0 |
| Viewing execution history | 0 |
| Webhook received but workflow inactive | 0 |
| Scheduled poll with no new data | 0 |
| Form page load (GET) | 0 |
| Data pinning in Studio | 0 |
| Manual test execution in Studio | 0 (Free plan: counted) |

---

## 2. Plan Tiers

### Tier Structure

| Plan | Monthly Price | Included Credits | Max Workflows | Max Team Members | Key Features |
|------|-------------|-----------------|--------------|-----------------|--------------|
| **Free** | $0 | 1,000 | 5 | 1 (solo) | Basic nodes, manual execution, 5-min timeout |
| **Core** | $12/mo | 10,000 | 25 | 1 (solo) | All triggers, scheduled execution, 20-min timeout, basic integrations |
| **Pro** | $29/mo | 25,000 | Unlimited | 1 (solo) | All nodes, AI nodes, 40-min timeout, priority execution, data stores |
| **Teams** | $49/mo per seat | 50,000 (base) + 10,000/seat | Unlimited | Unlimited | Multi-user, RBAC, shared connections, team credit allocation |
| **Enterprise** | Custom | Custom | Unlimited | Unlimited | SSO, custom roles, SLA, dedicated support, audit log, 120-min timeout |

### Annual Billing

- 20% discount on annual plans
- Annual plans: credits allocated monthly (not all at once)
- Unused monthly credits do NOT roll over

---

## 3. Credit Tracking and Consumption

### Per-Execution Tracking

```python
class ExecutionCreditLog:
    execution_id: str
    workflow_id: str
    workspace_id: str
    started_at: datetime
    completed_at: datetime
    total_credits: int              # sum of all node credits
    ai_credits: float               # sum of AI token credits
    credit_breakdown: list[NodeCredit]  # per-node detail

class NodeCredit:
    node_id: str
    node_name: str
    node_type: str
    items_processed: int
    credits_consumed: int
    ai_tokens_input: int            # 0 for non-AI nodes
    ai_tokens_output: int           # 0 for non-AI nodes
    ai_credits: float               # 0 for non-AI nodes
```

### Workspace Credit Balance

```python
class WorkspaceCreditBalance:
    workspace_id: str
    plan_credits_total: int         # monthly allocation
    plan_credits_used: int          # used this billing period
    plan_credits_remaining: int     # available
    extra_credits_purchased: int    # bonus credits bought
    extra_credits_remaining: int    # bonus credits available
    ai_credits_used: float
    billing_period_start: date
    billing_period_end: date
    last_updated: datetime
```

### Credit Consumption Order

1. Plan credits first (use-it-or-lose-it monthly)
2. Extra purchased credits second (non-expiring until consumed)
3. When both exhausted → CreditLimitError (execution paused)

---

## 4. Credit Thresholds and Alerts

| Threshold | Action |
|-----------|--------|
| 80% consumed | In-app notification (warning) |
| 90% consumed | In-app notification + email to workspace admins |
| 100% consumed | Execution paused. CreditLimitError. Instant email + in-app alert. |

### Overage Options (per workspace setting)

| Mode | Behavior | Default |
|------|----------|---------|
| **Hard stop** | Executions stop when credits exhausted | Free, Core |
| **Auto-purchase** | Automatically buy extra credit packs | Pro (opt-in) |
| **Overage allowance** | Allow up to N% overage, bill at cycle end | Teams, Enterprise |

### Extra Credit Packs

| Pack | Credits | Price | Per-Credit Cost | Surcharge |
|------|---------|-------|----------------|-----------|
| Small | 5,000 | $8 | $0.0016 | ~25% |
| Medium | 25,000 | $35 | $0.0014 | ~17% |
| Large | 100,000 | $120 | $0.0012 | ~0% |

Extra credits never expire (consumed after plan credits each month).

---

## 5. Team Credit Allocation (Teams + Enterprise)

### How It Works

On Teams/Enterprise plans, org admins allocate credits to teams:

```
Org credit pool: 100,000/month
  ├── Team "Sales Ops": 40,000 allocated
  ├── Team "Marketing": 30,000 allocated
  ├── Team "Engineering": 20,000 allocated
  └── Unallocated reserve: 10,000
```

### Allocation Rules

| Rule | Behavior |
|------|----------|
| Allocation enforcement | Hard (team cannot exceed allocation) or Soft (warning only, uses org pool) |
| Reallocation | Admins can move credits between teams mid-cycle |
| Unallocated reserve | Credits not assigned to any team. Available to all teams if their allocation is exhausted (Soft mode only). |
| Per-team alerts | Each team gets its own 80%/90%/100% threshold notifications |
| Monthly reset | All allocations reset to configured values at billing period start |

### Credit Allocation API

```
PUT /api/v1/org/{org_id}/teams/{team_id}/credit-allocation
{
    "monthly_allocation": 40000,
    "enforcement": "hard"  // or "soft"
}
```

---

## 6. Payment Management

### Payment Methods

| Method | Plans | Notes |
|--------|-------|-------|
| Credit card (Stripe) | All | Default |
| ACH / bank transfer | Enterprise | Net-30 invoicing |
| PayPal | Core, Pro | Optional |
| Wire transfer | Enterprise | For annual contracts |

### Billing Events

| Event | Action |
|-------|--------|
| Subscription created | Charge first month/year |
| Monthly renewal | Charge + reset credits |
| Annual renewal | Charge annual amount, monthly credit allocation begins |
| Upgrade (mid-cycle) | Prorate: charge difference, add credit difference |
| Downgrade (mid-cycle) | Takes effect next billing period. Current credits preserved until cycle end. |
| Cancel | Active until end of current billing period. Data retained 30 days after expiry. |
| Payment failed | 3 retry attempts (day 1, 3, 7). After 3 failures: account suspended, workflows paused. |

### Invoice Structure

```
FlowHolt Invoice — April 2026

Workspace: "Acme Production"
Plan: Pro ($29/mo)
Billing period: Apr 1 — Apr 30, 2026

Line items:
  Pro plan (monthly)                    $29.00
  Extra credit pack (5,000 credits)      $8.00
  Extra credit pack (5,000 credits)      $8.00
                                       -------
  Total                                 $45.00

Credit usage:
  Plan credits: 25,000 / 25,000 (100%)
  Extra credits: 7,234 / 10,000 (72.3%)
  AI credits: 3,456
```

---

## 7. Plan Limits and Feature Gates

### Feature Gates by Plan

| Feature | Free | Core | Pro | Teams | Enterprise |
|---------|------|------|-----|-------|-----------|
| Manual execution | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scheduled execution | ❌ | ✅ | ✅ | ✅ | ✅ |
| Webhook triggers | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI nodes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Data stores | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom functions | ❌ | ❌ | ✅ | ✅ | ✅ |
| Multi-user | ❌ | ❌ | ❌ | ✅ | ✅ |
| RBAC (5+5 roles) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Custom roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| SSO (SAML/OIDC) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit log | ❌ | ❌ | ❌ | ✅ (30d) | ✅ (365d) |
| Log streaming | ❌ | ❌ | ❌ | ✅ | ✅ |
| Environment pipeline | ❌ | ❌ | ✅ (2 env) | ✅ (3 env) | ✅ (unlimited) |
| Execution history | 7 days | 30 days | 90 days | 180 days | 365 days |
| Max execution duration | 5 min | 20 min | 40 min | 40 min | 120 min |
| Max data per step | 1 MB | 5 MB | 5 MB | 10 MB | 50 MB |
| Webhook queue max | 100 | 1,000 | 10,000 | 10,000 | 100,000 |
| API rate limit | 10 req/s | 50 req/s | 100 req/s | 200 req/s | Custom |
| Priority execution | ❌ | ❌ | ✅ | ✅ | ✅ (dedicated) |
| Studio test credits free | ❌ | ✅ | ✅ | ✅ | ✅ |

### Enforcement Points

```python
# Before execution starts
def check_execution_allowed(workspace, workflow, trigger_type):
    plan = workspace.plan
    
    # Check credits
    if workspace.credits_remaining <= 0 and not workspace.overage_enabled:
        raise CreditLimitError("Credit limit reached")
    
    # Check feature gate
    if trigger_type == "schedule" and plan.tier == "free":
        raise PlanFeatureError("Scheduled execution requires Core plan or higher")
    
    # Check execution limits
    if estimated_duration > plan.max_execution_minutes * 60:
        emit_warning(ExecutionInterruptedWarning)
    
    # Check concurrent execution limit
    active = count_active_executions(workspace.id)
    if active >= plan.max_concurrent_executions:
        queue_for_later(workflow, trigger_type)
```

---

## 8. Upgrade and Downgrade Flows

### Upgrade Flow

1. User clicks "Upgrade" in settings or hits a plan limit
2. Plan comparison page with feature matrix
3. Select new plan → enter/confirm payment method
4. Proration calculated: `(new_price - old_price) × (days_remaining / days_in_cycle)`
5. New plan activated immediately
6. Credits added: `(new_plan_credits - old_plan_credits) × (days_remaining / days_in_cycle)`
7. Confirmation email with invoice

### Downgrade Flow

1. User selects lower plan
2. Warning: features that will be lost
3. If team members exceed new plan limit → must remove members first
4. If active workflows exceed new plan limit → must deactivate some first
5. Downgrade queued for next billing period
6. Current features remain active until cycle end
7. Confirmation email

### Downgrade Warnings

| Losing | Warning Message |
|--------|----------------|
| Scheduled execution | "{N} scheduled workflows will be paused" |
| AI nodes | "{N} workflows with AI nodes will fail at runtime" |
| Team members | "Remove {N} team members before downgrading" |
| Environments | "Staging/production environments will revert to draft" |
| Data stores | "Data stores will become read-only (not deleted)" |

---

## 9. Usage Analytics Dashboard

### Route: `/workspace/:id/settings/billing`

### Sections

1. **Current Plan Overview**
   - Plan name, price, renewal date
   - Credit usage gauge (used / total)
   - AI credit usage
   - "Upgrade" / "Buy extra credits" buttons

2. **Credit Usage Over Time**
   - Line chart: daily credit consumption (30-day view)
   - Breakdown: by workflow (top 10 consumers)
   - Breakdown: by node type
   - Breakdown: operations vs AI credits

3. **Workflow Credit Ranking**
   - Table: workflow name, credits this period, % of total, avg credits/run
   - Sortable by any column
   - Click workflow → execution history

4. **Billing History**
   - Invoice list with download links (PDF)
   - Payment method on file
   - "Update payment method" button

5. **Team Credit Allocation** (Teams/Enterprise only)
   - Allocation table per team
   - Usage bars per team
   - "Reallocate" button

---

## 10. Database Schema

```sql
-- Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,          -- "Free", "Core", "Pro", "Teams", "Enterprise"
    tier VARCHAR(20) NOT NULL,          -- "free", "core", "pro", "teams", "enterprise"
    monthly_price_cents INT NOT NULL,
    annual_price_cents INT,
    included_credits INT NOT NULL,
    feature_flags JSONB NOT NULL,       -- {"scheduled_execution": true, "ai_nodes": false, ...}
    limits JSONB NOT NULL,              -- {"max_workflows": 25, "max_duration_minutes": 20, ...}
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    plan_id UUID NOT NULL REFERENCES plans(id),
    billing_interval VARCHAR(10) NOT NULL,  -- "monthly" | "annual"
    status VARCHAR(20) NOT NULL,            -- "active", "past_due", "cancelled", "suspended"
    stripe_subscription_id VARCHAR(100),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    downgrade_to_plan_id UUID REFERENCES plans(id),  -- queued downgrade
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit balances (updated in real-time)
CREATE TABLE credit_balances (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id),
    plan_credits_total INT NOT NULL,
    plan_credits_used INT DEFAULT 0,
    extra_credits_total INT DEFAULT 0,
    extra_credits_used INT DEFAULT 0,
    ai_credits_used FLOAT DEFAULT 0,
    overage_mode VARCHAR(20) DEFAULT 'hard_stop',  -- "hard_stop", "auto_purchase", "overage"
    overage_limit_percent INT DEFAULT 0,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    last_reset_at TIMESTAMPTZ
);

-- Credit consumption log (per execution)
CREATE TABLE credit_consumption_log (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    execution_id UUID NOT NULL,
    credits_consumed INT NOT NULL,
    ai_credits_consumed FLOAT DEFAULT 0,
    node_count INT,
    item_count INT,
    consumed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_log_workspace_time ON credit_consumption_log(workspace_id, consumed_at DESC);
CREATE INDEX idx_credit_log_workflow ON credit_consumption_log(workflow_id, consumed_at DESC);

-- Extra credit purchases
CREATE TABLE credit_purchases (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    credits INT NOT NULL,
    price_cents INT NOT NULL,
    stripe_payment_intent_id VARCHAR(100),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    purchased_by UUID NOT NULL REFERENCES users(id)
);

-- Team credit allocations (Teams/Enterprise)
CREATE TABLE team_credit_allocations (
    team_id UUID PRIMARY KEY REFERENCES teams(id),
    monthly_allocation INT NOT NULL,
    enforcement VARCHAR(10) DEFAULT 'soft',  -- "hard" | "soft"
    credits_used INT DEFAULT 0,
    last_reset_at TIMESTAMPTZ
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    stripe_invoice_id VARCHAR(100),
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL,        -- "draft", "open", "paid", "void", "uncollectible"
    period_start DATE,
    period_end DATE,
    line_items JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);
```

---

## 11. Implementation Phases

### Phase 1 — Basic Billing

- [ ] Plan table with feature flags and limits
- [ ] Stripe integration (subscription create, update, cancel)
- [ ] Credit balance tracking (real-time consumption)
- [ ] Credit consumption logging per execution
- [ ] Plan feature gate enforcement (check before execution)
- [ ] Credit threshold notifications (80%, 90%, 100%)
- [ ] Hard stop on credit exhaustion
- [ ] Basic billing settings page (plan info, credit gauge, payment method)
- [ ] Upgrade flow with proration
- [ ] Downgrade flow (queued for next cycle)

### Phase 2 — Advanced Billing

- [ ] Extra credit pack purchases
- [ ] Overage modes (auto-purchase, overage allowance)
- [ ] AI credit tracking (token-based pricing)
- [ ] Credit usage analytics dashboard
- [ ] Workflow credit ranking table
- [ ] Invoice history with PDF download
- [ ] Annual billing with monthly credit allocation
- [ ] Payment failure handling (retry + suspension)

### Phase 3 — Team Billing

- [ ] Team credit allocation (org admin)
- [ ] Per-team credit tracking and alerts
- [ ] Reallocation mid-cycle
- [ ] Hard/soft enforcement modes
- [ ] Per-seat pricing for Teams plan
- [ ] Enterprise custom plan configuration
- [ ] ACH / wire transfer payment methods
- [ ] Custom invoicing (Enterprise)

---

## 12. Open Decisions (from `wiki/data/open-decisions.md`)

| # | Decision | Status | Notes |
|---|----------|--------|-------|
| 25 | Affiliate/referral program model | Unresolved | Revenue share % vs flat bonus vs credit grants |
| 26 | Exact billing tier pricing and credit amounts | Unresolved | Numbers in §2 are proposals, not final |
| 27 | Enterprise SLA terms and uptime commitment | Unresolved | 99.9% vs 99.95% vs 99.99%, penalty structure |

These remain business decisions requiring founder/stakeholder input.

---

## Related Files

- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` — credit model integration with analytics
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team hierarchy for team billing
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — billing settings in settings hierarchy
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — CreditLimitError type
- `54-FLOWHOLT-NOTIFICATION-AND-ALERTING-SPEC.md` — credit threshold alerts
- [[wiki/concepts/observability-analytics]] — credit model in vault
- [[wiki/data/open-decisions]] — 3 unresolved business decisions
