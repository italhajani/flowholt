# FlowHolt Settings, Admin, And Observability UX

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Define the control-plane and operator-facing surfaces for settings, administration, runtime operations, analytics, audit, and notifications.

---

## 1. Why this domain matters

FlowHolt is not only a builder tool. It is also:

- a control plane
- a governed runtime
- an approval system
- an operations surface

The redesign must reflect that. This file merges the strongest operator patterns from Make with FlowHolt's planned scope model and runtime roadmap.

---

## 2. Scope model

Settings and admin surfaces are organized by scope:

1. User
2. Organization
3. Team
4. Workspace
5. Environment
6. Workflow
7. Agent

Every settings page should show:

- current scope
- inherited values
- overridden values
- required role

---

## 3. Settings shell

Settings use a dedicated scoped shell:

- scope header
- left section navigation
- main settings form
- right-side inheritance or help panel where useful
- sticky save/footer actions

### Section navigation pattern

Sections are grouped, not flat:

- General
- Security
- Members and access
- Runtime
- Notifications
- Billing and usage
- Advanced

---

## 4. User settings

Pages:

- Profile
- Preferences
- Notifications
- API access
- Connected accounts

Must include:

- theme preference
- keyboard shortcut help
- default workspace
- notification channel preferences

---

## 5. Organization and team admin

### Organization pages

- Overview
- Members
- Teams
- Policies
- Billing
- Audit
- SSO / SCIM
- Limits and plans

### Team pages

- Overview
- Members
- Credits and quotas
- Workspace access
- Policies
- Notifications

### Make-derived patterns to keep

- credits visibility
- threshold alerts
- admin-first navigation clarity
- team-level operational oversight

### Organization navigation shape

The strongest admin navigation model remains a three-group structure:

1. **Organization** - dashboard, members, teams
2. **My Plan** - subscription, usage, billing, payments
3. **Utilities** - variables, notifications, audit, feature controls, provider/app management

---

## 6. Workspace settings

Workspace settings should include:

- general identity
- execution defaults
- retention
- variables
- integrations policy
- AI policy
- notification defaults
- environment rules

These must not be buried across unrelated pages.

---

## 7. Environment and deployment surfaces

Environment deserves a strong UI because FlowHolt plans draft, staging, and production lifecycle features.

Pages:

- Overview
- Versions
- Deployments
- Approval inbox
- Compare
- Rollback history

### Key UI rules

- environment color signals remain restrained
- draft/staging/prod chips always visible
- approvals show requester, diff summary, risk flags

---

## 8. Runtime and observability

The Operations domain should contain:

- runtime overview
- queue health
- worker status
- dead-letter / failed jobs
- webhook delivery health
- execution anomaly tracking
- incident/event stream

### Runtime overview page

Needs:

- health cards
- running/queued/failed counts
- throughput graphs
- worker saturation
- alert summary

### Queue page

Needs:

- queue list
- lag
- retry counts
- failure reasons
- purge/replay actions where allowed

### Failures page

Needs:

- grouped incidents
- severity
- affected workflows
- first seen / last seen
- owner

---

## 9. Analytics surfaces

Borrow heavily from Make's metric framing.

Pages:

- Usage overview
- Workflow performance
- Team credits
- AI cost and token usage
- Provider usage
- SLA / latency trends

### Card system

Analytics cards should show:

- metric
- delta
- timeframe
- drill-down action

### Baseline analytics view

The first analytics overview should include:

- operations by team
- total operations used
- total errors
- error rate
- workflow/scenario executions

### Filters and controls

- timeframes: 24h, 7d, 30d
- filters: status, team, folder/tag
- customizable visible columns in list/table views
- default sort by highest usage, with quick switching to errors or executions

### Entity status indicators

- green dot = active
- red dot = invalid / broken
- hollow or gray dot = inactive

---

## 10. Audit and governance

Audit is not an appendix page. It is a first-class operator tool.

Must support:

- actor
- action
- target entity
- scope
- timestamp
- before/after context where available
- filtering by domain

Also include:

- credential access events
- publish/deploy events
- permission changes
- connection reauth events

---

## 11. Notifications center

Notifications should have both:

- a bell-driven inbox
- settings-controlled delivery channels

### Notification categories

- approvals
- failures
- credential expiry
- deployment results
- human task escalations
- plan limits
- incident alerts

### Notification center structure

- All
- Requires action
- Workflow
- Vault
- Runtime
- Admin

### Threshold notification behavior

- soft warning at the first threshold
- stronger warning at the second threshold
- hard-stop warning at the terminal threshold
- in team usage views, the status icon and progress bar should change together
- usage warnings should link directly to the team/org credit-management surface

---

## 12. Billing and plan visibility

Billing visibility should exist at org/team level and include:

- current plan
- limits
- usage
- forecast
- overage warnings

For AI and automation-heavy usage, FlowHolt should also show:

- token usage
- provider cost breakdown
- connection-driven billable operations where relevant

### Team credit management specifics

Adopt the strongest Make-derived behaviors:

- per-team credit limit setting
- team dashboard showing team usage alongside org-wide usage
- threshold notifications before the limit is reached
- automatic pause behavior when a hard team limit is exceeded
- clear reallocation/edit actions for admins

---

## 13. Help and explainability in admin surfaces

High-governance pages should include:

- policy explanations
- inheritance notes
- scope diagrams
- inline doc links

Settings should explain why a control is disabled, not merely gray it out.

---

## 14. Make and n8n takeaways

### From Make

- strong admin navigation
- credits and threshold views
- clearer org/team framing
- webhook administration visibility

### From n8n

- better technical runtime framing
- clearer workflow-execution linkage
- stronger logs and debugging affordances

### FlowHolt should improve by

- unifying settings and runtime through the same design system
- making inheritance and policy more explicit
- pairing analytics with governance instead of hiding them in isolated pages

---

## 15. Exit condition

This domain is complete only when:

- every settings scope has a page model
- runtime health and analytics are first-class
- admin pages support real operator decisions
- notifications, approvals, and audit all connect back to the same control-plane logic
