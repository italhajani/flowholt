# 71 · FlowHolt: MCP Server Integration Spec

> **Purpose**: Complete specification for FlowHolt's bidirectional MCP (Model Context Protocol) server — allowing external AI clients (Claude, Cursor, ChatGPT, etc.) to invoke FlowHolt workflows as tools, and allowing FlowHolt workflows to call external MCP servers.
> **Audience**: Junior AI model implementing the MCP integration. All concepts explained from scratch.
> **Sources**: `research/competitor-data/make-docs/mcp-server/` (18 files), Make MCP server docs, MCP spec 1.0.

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Overview | Make MCP server main docs |
| §2 Transport options | `connect-using-mcp-token.md`, Make MCP endpoints |
| §3 Auth models | `connect-using-mcp-token.md`, `connect-using-oauth.md` |
| §4 Workflows as tools | `scenarios-as-tools-access-control.md` |
| §5 FlowHolt MCP server design | FlowHolt adaptation decisions |
| §6 MCP client node in Studio | How workflows call external MCP servers |
| §7 Backend implementation | FastAPI + SSE + streamable HTTP |
| §8 UI surfaces | Profile page, Studio node |
| §9 Security model | Scope-based access control |

---

## 1. What Is MCP?

**Model Context Protocol (MCP)** is an open standard protocol (by Anthropic) for connecting AI language models to external tools and data sources. Instead of building custom integrations for each AI system, MCP provides a single wire protocol.

**Make's MCP server**: Make hosts an MCP server at `https://<MAKE_ZONE>/mcp/`. AI clients (Claude Desktop, Cursor, ChatGPT, etc.) connect to this server and discover Make scenarios as callable tools. When the AI calls a tool, Make runs the scenario.

**FlowHolt's approach**: Build our own MCP server so external AI clients can invoke FlowHolt workflows as tools, and build an MCP client node so workflows can call external MCP servers (like Make's or any third-party server).

---

## 2. MCP Transport Options

Make supports three transport variants. FlowHolt must support all three to be compatible with all MCP clients.

### 2.1 Stateless Streamable HTTP (`/stateless`)

```
POST https://flowholt.com/mcp/u/<MCP_TOKEN>/stateless
```

- **Best for**: Most modern MCP clients (Claude.ai, Cursor, Windsurf, etc.)
- **Protocol**: Single HTTP POST per tool call. Request and response in one HTTP transaction.
- **No session state** maintained on server side.
- **Recommended** for FlowHolt's primary transport.

### 2.2 Streamable HTTP (`/stream`)

```
GET/POST https://flowholt.com/mcp/u/<MCP_TOKEN>/stream
```

- **Best for**: Clients that need streaming responses (long-running tool calls).
- **Protocol**: HTTP with streaming response body. Server can push partial results.
- Uses HTTP chunked encoding to stream workflow output progressively.

### 2.3 Server-Sent Events (`/sse`)

```
GET https://flowholt.com/mcp/u/<MCP_TOKEN>/sse
```

- **Best for**: Legacy MCP clients, Claude Desktop (older versions).
- **Protocol**: Browser-compatible SSE. One long-lived GET connection, server pushes events.
- Less efficient but maximum compatibility.

### 2.4 URL Structure

```
/mcp/u/<MCP_TOKEN>/<transport>[?scopeParam=value]
```

Scope parameters (mutually exclusive, for scenario tool filtering):
- `?workspaceId=<id>` — all workflows in workspace
- `?teamId=<id>` — all workflows in team  
- `?workflowId=<id>` — single specific workflow
- `?workflowId[]=<id1>&workflowId[]=<id2>` — multiple specific workflows

---

## 3. Authentication Models

### 3.1 MCP Token Auth (Primary)

- User creates an API token in Profile → API Access tab.
- Selects scope `mcp:use` (required for MCP access).
- Additional scopes control which management tools are available.
- Token is embedded in URL: `/mcp/u/<TOKEN>/stateless`.
- Token is a secret — treat like a password.

**FlowHolt implementation**:
```python
# Backend: validate MCP token from URL path parameter
async def get_mcp_user(mcp_token: str = Path(...)):
    token_row = await db.query(
        "SELECT user_id, scopes FROM api_tokens WHERE token_hash = hash($1) AND active = true",
        mcp_token
    )
    if not token_row or 'mcp:use' not in token_row.scopes:
        raise HTTPException(401, "Invalid or insufficient MCP token")
    return token_row.user_id
```

