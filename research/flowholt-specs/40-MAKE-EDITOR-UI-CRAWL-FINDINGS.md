# Make.com Editor & Workspace UI Crawl Findings

This file records structured findings from a Playwright-based automated crawl of the Make.com editor and workspace UI, performed on 2026-04-14.

Grounding source: `D:\My work\flowholt3 - Copy\research\make-advanced\` — catalog.json, network-summary.json, ui-taxonomy-aggregate.json, websocket-log.json, transitions.json, EXPLORATION-REPORT.md

Crawl scope: `https://eu1.make.com/1467385/scenarios/add` (scenario editor + workspace navigation), 200 interactions, 84 baseline elements, 1302 network requests, 2 WebSocket connections.

---

## Cross-Reference Map

### Raw source data for this file
- **Crawl interaction tree**: `research/make-advanced/` — per-interaction `screenshot.png`, `state.json`, `ui-taxonomy.json`, `dom-summary.json`, `visible-text.txt`, `new-elements.json`
- **Baseline state**: `research/make-advanced/00-baseline/` — initial DOM load, 84 baseline elements
- **Root exploration**: `research/make-advanced/01-root-exploration/` — first 200 interactions, nested states
- **Aggregate files**: `research/make-advanced/catalog.json` (all discovered elements), `network-summary.json` (1302 requests), `ui-taxonomy-aggregate.json` (class/token taxonomy), `websocket-log.json`, `transitions.json`
- **Make help articles** (cross-referenced per section below):
  - `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md` — navigation revamp rationale (§2)
  - `research/make-help-center-export/pages_markdown/apps-and-modules.md` — module/app taxonomy (§6)
  - `research/make-help-center-export/pages_markdown/make-ai-agents-the-next-step-in-automation.md` — AI agent modules (§6)
  - `research/make-help-center-export/pages_markdown/introducing-mcp-toolboxes.md` — MCP toolboxes (§2a)
  - `research/make-help-center-export/pages_markdown/administration.md` — org/team settings structure (§3)
  - `research/make-help-center-export/pages_markdown/credits-per-team-management.md` — team credit limits (§3)
  - `research/make-help-center-export/pages_markdown/introducing-scenario-recovery.md` — scenario recovery API (§5, §10)
  - `research/make-help-center-export/pages_markdown/feature-controls.md` — feature flag controls (§5)
  - `research/make-help-center-export/pages_markdown/analytics-dashboard.md` — analytics surfaces (§3)
  - `research/make-help-center-export/pages_markdown/webhooks.md` — webhook system details (§5)
  - `research/make-help-center-export/pages_markdown/audit-logs.md` — audit log structure (§5)

### Peer research files (compare these findings against)
- `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` — screenshot-based visual observations; use together with this file
- `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` — n8n architecture; compare each Make pattern to n8n equivalent
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — n8n UI element catalog; compare §by§ against Make findings here

### FlowHolt planning files this feeds into
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Studio layout, canvas, toolbar (§2)
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — overlays and modals (§4, §11a–11c)
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` — studio tabs (§2b)
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team navigation (§3, §11e)
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — AI agent entity (§6)
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — settings catalog (§3, §11f)
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` — route and page inventory (§2, §3)
- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` — observability (§5 consumption endpoints)
- `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` — webhook system (§5 webhook endpoints)
- `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` — feature flags (§5 `/api/server/features`)

---


## 1. Make tech stack (from class tokens and network analysis)

| Layer | Technology | Evidence |
|---|---|---|
| Frontend framework | **Angular** | `ng-tns-*`, `ng-star-inserted`, `ng-trigger-*`, `ng-pristine`, `ng-untouched`, `ng-valid` |
| Component library | **Angular CDK** | `cdk-table`, `cdk-row`, `cdk-cell`, `cdk-virtual-scroll-*`, `cdk-drag`, `cdk-drop-list`, `cdk-overlay-*` |
| Design system | **Domino** (custom) | All `dmo-*` prefixed utility classes (Tailwind-like), `domino-table:*` selectors |
| Icons | **Font Awesome** (light, regular, solid) | `fa-*`, `fal`, `far`, `fas` |
| Real-time | **Socket.IO** (Engine.IO v4) | `wss://eu1.make.com/streamer/live/?EIO=4&transport=websocket` |
| Onboarding guides | **Candu** | `data-candu-*`, `api.candu.ai`, `candu-component` |
| Product tours | **Chameleon** | `data-chmln-*`, `fast.chameleon.io` |
| Monitoring | **Datadog** | `browser-intake-datadoghq.com`, `csp-report.browser-intake-datadoghq.com` |
| Cookie consent | **OneTrust** | `cdn.cookielaw.org` |

### Planning implication for FlowHolt
- FlowHolt uses React + Radix + Tailwind, which is already stronger than Angular CDK for modern UI. No reason to change.
- The "Domino" design system is a thin Tailwind wrapper — validates FlowHolt's Tailwind-based approach.
- Socket.IO (Engine.IO v4) for real-time is mature; FlowHolt should plan equivalent WebSocket streaming for execution state. → `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` §2
- Candu + Chameleon for onboarding are third-party services. FlowHolt should plan an onboarding system in Phase 2+ (not blocker).
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — n8n uses Vue 3 + Pinia + custom canvas, not Angular. Both n8n and FlowHolt are React/Vue; Make is the odd one out with Angular.

---

## 2. Editor layout regions (from DOM paths and positions)

The scenario editor has these structural regions, confirmed by DOM path analysis:

