# Spec 91 — FlowHolt Analytics & Insights Deep Spec
**Source research:** n8n Insights dashboard, Make.com Analytics Dashboard
**Status:** Final specification

---

## 1. Overview

FlowHolt needs a comprehensive analytics system to give users visibility into their automation performance. This spec defines the **Insights** system modeled on the best of n8n and Make.

**n8n approach:** "Insights" — production-execution metrics only, time-saved ROI tracking, per-workflow breakdown
**Make approach:** "Analytics Dashboard" — operations consumed, error rates, team/folder filtering (Enterprise only)

**FlowHolt decision:** Combine both. A free "summary banner" for all plans + a richer "Analytics dashboard" for paid plans, with both per-workflow execution metrics AND credit/operations consumption tracking.

---

## 2. Three-Part Insights System (matching n8n)

### Part 1: Insights Summary Banner
- Location: Top of the **Home/Overview** page, always visible
- Shows **last 7 days** rolling window
- Available on **all plans** (including free)
- Metrics shown:
  - Total production executions
  - Failed executions
  - Failure rate %
  - Time saved (if configured on ≥1 workflow)
  - Average run time (including wait node time)
- Each metric has a **delta indicator** vs previous 7-day period (↑/↓ arrow)

### Part 2: Insights Dashboard
- Location: Left rail navigation → "Insights" section
- Available on **Pro and above** plans
- Full breakdown with interactive charts + per-workflow table
- Summary banner metrics are clickable → jump to corresponding chart in dashboard

### Part 3: Time Saved / ROI Tracking
- Per-workflow configuration (in Workflow Settings)
- Two modes: Fixed or Dynamic
- Free plan: Basic fixed time saved on 1 workflow
- Pro+: Unlimited workflows with dynamic time saved

---

## 3. Insights Dashboard — Detailed Spec

