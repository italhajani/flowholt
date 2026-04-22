# Spec 98 — FlowHolt MCP Toolboxes & Custom Functions
**Sources:** Make `mcp-toolboxes.md`, `make-mcp-server.md`, `custom-functions.md`, `incremental-variables.md`, n8n JSON workflows
**Status:** Research Complete — Ready for Planning
**Priority:** ⭐⭐⭐ Medium (MCP = modern AI integration; Custom Functions = Enterprise power users)

---

## 1. MCP Toolboxes

### 1.1 What MCP Is
**Model Context Protocol (MCP)** is an open standard (Anthropic) that allows AI clients (Claude, ChatGPT, Cursor) to call external tools. FlowHolt workflows can become MCP tools — callable by any MCP-compatible AI.

**Two patterns (following Make):**

| Pattern | Description | Use Case |
|---------|-------------|---------|
| **MCP Toolbox** | Curated set of workflows exposed as MCP tools | Controlled AI integrations for teams |
| **MCP Server** | All on-demand workflows exposed automatically | Rapid AI enablement for power users |

### 1.2 MCP Toolbox — Key Concepts

**What is a Toolbox?**
- A named collection of FlowHolt workflows exposed as MCP tools
- Has a unique URL + one or more auth keys
- Only active workflows with "on-demand" trigger appear as available tools

**What is an MCP Tool?**
- A workflow with an on-demand trigger
- Has a name, description (shown to AI client), and behavior annotation
- AI client calls the tool → FlowHolt executes the workflow → returns result

### 1.3 MCP Toolbox UI — Left Sidebar Navigation
```
[🧰] MCP Toolboxes
  ├── [Toolbox: Customer Support Tools]
  │     ├── Tools: 3 selected
  │     └── Keys: 2 active
  ├── [Toolbox: Sales Automation]
  │     ├── Tools: 7 selected
  │     └── Keys: 1 active
  └── [+ Create toolbox]
```

### 1.4 Toolbox Detail Page
```
MCP Toolbox: Customer Support Tools           [Delete] [Share]
──────────────────────────────────────────────────────────────

MCP Server URL:
  https://mcp.flowholt.com/toolbox/abc123def456
  [Copy URL] [Connect with... ▾ (Claude / ChatGPT / Cursor)]

Tools                                         [+ Add]
──────────────────────────────────────────────────────────────
  ⚙ Create Support Ticket    Read & write    [Settings] [Remove]
  🔍 Lookup Customer Info    Read only       [Settings] [Remove]
  📧 Send Email Reminder     Read & write    [Settings] [Remove]

Keys                                          [+ Add key]
──────────────────────────────────────────────────────────────
  Claude Desktop Key    Created Jan 12       [×]
  Team Integration Key  Created Feb 3        [×]
```

### 1.5 Tool Configuration
Each tool in a toolbox can be configured:
```
Tool Settings: Create Support Ticket
──────────────────────────────────────
Custom name:        [Create a support ticket for a customer]
                    (leave blank = use workflow name)

Custom description: [Creates a new ticket in the support queue. 
                     Use when user reports a problem or complaint.]
                    (leave blank = use workflow description)

Behavior:          [Read & write ▾]
                   Read only   — reads data only; AI can run freely
                   Read & write — modifies data; AI may ask permission first
```

### 1.6 Key Management
- Each toolbox can have **multiple keys** (one per MCP client or team member)
- Keys are shown **only once** at creation — must copy immediately
- Key format: `fht_mcp_{random_base64_32chars}`
- Revoke key: Click X → key immediately invalid → existing clients lose access

### 1.7 URL Patterns
```
# With authorization header (preferred):
URL: https://mcp.flowholt.com/toolbox/{toolbox-id}
Header: Authorization: Bearer {key}

# Without authorization header (for clients that don't support headers):
URL: https://mcp.flowholt.com/toolbox/{toolbox-id}/t/{key}/{transport}
  Transport options:
    /stateless    — Stateless Streamable HTTP (recommended, most reliable)
    /sse          — Server-Sent Events (legacy)
```

### 1.8 Toolbox Timeout
- Workflows called as MCP tools must complete within **40 seconds**
- If timeout exceeded → connection closes → AI client receives error
- Canvas shows this limit when workflow is used as MCP tool

### 1.9 Database Schema
```sql
CREATE TABLE mcp_toolboxes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID REFERENCES teams(id),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mcp_toolbox_tools (
  toolbox_id       UUID REFERENCES mcp_toolboxes(id) ON DELETE CASCADE,
  workflow_id      UUID REFERENCES workflows(id),
  custom_name      TEXT,        -- overrides workflow name for MCP clients
  custom_desc      TEXT,        -- overrides workflow description for MCP clients
  behavior         TEXT DEFAULT 'read_write' CHECK (behavior IN ('read_only', 'read_write')),
  PRIMARY KEY (toolbox_id, workflow_id)
);

CREATE TABLE mcp_toolbox_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toolbox_id  UUID REFERENCES mcp_toolboxes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  key_hash    TEXT UNIQUE NOT NULL,  -- bcrypt hash of the key
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_used   TIMESTAMPTZ
);
```