### 2a. Left navigation rail (x: 0–80, full height)

Component: `<dmo-first-level-navigation>`
Test ID: `first-level-navigation`

Navigation items (first-level-navigation-main-*):

| Item | Test ID suffix | DOM ID | Notes |
|---|---|---|---|
| Organization | `organization` | `organization` | Opens org settings page |
| Scenarios | `scenarios` | `scenarios` | Main scenario list |
| AI Agents | `agents` | `agents` | Has "Beta" pill (`first-level-navigation-agents-pill`) |
| Credentials | `credentials` | `credentials` | Connection/credential manager |
| Webhooks | `hooks` | `hooks` | Webhook manager |
| MCP Toolboxes | `vhosts` | `vhosts` | MCP toolbox manager |
| Templates | `templates` | `templates` | Template gallery |
| Data stores | `data-stores` | `data-stores` | Data store manager |
| Devices | `devices` | `devices` | Device manager |
| Data structures | `udts` | `udts` | "Universal Data Types" — schema manager |
| Custom Apps | `apps` | `apps` | SDK / custom app builder |

### 2b. Scenario header (top, x: 80+, height ~68px)

Component: `<imt-header>` with class `_scenarioHeader_14qxl_2`
Test ID: `scenario-header`

Contains:
- **Go-back button** (`_goBackButton_14qxl_82`) — navigates to scenarios list
- **Editable scenario title** (`input#editable-scenario-title`, class `_editableTitle_14qxl_89`) — inline rename
- **Header dropdown button** (`button#header-dropdown-button`) — opens scenario menu (26 new elements = rich dropdown)
- **Share section** (test ID: `header-toolbar`) — right side of header
- **Toolbar buttons** in header — share icon, etc.

### 2c. Main canvas (center, below header)

Component: `<imt-inspector-designer-blank-cmp>` → `div#diagram.i-inspector.i-designer`

The canvas is the central editing surface. In blank state, it shows the add-module prompt.

### 2d. Bottom toolbar bar (bottom, height ~64px)

Component: `<imt-toolbar>` (test ID: `inspector-toolbar`)
Container: `div.toolbar-container.dmo-z-10`

This is the primary action bar. Buttons discovered:

| Test ID | Label | Icon | Purpose |
|---|---|---|---|
| `btn-inspector-run-once` | Run once | `fa-play` | Execute scenario once |
| `btn-inspector-run-with-existing-data` | Run with existing data | custom icon | Replay with previous data |
| `btn-inspector-scheduling` | Scheduling | `fa-clock-rotate-left` | Set/view schedule |
| `btn-inspector-explain-flow` | Explain flow (AI) | `fa-sparkles` | AI-powered flow explanation |
| `btn-inspector-save` | Save | `fa-save` | Save scenario |
| `btn-inspector-autoalign` | Auto-align | custom | Auto-arrange nodes |
| `btn-inspector-history` | History | `fa-clock-rotate-left` | Version history |
| `btn-inspector-notes` | Notes | `fa-sticky-note` | Scenario notes |
| `btn-inspector-scenario-io` | Scenario I/O | `fa-split` | Input/output configuration |
| `btn-inspector-scenario-settings` | Scenario settings | `fa-cog` | Open settings modal |
| `inspector-add-favorites` | Add to favorites | `fa-star` | Favorite this scenario |

Additionally at toolbar level:
- **Scheduling switch** (`i-inspector-scheduling-switch`) — toggle scheduling on/off directly
- **Scheduling description** (`scheduling-description`) — shows "Every 15 minutes" etc.

### 2e. AI copilot button (bottom-right, floating)

Component: `<ai-copilot-button>` → `<ai-resources-button>` → `button#resources-button`
Position: (1532, 936) — bottom-right floating button, 40×40px

This is Make's AI assistant entry point in the editor. It toggles an AI resource panel.

### 2f. Right sidebar (slide-in panel)

Component: `<imt-sidebar-animate>` with classes `_parent_pfsi9_19`, `_slideIn_pfsi9_1`
Contains: `_sidebar_k5hpa_10` with header, action bar, close button, and content area.

This panel slides in from the right for module configuration, node details, etc.

---

## 3. Organization settings page structure (from navigation crawl)

When navigating to the Organization section, the page uses a **three-menu navigation** pattern:

### Navigation menu 0: Organization
Test ID: `navigation-menu-0`
Items:
- **Dashboard** (`tree-menu-item-0-0`)
- **Teams** (`tree-menu-item-0-1`)
- **Users** (`tree-menu-item-0-2`)

### Navigation menu 1: My Plan
Test ID: `navigation-menu-1`
Items:
- **Subscription** (`tree-menu-item-1-0`, has "Free" pill via `tree-menu-item-1-0-pill`)
- **Credit usage** (`tree-menu-item-1-1`)
- **Payments** (`tree-menu-item-1-2`)

### Navigation menu 2: Utilities
Test ID: `navigation-menu-2`
Items:
- **Installed apps** (`tree-menu-item-2-0`)
- **Variables** (`tree-menu-item-2-1`)
- **Scenario properties** (`tree-menu-item-2-2`)
- **Notification options** (`tree-menu-item-2-3`)

### Org-level action buttons discovered:
- `btn-change-details` — Organization settings
- `btn-organization-menu-expand` — Expand org menu
- `btn-change-payment-method` — Payment method change
- `btn-buy-credits` — Purchase credits
- `btn-buy-plan` — Upgrade plan
- `btn-redeem-coupon` — Coupon redemption
- `card-btn-upgrade` — Upgrade card CTA
- `billing-switch` — Billing toggle (monthly/annual)