### 3.1 Metrics Tracked
| Metric | Description |
|--------|-------------|
| **Production executions** | All auto-triggered executions (not manual test runs, not sub-workflow executions) |
| **Failed executions** | Executions ending in ERROR status |
| **Failure rate %** | `failed / total * 100` |
| **Time saved** | Sum of per-workflow time saved × execution count |
| **Avg run time** | Mean execution duration including wait node wait times |
| **Credits used** | FlowHolt credit consumption (like Make's "operations") |
| **Credit trend %** | Change vs previous period |

### 3.2 Time Period Options (by plan)
| Plan | Available periods |
|------|-----------------|
| Free | 7 days only (summary banner) |
| Pro | 7 days, 14 days |
| Business | 24 hours, 7 days, 14 days, 30 days |
| Enterprise | 24h, 7d, 14d, 30d, 90d, 6 months, 1 year |

### 3.3 Filters
- **Status**: Active / Inactive / Invalid
- **Team**: (multi-team organizations)
- **Folder**: Filter by workflow folder
- **Time period**: dropdown per plan limits above

### 3.4 Charts Section
Interactive line/bar charts, one per metric, with period comparison:
1. Executions over time (line chart, grouped by day)
2. Error rate over time (area chart)
3. Credits consumed over time (bar chart)
4. Time saved cumulative (area chart, only if time saved configured)
5. Avg run time per workflow (horizontal bar chart, sortable)

Each chart: click data point → drill into that day's execution list

### 3.5 Per-Workflow Table
Columns (configurable which to show):
| Column | Description |
|--------|-------------|
| Workflow | Name + status dot (Green=Active, Red=Invalid, Gray=Inactive) |
| Executions | Total production executions in period |
| Change % | vs previous period |
| Failed | Count of failed executions |
| Error rate % | failed / total |
| Time saved | Minutes saved (if configured) |
| Avg run time | Mean seconds/ms per execution |
| Credits used | Total credits consumed |
| Team | Which team owns this workflow |
| Folder | Which folder it's in |

Default sort: by executions descending.
Click any row → go to that workflow's detail page.

### 3.6 Drill-Down View
Clicking a workflow row in the table → drill-down panel shows:
- Execution history for that workflow in the selected period
- Chart: success vs failure count per day
- Breakdown by trigger type
- Error list (most frequent error types)
- Individual execution links

---

## 4. Time Saved / ROI System

### 4.1 Fixed Time Saved
- User enters: "X minutes per execution"
- FlowHolt multiplies by production execution count
- Example: 5 min/execution × 1,200 executions = 100 hours saved

**Configuration location:** Workflow Settings → "Estimated time saved" → Fixed → Enter minutes

### 4.2 Dynamic Time Saved
- User places **Time Saved nodes** at key points in the workflow
- Each Time Saved node has:
  - **Time saved (minutes)**: how many minutes this path saves
  - **Calculation mode**: 
    - "Once per execution" — regardless of item count
    - "Per item" — multiply minutes × number of input items
- FlowHolt sums all Time Saved nodes that executed in a given run
- Sub-workflow time saved is NOT counted in parent (same as n8n limitation, may be added later)

**Configuration location:** 
1. Workflow Settings → "Estimated time saved" → Dynamic (enables the special Time Saved node)
2. Drag **Time Saved** node onto canvas at points where time is saved
3. Configure minutes + calculation mode in node inspector

---

## 5. Make Analytics Dashboard Features Incorporated

From Make's dashboard, incorporating:

### 5.1 Operations/Credits by Team
- In multi-team orgs: show credit consumption broken down per team
- Bar chart: Team A consumed X%, Team B consumed Y%
- Link to team detail page for per-team workflow breakdown

### 5.2 Trend Indicators
- Every top metric card has a delta arrow (↑/↓) + percentage change
- Trend is relative to the PREVIOUS period of the same length
  - 7-day view → compare to previous 7 days
  - 30-day view → compare to previous 30 days

### 5.3 Status Column Visual Markers
- Green filled dot = Active workflow (executing on schedule)
- Red filled dot = Invalid workflow (config error, won't run)
- Empty/gray dot = Inactive workflow (paused)

---

## 6. n8n Insights Features Incorporated

### 6.1 Insights Summary Banner on Home
- Always shown at top of Home page for ALL plans
- Compact 5-metric row (clickable to go to full dashboard)

### 6.2 Production-Only Tracking
- Manual test runs (canvas "Run" button) are EXCLUDED from insights
- Sub-workflow executions are EXCLUDED
- Error workflow executions are EXCLUDED  
- Only production (schedule/webhook/event-triggered) runs count

### 6.3 Named Comparisons
- "vs previous period" delta shown for each metric
- Color coded: green = improvement, red = regression
- Executions up = green (more automation working)
- Error rate up = red (worse)
- Time saved up = green

---

## 7. Analytics Access by Plan

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| Summary banner (7-day) | ✓ | ✓ | ✓ | ✓ |
| Dashboard (basic) | — | ✓ | ✓ | ✓ |
| 30-day period | — | — | ✓ | ✓ |
| 90-day / 6m / 1yr | — | — | — | ✓ |
| Team breakdown | — | — | — | ✓ |
| Folder filter | — | ✓ | ✓ | ✓ |
| Time saved (fixed) | 1 workflow | Unlimited | Unlimited | Unlimited |
| Time saved (dynamic) | — | ✓ | ✓ | ✓ |
| Credit/ops usage chart | — | ✓ | ✓ | ✓ |
| Drill-down to executions | — | ✓ | ✓ | ✓ |
| Export CSV | — | — | ✓ | ✓ |

---

## 8. Backend Implementation Plan

### 8.1 Data collection
- On each execution completion, write to `execution_metrics` table:
  ```
  workflow_id, execution_id, triggered_at, completed_at, 
  duration_ms, status (success/failed), trigger_type,
  node_count, items_processed, credits_consumed,
  time_saved_minutes (from Time Saved nodes)
  ```
- Only write records for `trigger_type != 'manual'`

### 8.2 Aggregation queries
- Pre-aggregate daily summaries (`metrics_daily`) for fast dashboard loads:
  ```
  date, workflow_id, executions, failed, duration_sum, time_saved_sum, credits_sum
  ```
- Dashboard queries use pre-aggregated table with GROUP BY date + period filters

### 8.3 Retention
- Raw execution metrics: 90 days (Free), 1 year (Pro+), configurable (Enterprise)
- Daily aggregates: kept indefinitely (small data)
- Insights collection starts from the date the feature is first enabled (no backfill of historic data, same as n8n)

---

## 9. Time Saved Node Spec

```
Node type: time_saved
Display name: "Time Saved"
Category: Utility
Visual: Clock icon with ✓ badge

Parameters:
  - time_saved_minutes: number (default: 5, min: 0.1, max: 1440)
  - calculation_mode: "once" | "per_item" (default: "once")

Behavior:
  - Passes data through unchanged (passthrough node)
  - When executed, records: { step_id, minutes: X, items: N } to execution context
  - At execution end, backend sums all time_saved records

UI positioning:
  - Can be placed at ANY point in workflow (not just end)
  - Can have MULTIPLE Time Saved nodes in one workflow
  - Works on any branch (router paths)
```

---

## 10. UI Location: Insights in Navigation

```
Left Rail:
├── Home (with summary banner)
├── Workflows
├── Executions
├── Insights ← NEW dedicated section
│   ├── Overview (charts + banner metrics)
│   ├── Workflows (per-workflow table)  
│   └── Usage (credits/operations consumption)
├── Variables
├── Connections
└── Settings
```

The banner on the Home page links "View all Insights →" to the Insights section.

---

## 11. Insights vs Analytics Dashboard Naming

FlowHolt uses **"Insights"** (n8n naming) for the workflow performance section.
FlowHolt uses **"Usage"** for the credits/operations consumption section.
Combined together in the **"Insights"** nav section with two sub-tabs.

Make calls theirs "Analytics Dashboard" — we prefer "Insights" as it's more user-friendly and less corporate.

---

## Summary of New Requirements Added

1. **Insights summary banner** on Home page for all plans (5 metrics, last 7 days)
2. **Insights dashboard** with per-workflow table + time-period charts (paid plans)
3. **Time Saved node** type (utility node) for dynamic ROI calculation
4. **Fixed/Dynamic time saved** per workflow in Workflow Settings
5. **Credits/operations usage** chart alongside execution metrics
6. **Production-only tracking** — exclude manual, sub-workflow, error workflow runs
7. **Delta indicators** on all metrics (vs previous period, color coded)
8. **Per-plan period access**: Free=7d only, Pro=7/14d, Business=+30d, Enterprise=+90d/1yr
9. **Team + Folder filters** for multi-team organizations (Enterprise)
10. **Drill-down**: click workflow → see its execution breakdown for selected period