### 3.2 OAuth Auth (Secondary)

- For enterprise/multi-user setups.
- Client authenticates via OAuth 2.0 PKCE flow.
- FlowHolt issues OAuth access tokens with `mcp:use` scope.
- URL format: `/mcp/oauth/<transport>` (no token in URL).

---

## 4. Workflows as MCP Tools

### 4.1 Discovery (tools/list)

When an MCP client calls `tools/list`, FlowHolt returns all workflows that are:
1. Status = `active`
2. Trigger type = `on-demand` (HTTP trigger with "respond-to-webhook" node)
3. User has `mcp:use` scope and access to the workflow

Each workflow becomes one MCP tool. Tool definition:
```json
{
  "name": "workflow__<workflow_id>__<sanitized_workflow_name>",
  "description": "<workflow.description or workflow.name>",
  "inputSchema": {
    "type": "object",
    "properties": {
      "<param_name>": {
        "type": "<json_type>",
        "description": "<param description>"
      }
    },
    "required": ["<required_params>"]
  }
}
```

### 4.2 Tool Name Rules

- **Max length**: 64 characters (configurable 32–128 via settings).
- **Format**: `wf__<first8_of_id>__<snake_case_name>` (e.g., `wf__ab12cd34__send_email`)
- **Sanitization**: Replace spaces/hyphens with underscores, lowercase, strip special chars.
- Tool names must be unique within one token's scope.

### 4.3 Workflow Inputs/Outputs Definition

For a workflow to be discoverable as an MCP tool, it must have:
- `trigger.inputs` — JSON Schema defining expected input parameters
- `trigger.outputs` — JSON Schema defining output fields

This is configured in the **Workflow Settings → MCP tab** in the Studio.

**Studio UI for MCP configuration** (in Workflow Settings modal):
```
┌─ MCP Tool Settings ──────────────────────┐
│ ☑ Expose as MCP tool                    │
│ Tool name: wf__ab12cd34__send_email      │
│   [auto-generated, editable]             │
│                                          │
│ Description: [textarea]                  │
│   What this workflow does, for AI context│
│                                          │
│ Input Parameters                         │
│   + Add parameter                        │
│   [name]  [type]  [description] [req?]  │
│                                          │
│ Output Fields                            │
│   + Add output field                     │
│   [name]  [type]  [description]          │
└──────────────────────────────────────────┘
```

### 4.4 Tool Invocation (tools/call)

When client calls `tools/call`:
1. FlowHolt receives JSON input matching `inputSchema`.
2. Creates workflow execution with input as trigger payload.
3. Runs workflow synchronously (waits for completion, timeout: 30s default).
4. Returns workflow output as tool result.

**Timeout handling**:
- Default timeout: 30 seconds.
- If workflow exceeds timeout: return `executionId` as partial result.
- Client can poll `GET /mcp/execution/<executionId>` to get final output.