### Planning implication for FlowHolt
- FlowHolt's org settings should mirror this 3-group nav: Organization, Plan, Utilities. → `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` §3
- Variables and Scenario properties are org-level settings in Make — validates FlowHolt's workspace-level approach. → `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` §variables
- The "Installed apps" page is Make's custom app/SDK management — FlowHolt should consider an equivalent for connector management. → `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md`
- Raw corpus: `research/make-help-center-export/pages_markdown/administration.md` — full org settings documentation
- Raw corpus: `research/make-help-center-export/pages_markdown/credits-per-team-management.md` — team credit limits and usage bars
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §9` — n8n uses flat Project model, not Org > Team. Make's 3-group org nav maps to FlowHolt's Org route (`/org/:orgSlug`).

---

## 4. Overlay and modal system (from taxonomy)

### CDK overlay infrastructure
Make uses Angular CDK's overlay system for all floating content:
- `cdk-overlay-container` — global overlay host
- `cdk-overlay-pane` — individual overlay instance
- `cdk-overlay-popover` — popover-style overlays
- `cdk-global-overlay-wrapper` — wrapper for positioning

### Custom overlays
- `_modal_u0q5n_137` — modal dialog
- `app-search-floating-overlay` — module search overlay
- `dmo-el-toast-message-overlay-pane` — toast notification
- `dmo-tooltip-shadow` — tooltip container
- `dmo-dropdown-menu-item` — dropdown menu items

### Toast message system
Test IDs: `toast-message-1`, `toast-message-body`, `toast-message-close-btn`, `toast-message-content`, `toast-message-icon`, `toast-message-title`

### Planning implication for FlowHolt
- FlowHolt uses Radix UI for overlays, which is more composable than CDK. No change needed.
- The toast system should match Make's pattern: icon + title + body + close button.
- The app search overlay is critical — FlowHolt should have an equivalent module/node search overlay that floats over the canvas.

---

## 5. API endpoint inventory (from network interception)

### Core entity endpoints

| Method | Endpoint | Category |
|---|---|---|
| GET | `/api/v2/scenarios` | Scenario CRUD |
| GET | `/api/v2/scenarios-folders` | Scenario folders |
| GET | `/api/v2/scenarios/consumptions` | Credit usage per scenario |
| GET | `/api/v2/scenarios/ai-agents` | AI agents linked to scenarios |
| GET/PUT/DELETE | `/api/v2/scenarios/:id/recovery` | Scenario recovery (version history) |
| GET | `/api/v2/ai-agents/v1/agents` | AI agent listing |
| GET | `/api/v2/connections` | Connections/credentials |
| GET | `/api/v2/data-structures` | Data structures (UDTs) |
| GET | `/api/v2/data-stores` | Data stores |
| GET | `/api/v2/hooks` | Webhooks |
| GET | `/api/v2/devices` | Devices |
| GET | `/api/v2/mcp/v1/vhosts` | MCP toolboxes |

### Organization endpoints

| Method | Endpoint | Category |
|---|---|---|
| GET | `/api/v2/organizations` | List orgs |
| GET | `/api/v2/organizations/:id` | Org details |
| GET | `/api/v2/organizations/:id/usage` | Org usage/consumption |
| GET | `/api/v2/organizations/:id/subscription` | Subscription details |
| GET | `/api/v2/organizations/:id/subscription/customer` | Billing customer |
| GET | `/api/v2/organizations/:id/user-organization-roles` | Org member roles |
| GET | `/api/v2/organizations/:id/variables` | Org-level variables |

### Team endpoints

| Method | Endpoint | Category |
|---|---|---|
| GET | `/api/v2/teams` | List teams |
| GET | `/api/v2/teams/:id` | Team details |
| GET | `/api/v2/teams/:id/variables` | Team-level variables |

### User endpoints

| Method | Endpoint | Category |
|---|---|---|
| GET | `/api/v2/users/me` | Current user |
| GET | `/api/v2/users/roles` | User's roles |
| GET | `/api/v2/users/:id/user-organization-roles` | User's org roles |
| GET | `/api/v2/users/:id/user-team-roles` | User's team roles |
| GET | `/api/v2/users/unread-notifications` | Unread count |
| GET | `/api/v2/notifications` | Notification list |
| GET | `/api/v2/users/user-team-notifications/:id` | Team notifications |
| GET | `/api/v2/users/redirect-action` | Redirect actions |

### Server/config endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/server/features` | **Feature flags** |
| GET | `/api/server/server-config` | Server configuration |
| GET | `/api/v2/zone-config` | Zone/region configuration |
| GET | `/api/v2/imt/active-organization-team` | Current org/team context |
| GET | `/api/v2/imt/hq/sanity-check` | Health check |
| GET | `/api/v2/imt/themes.css` | Dynamic theme stylesheet |
| GET | `/api/v2/imt/apps-meta` | App metadata |
| GET | `/api/v2/imt/apps` | App listing |
| GET | `/api/v2/imt/apps/builtin/latest` | Built-in app info |
| GET | `/api/v2/imt/apps/util/latest` | Utility app info |
| GET | `/api/v2/imt/apps/{package}/{version}` | Specific app version |

### Enum endpoints

