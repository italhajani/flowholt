# Make.com Editor UI Exploration Report

Generated: 2026-04-14T08:23:28.521Z
Root URL: https://eu1.make.com/1467385/scenarios/add
Baseline fingerprint: 9c523b9a562b7c48
Total interactions: 200
Catalog entries: 200
Transitions: 200
Visited states: 9
Replay paths: 137

## What This Run Captured

- Baseline editor snapshot with element inventory.
- Replayable paths for every visited state so you can reopen it later.
- Nested UI states such as overlays, dialogs, drawers, tabs, panels, and menus.
- Tooltips, context menus, and node double-click states.
- Passive network request and response logging plus websocket discovery.
- Aggregated UI taxonomy: roles, data attributes, test ids, and overlay-ish class tokens.

## High-Signal UI Transitions

| Label | Mode | Depth | Overlay Delta | New Elements | Capture |
|---|---|---|---|---|---|
| button | overlay | 2 | 0 | 76 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0089-button |
| Data structures | nested | 3 | 0 | 76 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0148-data-structures |
| Org | overlay | 2 | 0 | 64 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0181-org |
| AI Agents Beta | overlay | 3 | 0 | 62 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0002-button\nested-state\0031-ai-agents-beta |
| Org | overlay | 3 | 0 | 62 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0072-org |
| Org | nested | 3 | 0 | 62 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0089-button\nested-state\0126-org |
| Org | nested | 3 | 0 | 62 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0149-org |
| Org | nested | 3 | 0 | 62 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0161-org |
| Every 15 minutes | overlay | 3 | 3 | 52 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0002-button\nested-state\0027-every-15-minutes |
| Scenarios | overlay | 3 | -1 | 50 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0002-button\nested-state\0030-scenarios |
| Scenarios | overlay | 3 | 0 | 47 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0061-scenarios |
| Scenarios | overlay | 3 | 0 | 47 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0073-scenarios |
| Scenarios | nested | 3 | 0 | 47 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0150-scenarios |
| Scenarios | nested | 3 | 0 | 47 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0162-scenarios |
| notifications-link | nested | 3 | 3 | 33 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0089-button\nested-state\0099-notifications-link |
| notifications-link | nested | 3 | 3 | 33 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0135-notifications-link |
| notifications-link | nested | 3 | 3 | 33 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0181-org\nested-state\0191-notifications-link |
| notifications-link | overlay | 3 | 0 | 30 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0047-notifications-link |
| Help | nested | 3 | 4 | 29 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0089-button\nested-state\0101-help |
| Help | nested | 3 | 4 | 29 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0131-data-structures\nested-state\0137-help |
| Help | nested | 3 | 4 | 29 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0181-org\nested-state\0193-help |
| Help | overlay | 3 | 3 | 29 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0049-help |
| Org Scenarios AI Agents Beta Credentials Webhooks MCP Toolbo | overlay | 2 | 0 | 29 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s |
| Run once | overlay | 3 | 0 | 28 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0002-button\nested-state\0040-run-once |
| Custom Apps | overlay | 3 | 0 | 28 | 01-root-exploration\0000-button\nested-state\0001-button\nested-state\0041-org-scenarios-ai-agents-beta-credentials-webhooks-mcp-toolboxes-templates-data-s\nested-state\0070-custom-apps |

## Taxonomy Signals