**Response format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "<JSON.stringify(workflow_output)>"
    }
  ]
}
```

For image outputs:
```json
{
  "content": [
    {
      "type": "image",
      "data": "<base64>",
      "mimeType": "image/png"
    }
  ]
}
```

---

## 5. FlowHolt MCP Server — Complete Backend Design

### 5.1 Routes

```
/mcp/u/{token}/stateless        POST — stateless HTTP (primary)
/mcp/u/{token}/stream           POST — streaming HTTP
/mcp/u/{token}/sse              GET  — SSE transport
/mcp/execution/{exec_id}        GET  — poll execution result
/api/v1/mcp-tokens              POST/GET/DELETE — token management
/api/v1/workflows/{id}/mcp-config  GET/PUT — workflow MCP settings
```

### 5.2 MCP Message Types (JSON-RPC 2.0)

All MCP messages are JSON-RPC 2.0:

| Method | Direction | Description |
|--------|-----------|-------------|
| `initialize` | Client→Server | Capability negotiation, protocol version |
| `tools/list` | Client→Server | Get available tools |
| `tools/call` | Client→Server | Invoke a tool |
| `resources/list` | Client→Server | List available resources (optional) |
| `prompts/list` | Client→Server | List prompt templates (optional) |
| `ping` | Either | Keepalive |
| `notifications/cancelled` | Client→Server | Cancel in-flight request |

### 5.3 Capability Negotiation (`initialize`)

```python
FLOWHOLT_MCP_CAPABILITIES = {
    "tools": {"listChanged": True},     # tools can change (workflow activation)
    "resources": {},                     # no resources in v1
    "prompts": {},                       # no prompts in v1
    "logging": {}                        # log messages to client
}
```

### 5.4 Management Tools

Beyond workflow tools, FlowHolt's MCP server exposes management tools (like Make's management tools):

| Tool | Scope required | Description |
|------|---------------|-------------|
| `flowholt_list_workflows` | `workflows:read` | List all workflows |
| `flowholt_run_workflow` | `workflows:run` | Run workflow by ID |
| `flowholt_get_execution` | `executions:read` | Get execution status |
| `flowholt_create_workflow` | `workflows:write` | Create new workflow |
| `flowholt_list_executions` | `executions:read` | List recent executions |

### 5.5 FastAPI Implementation Sketch

```python
# backend/app/routers/mcp.py

from fastapi import APIRouter, Path, Request
from fastapi.responses import StreamingResponse
import json, asyncio

router = APIRouter(prefix="/mcp")

@router.post("/u/{token}/stateless")
async def mcp_stateless(token: str, request: Request):
    user = await validate_mcp_token(token)
    body = await request.json()
    result = await handle_mcp_message(user, body)
    return result

@router.get("/u/{token}/sse")
async def mcp_sse(token: str):
    user = await validate_mcp_token(token)
    async def event_stream():
        # SSE handshake
        yield "event: endpoint\ndata: /mcp/sse/messages\n\n"
        # Keep alive
        while True:
            await asyncio.sleep(15)
            yield ": keepalive\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## 6. MCP Client Node in Studio