| Endpoint | Purpose |
|---|---|
| `/api/v2/enums/countries` | Country list |
| `/api/v2/enums/locales` | Locale list |
| `/api/v2/enums/timezones` | Timezone list |
| `/api/v2/enums/imt-zones` | Make infrastructure zones |
| `/api/v2/enums/variable-types` | Variable type options |
| `/api/v2/enums/user-email-notifications` | Email notification types |

### Billing endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/cashier/products` | Available products/plans |
| GET | `/api/v2/consumptions/reports/:id` | Consumption report |

### Auth/SSO endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/sso/authorize` | SSO authorization |
| POST | `/api/v2/sso/login` | SSO login |

### SDK/Custom apps

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/sdk/apps` | List SDK apps |
| GET | `/api/v2/sdk/apps/themes` | SDK app themes |

### Observability

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v2/trace` | Frontend trace/span reporting |

### Planning implication for FlowHolt
- **Feature flags endpoint** (`/api/server/features`) — FlowHolt should implement feature flags from the start. Make fetches this on every page load (32 calls during crawl). → `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`
- **Zone config** — Make is multi-region (eu1, us1, etc.). FlowHolt should plan for region-awareness. → `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md`
- **Active org/team context** — Make maintains an "active organization + team" context on the server side. FlowHolt should consider a similar session-scoped context. → `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` §5
- **Enum endpoints** — centralizing lookup data as enum endpoints is a clean pattern FlowHolt should adopt. → `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md`
- **Recovery endpoint** — Make has scenario recovery (GET/PUT/DELETE) as a first-class API, separate from version history. Raw corpus: `research/make-help-center-export/pages_markdown/introducing-scenario-recovery.md`
- **Consumption tracking** — per-scenario credit tracking (`/scenarios/consumptions`) is a separate API, not embedded in the scenario object. → `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` §2 Surface 4
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §3` — n8n has `posthog.controller` for feature flag proxy, `frontend.service` for serving feature state. Both approaches are equivalent.

---

## 6. AI module packages (from image URL interception)

The crawl captured icon image requests that reveal Make's internal AI app package structure:

### Package: `ai-tools` (core AI text operations)
- `Ask` — general AI prompt
- `AnalyzeSentiment` — sentiment analysis
- `Categorize` — text categorization
- `CountAndChunkText` — token counting and text chunking
- `DetectLanguage` — language detection
- `Extract` — structured data extraction
- `Standardize` — text standardization
- `Summarize` — text summarization
- `Translate` — text translation

### Package: `ai-local-agent` (managed AI agent)
- `RunLocalAIAgent` — execute a managed AI agent as a scenario module

### Package: `make-ai-extractors` (vision and document AI)
- `captionAnImage` — basic image captioning
- `captionAnImageAdvanced` — advanced image captioning
- `describeAnImage` — image description
- `extractADocument` — document extraction
- `extractAnInvoice` — invoice extraction
- `extractAReceipt` — receipt extraction
- `extractTextFromAnImage` — OCR text extraction

### Package: `make-ai-web-search`
- `generateAResponse` — web-search-augmented response generation

### Package: `builtin` (flow control)
- `BasicAggregator`, `BasicFeeder`, `BasicIfElse`, `BasicRouter`

### Package: `gateway` (triggers)
- `CustomWebHook`

### Package: `util` (utilities)
- `SetVariables`, `TextAggregator`

### Planning implication for FlowHolt
- Make separates AI into 4 packages: text tools, agents, vision/document, and web search. FlowHolt should adopt a similar categorization for its AI node family. → `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md`, `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`
- The `RunLocalAIAgent` module is how agents are invoked in scenarios — confirms the "agent as node" pattern already planned in `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`.
- Vision/document AI (extractors) is a separate package — FlowHolt should plan for multimodal AI nodes beyond text. → `05-FLOWHOLT-AI-AGENTS-SKELETON.md`
- `CountAndChunkText` confirms Make has chunking as a first-class AI operation. → `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`
- Raw corpus: `research/make-help-center-export/pages_markdown/make-ai-tools-now-available-in-open-beta.md`
- Raw corpus: `research/make-help-center-export/pages_markdown/make-ai-agents-the-next-step-in-automation.md`
- Raw corpus: `research/make-help-center-export/pages_markdown/make-ai-web-search-mcp-client-and-mcp-server-improvements.md`
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §6` — n8n has 8 AI packages including `@n8n/agents` (Mastra-based), `@n8n/nodes-langchain` (LangChain), `@n8n/computer-use` (browser automation). n8n's AI system is more comprehensive than Make's.

---

## 7. WebSocket / real-time system

### Connection details
- URL: `wss://eu1.make.com/streamer/live/`
- Protocol: **Socket.IO** with **Engine.IO v4** (WebSocket transport only, no polling fallback)
- Ping interval: **25,000ms**
- Ping timeout: **20,000ms**
- Max payload: **2,149,580 bytes** (~2.05 MB)

### Observed behavior
- Connection opens on page load, receives SID
- Heartbeat (ping/pong) every 25s
- No application-level messages observed during editing (likely used for execution status, collaboration, notifications)
- Connection closes and reopens on page navigation