### 1.10 Connecting to MCP Clients
**Claude Desktop:** Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "flowholt": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.flowholt.com/toolbox/abc123/stateless"],
      "env": { "AUTH_TOKEN": "fht_mcp_..." }
    }
  }
}
```

**Cursor:** Settings → AI → MCP Servers → Add URL + header

### 1.11 MCP Plan Availability
| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| MCP Toolboxes | ✗ | 1 toolbox | 5 toolboxes | Unlimited |
| Tools per toolbox | — | 5 | 20 | Unlimited |
| Keys per toolbox | — | 2 | 10 | Unlimited |
| MCP Server (all workflows) | ✗ | ✓ | ✓ | ✓ |

---

## 2. Custom Functions — Enterprise Feature

### 2.1 What They Are
Custom JavaScript functions that extend the expression engine. Available alongside built-in functions in any expression field.

**Example:** Writing `myCustomFunc(value)` in expression editor → calls user-defined JS function.

### 2.2 Capabilities
- Write JavaScript ES6 (no third-party libraries)
- Synchronous only (no async/await)
- Can call Make/FlowHolt built-in functions via `iml.functionName(args)`
- Can access standard JS globals: `Math`, `Date`, `JSON`, `Array`, `String`, etc.
- Run server-side (not in browser)
- Version history with restore

### 2.3 Limitations
| Constraint | Value |
|------------|-------|
| Max execution time | 300ms |
| Max code length | 5,000 characters |
| HTTP requests | Not allowed |
| Async code | Not allowed |
| Recursion | Not allowed |
| Calling other custom functions | Not allowed |

### 2.4 Custom Functions UI — Left Sidebar Section
```
[ƒ] Functions
  ├── calculateWorkingDays   (v3)    [Edit] [···]
  ├── formatCurrency         (v1)    [Edit] [···]
  └── [+ Add a function]
```

**Function editor:**
```
Function: calculateWorkingDays
──────────────────────────────────────────────────────
Name:        [calculateWorkingDays]
Description: [Returns working days in a month]

Code:
  function calculateWorkingDays(month, year) {
    let counter = 0;
    let date = new Date(year, month - 1, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (date.getTime() < endDate.getTime()) {
      const weekDay = date.getDay();
      if (weekDay !== 0 && weekDay !== 6) counter += 1;
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    return counter;
  }

Debug console:
  Input:  calculateWorkingDays(3, 2025)
  Output: 21

[Save]  [History tab]  [Scenarios tab (used in 3)]
```

### 2.5 In Expression Editor
- Custom functions appear in the function picker (separate section "Custom")
- Marked with a custom icon (🔧 or team icon) to distinguish from built-ins
- Name, description, and parameter hints shown in tooltip

### 2.6 Version History
- Each save creates a version record
- History tab shows: version number, saved at, author, diff vs previous
- "Restore this version" → creates new version with old content
- Only compare two consecutive versions

### 2.7 Function Deletion Warning
- Before deleting, show: "Used in N workflows" (with clickable list)
- If deleted and used in workflow → workflow execution fails with:
  `Error: Function 'calculateWorkingDays' not found`
- Soft-delete warning period (7 days marked as deprecated before removal)

### 2.8 Database Schema
```sql
CREATE TABLE custom_functions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES teams(id),
  name        TEXT NOT NULL,             -- function name (must be valid JS identifier)
  description TEXT,
  code        TEXT NOT NULL,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, name)                 -- unique name per team
);

CREATE TABLE custom_function_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES custom_functions(id) ON DELETE CASCADE,
  version_num INTEGER NOT NULL,
  code        TEXT NOT NULL,
  saved_by    UUID REFERENCES users(id),
  saved_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.9 Plan Availability
- Enterprise only (match Make)
- All Team Members can view/use; Team Admins can create/edit

---

## 3. Incremental Variables (Increment Function Module)

### 3.1 What They Are
A built-in **Tools** node type that increments a counter and returns the current value. Persists across workflow executions.

### 3.2 Module Config
```
Increment Function node
├── Variable name: [counter_name]
└── Reset: 
    ○ Never (count indefinitely across all runs)
    ○ After one cycle (reset after each bundle batch completes)
    ○ After one scenario run (reset after each execution)
```

### 3.3 Use Cases
1. **Round-robin task assignment**: `counter mod 2 == 0` → Route A, `== 1` → Route B
2. **Execution counter**: How many times workflow has run
3. **Batch offset**: `counter * batchSize` for paginated API calls
4. **Cycle limit**: Stop after N executions