- Roles: columnheader, list, listitem, navigation, row, rowgroup, switch, table
- Data attrs: data-candu-content-id, data-candu-placement-id, data-candu-selector, data-candu-selector-location, data-candu-slug, data-chmln-helpbar-trigger-attached, data-chmln-step-id, data-is-active, data-max-icons, data-overlay-group, data-powered-by, data-public-path, data-testelement, data-testid, data-theme, data-theme-var, data-type, data-version, data-zr-dom-id
- Test ids: apps-modules-count, billing-switch, btn-buy-credits, btn-buy-plan, btn-change-details, btn-change-payment-method, btn-create-scenario, btn-expand-operations-count, btn-filter-by, btn-inspector-autoalign, btn-inspector-explain-flow, btn-inspector-history, btn-inspector-notes, btn-inspector-run-once, btn-inspector-run-with-existing-data, btn-inspector-save, btn-inspector-scenario-io, btn-inspector-scenario-settings, btn-inspector-scheduling, btn-organization-menu-expand, btn-redeem-coupon, btn-sort, card-btn-upgrade, cdk-overlay-host-via-dmo-dropdown, current-plan-name-pill, current-plan-name-text, dmo-dropdown-content, embed-content-text, first-level-navigation, first-level-navigation-agents-pill, first-level-navigation-desktop, first-level-navigation-main-agents, first-level-navigation-main-apps, first-level-navigation-main-credentials, first-level-navigation-main-data-stores, first-level-navigation-main-devices, first-level-navigation-main-hooks, first-level-navigation-main-organization, first-level-navigation-main-scenarios, first-level-navigation-main-templates
- Overlay tokens: _modal_u0q5n_137, app-search-floating-overlay, cdk-global-overlay-wrapper, cdk-overlay-connected-position-bounding-box, cdk-overlay-container, cdk-overlay-pane, cdk-overlay-popover, dmo-dropdown-menu-item, dmo-el-toast-message-overlay-pane, dmo-tooltip-shadow, no-overlay, overlay-arrow, tooltip-arrow, tooltip-arrow-top, tooltip-bottom

## Network Signals

| Method | Endpoint | Count | Statuses | Types |
|---|---|---|---|---|
| POST | https://api.candu.ai/api/batchEvent | 140 | 204 | fetch |
| GET | https://eu1.make.com/api/v2/users/unread-notifications | 78 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/scenarios?query | 72 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/users/roles?query | 70 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/organizations?query | 54 | 200 | xhr |
| POST | https://eu1.make.com/api/v2/trace | 48 | 200 | fetch, xhr |
| GET | https://eu1.make.com/api/v2/scenarios-folders?query | 42 | 200 | xhr |
| GET | https://eu1.make.com/api/server/features?query | 32 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/scenarios/consumptions?query | 32 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/zone-config | 32 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/teams?query | 30 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/enums/countries | 28 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/organizations/:id | 28 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/organizations/:id/usage | 28 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/organizations/:id/subscription | 24 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/organizations/:id/user-organization-roles?query | 24 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/mcp/v1/vhosts?query | 20 | 200 | xhr |
| GET | https://cdn.cookielaw.org/scripttemplates/:id.:id.:id/assets/v2/otPcCenter.json | 19 | 200 | fetch |
| POST | https://csp-report.browser-intake-datadoghq.com/api/v2/logs?query | 18 | - | other |
| GET | https://eu1.make.com/api/server/server-config | 18 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/enums/locales | 18 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/enums/timezones | 18 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/sdk/apps?query | 16 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/users/me?query | 15 | 200 | xhr |
| GET | https://api.candu.ai/api/smc/eyJjIjoiVkc4bDdvc0JxNCIsInUiOiI3NTYwNDEwIiwidCI6eyJvcmdfdHlwZV9hY3RpdmUiOiJzcyJ9fQ%3D%3D | 14 | 200 | fetch |
| GET | https://eu1.make.com/api/v2/enums/imt-zones | 14 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/imt/active-organization-team?query | 14 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/imt/hq/sanity-check | 14 | 200 | xhr |
| GET | https://eu1.make.com/api/v2/imt/themes.css?query | 14 | 200 | stylesheet |
| GET | https://eu1.make.com/api/v2/teams/:id | 14 | 200 | xhr |

## Websocket Signals

- wss://eu1.make.com/streamer/live/?EIO=4&transport=websocket (8 events)
- wss://eu1.make.com/streamer/live/?EIO=4&transport=websocket (4 events)

## Output Files

- `00-baseline/`: initial editor state
- `01-root-exploration/`: main editor exploration
- `02-context-menus/`: right-click discoveries
- `catalog.json`: interaction catalog
- `transitions.json`: state transitions
- `replay-paths.json`: saved paths you can replay later
- `network-summary.json`: grouped endpoint summary
- `network-log.json`: raw request and response log
- `websocket-log.json`: websocket events
- `ui-taxonomy-aggregate.json`: merged taxonomy