### Planning implication for FlowHolt
- FlowHolt should use WebSocket for: execution status streaming, collaboration presence, notification delivery. → `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md`, `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`
- Max payload ~2MB is reasonable for execution output snippets.
- Socket.IO is proven at Make's scale. FlowHolt can use native WebSocket or a lighter library.
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §5` — n8n uses **SSE** as default push backend with WebSocket as an option. FlowHolt should similarly support both (SSE for simple cases, WebSocket for collaboration).

---

## 8. Design system tokens (from class taxonomy)

### Color tokens (semantic, from "dmo-" classes)
- **Background**: `bastde-primary/secondary/tertiary` (static default), `bastbr-secondary/tertiary` (static brand), `bastdere-secondary` (static default reverse)
- **Surface interactive**: `suinbr-default/active/disabled` (brand), `suinpr-default/active` (primary), `suinte-disabled` (tertiary)
- **Text**: `testde-primary/secondary/tertiary` (static default), `teinbr-default` (interactive brand), `teinpr-default` (interactive primary), `teinse-default` (interactive secondary), `testbr-primary` (static brand)
- **Icon**: `icin-default` (interactive), `icinbr-default` (interactive brand), `icinpr-default` (interactive primary), `icinte-default` (interactive tertiary), `icpr-disabled`, `icse-default`, `icstde-primary/secondary` (static default)
- **Border**: `boinbr-default/active` (interactive brand), `bointe-default` (interactive tertiary), `bostde-secondary/tertiary` (static default)
- **Overlay**: `ovblbl-12/16/24` (black blur), `ovslsl-8/16` (slate)

### Typography tokens
- `paragraph-lg/md/sm/xs` (with `-semibold`, `-medium` variants)
- `title-md/sm/xs` (with `-semibold` variants)

### Spacing scale
2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 34, 36, 44, 48, 64

### Animation tokens
- `_fadeIn_u0q5n_125` — modal fade in
- `_slideIn_pfsi9_1` — sidebar slide in
- `dmo-animate-skeleton` — skeleton loading
- Transitions: `dmo-duration-150/300/500`, `dmo-ease-out`

---

## 9. Key data attributes discovered

| Attribute | Purpose |
|---|---|
| `data-testid` | Primary test selector system (extensive, 80+ unique IDs) |
| `data-testelement` | Secondary test selector |
| `data-is-active` | Active state flag |
| `data-overlay-group` | Overlay grouping for stacking |
| `data-theme` / `data-theme-var` | Theming |
| `data-type` | Element type classifier |
| `data-max-icons` | Icon display limit |
| `data-public-path` | Asset public path |
| `data-version` | Component/app version |

### Planning implication for FlowHolt
- Make has 80+ `data-testid` attributes — FlowHolt should adopt a comprehensive `data-testid` strategy from the start for E2E testing.
- `data-overlay-group` for overlay stacking is smart — FlowHolt should implement similar overlay group management.

---

## 10. Hidden features confirmed by crawl

1. **AI Copilot Button** — floating AI assistant in the editor, separate from the AI toolbar button. This is a persistent AI entry point, not just a node type.
2. **Explain Flow (AI)** — `btn-inspector-explain-flow` with `fa-sparkles` icon. AI-powered scenario explanation as a first-class toolbar action.
3. **Scenario Recovery** — separate from history, with its own GET/PUT/DELETE API. Allows restoring unsaved changes after crashes.
4. **Feature Flags** — `/api/server/features` called on every page load. Make uses server-side feature flags extensively.
5. **Active Org/Team Context** — `/api/v2/imt/active-organization-team` maintains server-side session context for which org and team the user is operating in.
6. **Dynamic Themes** — `/api/v2/imt/themes.css` serves a CSS file that changes per team/org, allowing custom branding.
7. **MCP Toolboxes** as a first-level nav item — elevated to same level as Scenarios and AI Agents, not buried in settings.
8. **Data Structures ("UDTs")** — Universal Data Types are a standalone first-level entity, not just a sub-feature of data stores.
9. **Scenario Folders** — separate API endpoint, scenarios can be organized into folders.
10. **SDK/Custom Apps** — first-level nav with dedicated theme and version management APIs.

---

## 11. Comprehensive audit — every UI element vs. plan coverage

Audit date: 2026-04-14. This section cross-references every unique element discovered in the crawl against what has been integrated into plan files.

### 11a. Test IDs — full audit (107 unique)

#### ✅ Fully covered in plan files

| Test ID | Plan file(s) |
|---|---|
| `btn-inspector-run-once` | 11, 14, 15, 40 |
| `btn-inspector-run-with-existing-data` | 11, 14, 15, 40 |
| `btn-inspector-scheduling` | 11, 14, 15, 40 |
| `btn-inspector-explain-flow` | 10, 11, 14, 15, 33, 37, 40 |
| `btn-inspector-save` | 11, 14, 15, 40 |
| `btn-inspector-autoalign` | 10, 11, 14, 15, 40 |
| `btn-inspector-history` | 11, 14, 15, 40 |
| `btn-inspector-notes` | 10, 11, 14, 15, 40 |
| `btn-inspector-scenario-io` | 10, 11, 14, 15, 40 |
| `btn-inspector-scenario-settings` | 11, 14, 15, 40 |
| `inspector-add-favorites` | 10, 11, 14, 15, 40 |
| `inspector-toolbar` | 14, 15, 40 |
| `scenario-header` | 14, 40 |
| `header-toolbar` | 40 |
| `first-level-navigation` | 40 |
| `first-level-navigation-desktop` | 40 |
| `first-level-navigation-main-scenarios` | 10, 40 |
| `first-level-navigation-main-agents` | 10, 37, 40 |
| `first-level-navigation-agents-pill` | 10, 37, 40 |
| `first-level-navigation-main-credentials` | 40 |
| `first-level-navigation-main-hooks` | 40 |
| `first-level-navigation-main-vhosts` | 40 |
| `first-level-navigation-main-templates` | 40 |
| `first-level-navigation-main-data-stores` | 40 |
| `first-level-navigation-main-devices` | 40 |
| `first-level-navigation-main-udts` | 40 |
| `first-level-navigation-main-apps` | 40 |
| `first-level-navigation-main-organization` | 40 |
| `navigation-menu-0` | 36, 38, 40 |
| `navigation-menu-0-header` | 36, 40 |
| `navigation-menu-1` | 36, 38, 40 |
| `navigation-menu-1-header` | 36, 40 |
| `navigation-menu-1-group-action` | 36 |
| `navigation-menu-2` | 36, 38, 40 |
| `navigation-menu-2-header` | 36, 40 |
| `tree-menu-0` through `tree-menu-2` | 36, 40 |
| `tree-menu-item-0-0` through `tree-menu-item-2-3` | 36, 40 |
| `tree-menu-item-1-0-pill` | 36, 40 |
| `billing-switch` | 36 |
| `btn-buy-credits` | 36 |
| `btn-buy-plan` | 36 |
| `btn-change-details` | 36 |
| `btn-change-payment-method` | 36 |
| `btn-create-scenario` | 36 |
| `btn-redeem-coupon` | 36 |
| `btn-organization-menu-expand` | 36 |
| `card-btn-upgrade` | 36 |
| `toast-message-1` | 15, 40 |
| `toast-message-body` | 15, 40 |
| `toast-message-close-btn` | 15, 40 |
| `toast-message-content` | 15, 40 |
| `toast-message-icon` | 15, 40 |
| `toast-message-title` | 15, 40 |
| `toolbar-ai-button` | 37 (as AI copilot) |

#### ❌ Not yet integrated into plan files

| Test ID | What it is | Significance | Recommended plan file |
|---|---|---|---|
| `help-dropdown-button` | Help dropdown trigger in top-right header | Opens help overlay with 29 new elements (docs, academy, community, changelog) | 11 (header controls), 15 (overlay #12) |
| `profile-dropdown-button` | User profile/avatar dropdown trigger | Opens profile menu with 11 items + 4 overlays (settings, logout, theme, etc.) | 11 (header controls), 15 (overlay #13) |
| `notifications-link` | Notifications bell icon in top-right | Opens notification overlay with 33 new elements, 3 overlays | 11 (header controls), 15 (overlay #14) |
| `navigation-picker-trigger` | Org/team context switcher | Switches active org and team — critical for multi-org | 36 (active context UI) |
| `navigation-picker-trigger-group-name` | Group label in org/team picker | Shows "Organization" or "Team" group in picker | 36 |
| `navigation-picker-trigger-item-name` | Selected org/team name in picker | Displays current org/team name | 36 |
| `product-Free` / `product-Core` / `product-Pro` / `product-Teams` / `product-Enterprise` | Plan comparison cards on subscription page | 5 plan tiers with comparison table | 38 (plan settings), 36 (billing) |
| `current-plan-name-pill` | Current plan badge (e.g., "Free") | Shows active plan in subscription area | 38 |
| `current-plan-name-text` | Current plan name text | Plan name display | 38 |
| `btn-expand-operations-count` | Operations count expansion button | Expands detailed operations breakdown | 38 (usage tracking) |
| `btn-filter-by` | Filter button on list pages | Filter control for scenario/asset lists | 10 (navigation maturity) |
| `btn-sort` | Sort button on list pages | Sort control for lists | 10 (navigation maturity) |
| `apps-modules-count` | Module count badge on custom apps | Shows how many modules a custom app has | 40 (SDK/apps) |
| `inspector-controls` | Inspector controls container | Wrapper for inspector action buttons | 15 |
| `inspector-tools` | Inspector tools area | Tools area within inspector panel | 15 |
| `text-input` / `text-input-input-elm` | Standard text input component | Domino design system input element | 40 (design system) |
| `icon-group` | Icon grouping container | Groups related icons | 40 (design system) |
| `embed-content-text` | Embedded content text (Candu) | In-app guide content from Candu | N/A (third-party) |
| `no-data-text` | Empty state text | Generic "no data" empty state message | 15 (empty states) |
| `page-title-h1` | Page title H1 element | Primary heading on each page | 11 (layout) |
| `table-wrapper` | Table wrapper container | CDK table wrapper for list views | 10 (list pages) |
| `table-column-createdAt` / `table-column-credits` / `table-column-name` / `table-column-transfer` / `table-column-type` | Table column headers | Scenario list table columns | 10 (navigation) |
| `tooltip` / `tooltip-arrow-top` | Tooltip component | Domino tooltip with arrow | 40 (design system) |
| `toggle-` | Toggle switch component | Generic toggle control | 40 (design system) |
| `dmo-dropdown-content` | Dropdown content container | Dropdown menu body | 40 (overlay system) |
| `cdk-overlay-host-via-dmo-dropdown` | CDK overlay for dropdowns | Bridge between CDK overlay and Domino dropdown | 40 (overlay system) |
| `ui-header` / `ui-header-tabs` | Reusable page header with tabs | Header + tab navigation on list pages | 11 (layout), 10 (navigation) |
| `ui-list` / `ui-list-empty-content` / `ui-list-item` | Reusable list component | Generic list for assets/entities | 10 (navigation) |

### 11b. Overlay interactions — full audit

| Trigger | Overlay count | New elements | Covered? |
|---|---|---|---|
| Scheduling ("Every 15 minutes") | 3 overlays | 52 new elements | ✅ Yes (files 11, 15, 40) |
| Nav sidebar expansion | 1 overlay | 1 element | ✅ Yes (file 40) |
| **Notifications bell** | **3 overlays** | **33 new elements** | ❌ No |
| **Help dropdown** | **4 overlays** | **29 new elements** | ❌ No |
| **Profile dropdown (TJ)** | **4 overlays, 3 tooltips** | **11 new elements** | ❌ No |
| Scenario header dropdown | (76 new elements from "button" interaction) | ✅ Partially (file 14 mentions 26 items) |

### 11c. Header-bar elements — gap

The top-right header bar has 3 elements not yet planned:

1. **Notifications bell** (`notifications-link`) — Opens dropdown overlay with notification list, 33 new elements, 3 nested overlays. Shows unread count badge.
2. **Help dropdown** (`help-dropdown-button`) — Opens overlay with 29 elements: documentation links, academy, community, changelog, keyboard shortcuts, Chameleon helpbar trigger.
3. **Profile dropdown** (`profile-dropdown-button`, shows user initials "TJ") — Opens overlay with 11 elements: user info, theme toggle, language, notification settings, billing link, logout.

### 11d. List page patterns — gap

Scenario and asset list pages use shared patterns not yet planned:

- **Filter control** (`btn-filter-by`, class `scenario-filtering`, `_filter-panel_laeu6_2`, `_filter-list_laeu6_12`, `_filter-item_laeu6_17`)
- **Sort control** (`btn-sort`, `fa-arrow-down-arrow-up`)
- **Table component** (`table-wrapper`, CDK table with `cdk-table`, `cdk-row`, `cdk-cell`, `cdk-header-row`, `cdk-header-cell`)
- **Table columns**: `createdAt`, `credits`, `name`, `transfer`, `type`
- **Empty state** (`ui-list-empty-content`, `no-data-text`)
- **Virtual scroll** (`cdk-virtual-scroll-viewport`, `cdk-virtual-scroll-content-wrapper`) for large lists
- **Drag-and-drop** (`cdk-drag`, `cdk-drop-list`) for tree navigation and possibly scenario ordering

### 11e. Workspace switcher — gap

The org/team context switcher (`navigation-picker-trigger`) is a critical missing piece:
- Test IDs: `navigation-picker-trigger`, `navigation-picker-trigger-group-name`, `navigation-picker-trigger-item-name`
- This is how users switch between organizations and teams
- Maps to FlowHolt's workspace switcher (file 36 mentions `active_workspace_id` but no UI specification)

### 11f. Plan comparison page — gap

The subscription page has 5 product cards:
- `product-Free`, `product-Core`, `product-Pro`, `product-Teams`, `product-Enterprise`
- Comparison table with classes: `comparison`, `comparisons`, `comparison-table-cell`, `comparison-table-cell-title`, `comparison-table-header-cell`
- Plan pricing display: `price`, `price-container`, `price-num`, `price-period`
- Subscription interaction: `subscription-comparison`, `billing-switch` (monthly/annual), `product-btn`, `product-salesforce`

### 11g. Class tokens — significant patterns not yet covered

| Token | Purpose | Gap? |
|---|---|---|
| `quick-access-panel` | Quick access/favorites panel | ❌ Not planned |
| `scenario-filtering` | Scenario list filter UI | ❌ Not planned |
| `toolbar-collapsible` | Collapsible toolbar sections | ❌ Not planned |
| `toolbar-logs` | Logs section in toolbar | ❌ Not planned |
| `toolbar-separator` | Visual separator between toolbar groups | ✅ Implied |
| `tab-content-inspector` / `tab-pane-inspector` | Inspector tab system | ✅ Covered by file 30, 33 |
| `inspector-edit` | Inspector edit mode | ✅ Implied by file 33 |
| `i-inspector-scheduling-switch` | Scheduling toggle switch | ✅ Covered in file 15 |
| `content-agents` / `content-connections` / `content-dashboard` / `content-data-stores` / `content-devices` / `content-hooks` / `content-notifications` / `content-scenarios` / `content-udts` / `content-vhosts` | Content area per nav section | ❌ Section-specific content areas not planned |
| `enhanced-scenario` | Enhanced scenario styling | ❌ Not documented |
| `animated-background` / `smooth-bg-transition` | Transition effects | ✅ Design system tokens covered |
| `loader-*` (`loader-animated-text`, `loader-category-label`, `loader-circle`, `loader-label`, `loader-row`) | Loading/skeleton states | ❌ Loading patterns not planned |
| `_aiButton_1uh3w_2` / `ai-button-container` | AI button styling | ✅ Covered as AI copilot button |
| `run-once-button-container` / `run-once-split-button-container` / `run-with-existing-data-button-container` | Run button container structure | ✅ Covered by toolbar spec |

### 11h. Network endpoints — gap check

| Endpoint | Covered? | Notes |
|---|---|---|
| `/api/v2/imt/apps/regexp/:id` | ❌ | Make has a **regexp** app — a regex utility built-in |
| `/api/v2/imt/apps/ai-local-agent/:id` | ✅ | Covered in AI packages |
| `https://www.make.com/api/affiliate/visit` | ❌ | Affiliate tracking — not relevant for FlowHolt |
| `https://www.make.com/api/login` | ✅ | Auth covered |
| All other Make API endpoints | ✅ | Fully covered in section 5 |
| Candu endpoints | ✅ | Documented as third-party onboarding |
| Chameleon endpoints | ✅ | Documented as third-party tours |
| Datadog endpoints | ✅ | Documented as monitoring |