### 3.4 Example — Round Robin Pattern
```
[Webhook trigger]
      ↓
[Increment Function: taskCounter, Never reset]
      ↓
[Router]
  ├── Route A: filter taskCounter mod 2 == 1 → Send to Alice
  └── Route B: filter taskCounter mod 2 == 0 → Send to Bob
```

### 3.5 Important Notes
- **Persisted at team level** — variable survives between runs
- **Cannot use inside Iterator** directly — set variable before Iterator, then map from Set Variable output
- **Storage:** One row per (workflow_id, variable_name) in `workflow_variables` table (see Spec 92)
- Built-in node — no custom code needed

---

## 4. n8n Switch: All Matching Outputs Pattern

### 4.1 New Finding from n8n Workflow JSONs
n8n's Switch node has an option `allMatchingOutputs: true` that allows it to **fire multiple branches simultaneously** when more than one condition is true.

**Without `allMatchingOutputs`** (default): Only first matching branch fires (mutually exclusive)
**With `allMatchingOutputs`**: ALL matching branches fire sequentially (first branch completely, then next)

**Real workflow JSON example (multiple-branch-execution):**
```json
{
  "type": "n8n-nodes-base.switch",
  "options": {
    "allMatchingOutputs": true   // ← this is the key setting
  }
}
```

### 4.2 FlowHolt Implementation

**Router node** (Make-style) already supports this via route filters that can match multiple routes.

**Switch node** (n8n-style) needs to add:
- Toggle in node settings: "Match multiple branches" (default: off)
- When on: Canvas shows green icon indicating "multi-fire mode"
- Sequential execution order: branch 0 completes fully → branch 1 starts

**Canvas indication:**
```
[Switch node] ← shows "⟐ Multi-match" badge when enabled
    ├──● Route: Documentary (fires if condition true)
    ├──● Route: Action (fires if condition true)  
    ├──● Route: Romance (fires if condition true)
    └──● Final page (fires if multiple branches fired → shown last)
```

**Decision:** Add `allMatchingOutputs` toggle to FlowHolt's Switch node settings (existing Spec 80 needs update — see Section 4.3 below).

### 4.3 Update to Spec 80 (Flow Logic)
In the Switch node spec, add:
```
Switch node settings:
├── Routing mode:
│   ○ Exclusive (default) — only first matching branch fires
│   ○ Multi-match — all matching branches fire sequentially
│       └── If no branches match: optional "else" output
└── Output naming:
    ○ Auto-number (Output 1, 2, 3...)
    ○ Custom labels (rename each output)
```

---

## 5. AI Agent Sub-Workflow Tools (n8n Pattern)

### 5.1 toolWorkflow Pattern
From n8n JSON analysis: AI Agents can call **sub-workflows as tools** using `toolWorkflow` node type.

```json
{
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "parameters": {
    "name": "dont_know_tool",
    "description": "Use this tool if you don't know the answer",
    "workflowId": "={{ $workflow.id }}",
    "fields": {
      "values": [
        { "name": "chatInput", "stringValue": "={{ $('Chat Trigger').item.json.chatInput }}" }
      ]
    }
  }
}
```

**How it works:**
1. AI Agent decides to call the tool
2. `toolWorkflow` node executes the referenced workflow
3. Referenced workflow starts with `executeWorkflowTrigger`
4. Referenced workflow performs actions (check email regex, call Slack, etc.)
5. Returns `{ "response": "..." }` object to AI Agent

**This is already covered in Spec 94 (AI Agents)** under "Tool Types — Sub-workflow tool." The JSON analysis confirms the exact parameter structure.

### 5.2 Auto-fixing Output Parser
n8n's `outputParserAutofixing` wraps `outputParserStructured` and:
- Takes LLM output
- If it doesn't match JSON schema → sends back to LLM with error and asks it to fix
- Retries up to N times (default 3)

**FlowHolt equivalent:** Output Parser node → "Auto-fix on error" toggle (already in Spec 94 under "Response format → Structured JSON with schema")

---

## 6. FlowHolt Decision Summary

| Feature | Decision | Plan |
|---------|----------|------|
| MCP Toolboxes | Yes, starting Pro | AI is mainstream now |
| MCP Server (all workflows) | Yes, Pro+ | Simple enablement for power users |
| Custom Functions | Enterprise only | Complex, limited use; security risk for free tiers |
| Incremental variables | All plans | Simple counter, useful for all |
| Switch allMatchingOutputs | Yes, all plans | Critical for multi-condition workflows |
| Sub-workflow as AI tool | Yes, all plans with AI | Enables "human in the loop" patterns |
| toolWorkflow output format | Must return `{ response: string }` | n8n convention, clear contract |
| Auto-fixing output parser | Yes (in AI Agent node) | Significantly improves structured output reliability |