FlowHolt workflows need to call **external** MCP servers (e.g., Make's MCP server, custom MCP servers, or other FlowHolt instances).

### 6.1 Node: "MCP Tool Call"

**Category**: AI / MCP  
**Visual**: Purple-tinted node with MCP logo icon  
**Node ID**: `mcp_tool_call`

**Config fields**:
| Field | Type | Description |
|-------|------|-------------|
| MCP Server URL | string | Server endpoint (stateless/stream/sse) |
| Auth type | dropdown | Token in URL / Bearer header / OAuth |
| Token | credential | MCP token (stored in vault) |
| Tool name | string | Tool to call (auto-populated from discovery) |
| Input | JSON | Parameters for the tool |
| Timeout | number | Seconds to wait (default 30) |
| On timeout | dropdown | Error / Return partial / Poll for result |

**Outputs**:
- `result` — tool output
- `executionId` — if timed out
- `error` — error message if failed

### 6.2 Node: "MCP Server List Tools"

Lists available tools on an MCP server (for dynamic discovery).

| Field | Type | Description |
|-------|------|-------------|
| MCP Server URL | string | Server URL |
| Auth | credential | Token/OAuth |
| Filter | string | Optional name filter |

**Output**: Array of tool definitions `[{name, description, inputSchema}]`

### 6.3 Credential Type: "MCP Connection"

Stored in FlowHolt Vault as a credential type `mcp_connection`:
```json
{
  "server_url": "https://...",
  "auth_type": "token_in_url | bearer | oauth",
  "token": "secret...",
  "oauth_client_id": "...",
  "oauth_client_secret": "..."
}
```

---

## 7. UI Surfaces

### 7.1 Profile Page — API Access Tab

Section: **MCP Access**
```
┌─ MCP Server ─────────────────────────────────┐
│ Your MCP Server URL                          │
│ https://flowholt.com/mcp/u/<TOKEN>/stateless │
│ [Copy URL]  [Regenerate token]               │
│                                              │
│ Supported clients: Claude, Cursor, ChatGPT,  │
│ Windsurf, Warp, Gemini CLI, VAPI, OpenAI API │
│                                              │
│ [+ Create MCP Token]                         │
│                                              │
│ Active MCP Tokens                            │
│ ┌────────────────────────────────────────┐   │
│ │ dev-cursor  mcp:use  Created 2d ago    │   │
│ │ [Copy URL] [Revoke]                    │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Create MCP Token Modal**:
```
┌─ Create MCP Token ─────────────┐
│ Label: [________________]      │
│                                │
│ Scopes:                        │
│ ☑ mcp:use (required)          │
│ ☐ workflows:read               │
│ ☐ workflows:write              │
│ ☐ executions:read              │
│                                │
│ Scope filter:                  │
│ ○ All workflows                │
│ ○ Specific workspace           │
│ ○ Specific workflows           │
│   [+ Add workflow]             │
│                                │
│ [Cancel]  [Create Token]       │
└────────────────────────────────┘
```

After creation — show token once:
```
┌─ MCP Token Created ────────────┐
│ ⚠ Copy this token now.        │
│ It won't be shown again.       │
│                                │
│ MCP URL:                       │
│ https://flowholt.com/mcp/u/    │
│ eyJ...<token>.../stateless     │
│ [Copy URL]  [Copy Token]       │
│                                │
│ [Done]                         │
└────────────────────────────────┘
```

### 7.2 Workflow Settings → MCP Tab

Only visible when workflow has on-demand trigger. See §4.3 for complete UI.

### 7.3 Quick Setup Guide (in-app)

Under Profile → API Access → MCP section:
```
┌─ Quick setup guide ──────────────────────────────┐
│ [Claude Desktop]  [Cursor]  [ChatGPT]  [Others]  │
│                                                   │
│ Add to your mcp_settings.json:                    │
│ {                                                 │
│   "mcpServers": {                                 │
│     "flowholt": {                                │
│       "url": "https://flowholt.com/mcp/u/TOKEN/  │
│               stateless",                        │
│       "transport": "streamable-http"             │
│     }                                             │
│   }                                               │
│ }                                                 │
│ [Copy JSON]                                       │
└───────────────────────────────────────────────────┘
```

---

## 8. Security Model

### 8.1 Scope Model

| Scope | Grants |
|-------|--------|
| `mcp:use` | Access MCP server, discover/call workflow tools |
| `workflows:read` | Use `flowholt_list_workflows` management tool |
| `workflows:write` | Use `flowholt_create_workflow` management tool |
| `workflows:run` | Use `flowholt_run_workflow` management tool |
| `executions:read` | Use `flowholt_get_execution` management tool |

### 8.2 Rate Limiting

MCP tokens inherit user's plan rate limits:
- Free tier: 60 MCP calls/hour, 10 concurrent
- Pro: 600 calls/hour, 50 concurrent
- Enterprise: custom

Exceeded limits return HTTP 429 with retry-after header.

### 8.3 Token Revocation

- Tokens can be revoked instantly from Profile → API Access.
- Revoked tokens return HTTP 401 immediately.
- Token rotation: create new → copy URL → revoke old.

### 8.4 Audit Trail

All MCP tool calls are logged to audit log:
```json
{
  "event": "mcp.tool_called",
  "token_label": "dev-cursor",
  "tool_name": "wf__ab12cd34__send_email",
  "user_id": "...",
  "workflow_id": "...",
  "execution_id": "...",
  "timestamp": "..."
}
```

---

## 9. Implementation Phases

### Phase 1 (MVP)
- Stateless HTTP transport only
- MCP token auth only
- Workflow tools (not management tools)
- Basic scope filtering (all / by workflowId)

### Phase 2
- SSE transport
- Management tools
- OAuth auth
- Rate limiting
- Audit logging

### Phase 3
- Streaming transport
- MCP client node in Studio
- Workspace/team-level scoping
- Usage analytics

---

## 10. Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Token format | UUID v4 prefixed `mfh_` | Prevents accidental exposure, grep-findable |
| Token in URL vs header | URL path (like Make) | Maximum client compatibility |
| Default transport | Stateless HTTP | Simplest, most compatible |
| Tool timeout | 30s (configurable 5–300s) | Match Make's behavior |
| Tool name max length | 64 chars (configurable) | Match MCP spec recommendation |
| Workflow qualification | active + on-demand trigger | Exactly like Make's requirement |
| Execution polling endpoint | `/mcp/execution/{id}` | Separate from main /api/v1/ |