### 11i. Font Awesome icons — complete inventory

All icons discovered, mapped to their UI location:

| Icon | Location | Covered? |
|---|---|---|
| `fa-play` | Run once button | ✅ |
| `fa-sparkles` | Explain flow (AI) | ✅ |
| `fa-save` | Save button | ✅ |
| `fa-clock-rotate-left` | History, scheduling | ✅ |
| `fa-sticky-note` | Notes button | ✅ |
| `fa-split` | Scenario I/O | ✅ |
| `fa-cog` / `fa-gear` | Settings | ✅ |
| `fa-star` | Favorites | ✅ |
| `fa-bell` | Notifications | ❌ (gap) |
| `fa-magnifying-glass` / `fa-search` | Search | ✅ Implied |
| `fa-plus` | Add/create actions | ✅ Implied |
| `fa-chevron-down` / `fa-chevron-left` | Dropdowns, go-back | ✅ |
| `fa-circle-arrow-left` | Go-back button | ✅ |
| `fa-share-alt` / `fa-share-nodes` | Share button | ✅ |
| `fa-ellipsis` / `fa-ellipsis-vertical` | More actions menu | ❌ (not explicitly planned) |
| `fa-bars-filter` / `fa-filters` | Filter controls | ❌ (gap) |
| `fa-arrow-down-arrow-up` | Sort control | ❌ (gap) |
| `fa-folder` | Scenario folders | ✅ |
| `fa-database` | Data stores | ✅ |
| `fa-cube` | Data structures | ✅ |
| `fa-globe` | MCP toolboxes / public | ✅ |
| `fa-mobile` | Devices | ✅ |
| `fa-puzzle-piece` | Custom apps | ✅ |
| `fa-users` | Users/teams | ✅ |
| `fa-credit-card` | Billing/payments | ✅ |
| `fa-chart-line-up` | Usage analytics | ✅ Implied |
| `fa-book-open` | Help/docs | ❌ (help dropdown gap) |
| `fa-lightbulb` | Tips/suggestions | ❌ (not planned) |
| `fa-gift` | Coupon/promotion | ✅ (`btn-redeem-coupon`) |
| `fa-shield-check` | Security/verification | ✅ Implied |
| `fa-wand-magic-sparkles` | AI magic | ✅ (AI copilot) |
| `fa-calendar` | Scheduling | ✅ |
| `fa-code-commit` | Version/commit | ✅ Implied |
| `fa-diagram-next` | Scenarios | ✅ |
| `fa-message-smile` | Feedback | ❌ (not planned) |
| `fa-plane` | Deployment | ❌ (not planned) |
| `fa-sliders` / `fa-sliders-simple` | Settings/configuration | ✅ |
| `fa-tags` | Tags/labels | ❌ (not planned) |
| `fa-edit` | Edit action | ✅ Implied |
| `fa-times` / `fa-close` | Close/dismiss | ✅ Implied |
| `fa-check` | Confirmation/checkmark | ✅ Implied |
| `fa-circle-notch` / `fa-spin` | Loading spinner | ❌ (loading gap) |
| `fa-circle-question` / `fa-question-circle` | Help tooltip | ❌ (help gap) |
| `fa-arrow-up-right-from-square` | External link | ✅ Implied |
| `fa-home` | Home/dashboard | ✅ |
| `fa-grid-2` | Grid view | ❌ (not planned) |
| `fa-caret-down` | Dropdown indicator | ✅ Implied |

---

## 12. Audit summary — gaps to close

### Priority 1: Header bar overlays (3 missing)

These are visible on every page and not yet planned:

1. **Help dropdown overlay** — docs, academy, community, changelog, keyboard shortcuts (29 elements)
2. **Notifications overlay** — notification list, unread badge, team notifications (33 elements)
3. **Profile dropdown overlay** — user settings, theme, language, logout (11 elements)

**Action**: Add overlays #12, #13, #14 to `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — **DONE** (overlays 12–14 added)

### Priority 2: Workspace/org/team context switcher

The `navigation-picker-trigger` is how users switch between orgs and teams. No UI spec exists for this yet.

**Action**: Add workspace switcher spec to `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — **DONE** (section "Org/team context switcher" added)

### Priority 3: List page patterns

Filter, sort, table, virtual scroll, empty state, and drag-drop patterns are used across all list pages (scenarios, agents, credentials, etc.) but not yet specified.

**Action**: Consider a new file or add to `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — a "List page contract" section — **DONE** ("List page contract" section added)

### Priority 4: Plan comparison / billing UI

5 product cards, comparison table, pricing display, billing toggle — visible on subscription page.

**Action**: Add billing UI spec to `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md`

### Priority 5: Loading/skeleton patterns

`dmo-animate-skeleton`, `loader-*` classes, `fa-circle-notch` / `fa-spin` — loading states not planned.

**Action**: Add loading state patterns to design system section or `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`

### Priority 6: Minor UI elements

- `quick-access-panel` — quick access/favorites panel
- `enhanced-scenario` — enhanced scenario styling variant
- `content-*` area variants per nav section
- `toolbar-collapsible` / `toolbar-logs` — toolbar sub-layout
- `fa-tags` — tagging system (not planned)
- `fa-grid-2` — grid view option (not planned)
- `fa-message-smile` — feedback widget
- `regexp` app — Make has a built-in regex utility app
