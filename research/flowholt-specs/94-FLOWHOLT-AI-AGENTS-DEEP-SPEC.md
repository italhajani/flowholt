# Spec 94 — FlowHolt AI Agents Deep Spec (Make New Agents + n8n AI Nodes Synthesis)
**Source research:** Make AI Agents (New) app, Make AI agent best practices, Make Knowledge/RAG, Make MCP tools, n8n AI nodes (LangChain, agents chain)
**Status:** Final specification

---

## 1. Overview

FlowHolt's AI Agent system draws from both Make's new AI Agents app and n8n's LangChain-based AI nodes. The key synthesis:

- **Make approach:** One "Run an Agent" module inside a scenario, configures LLM, instructions, knowledge (RAG), tools (modules/scenarios/MCP), conversation history, response format
- **n8n approach:** Discrete AI nodes (AI Agent, Chat Model, Memory nodes, Tool nodes) wired together with the canvas, flexible composition using LangChain patterns

**FlowHolt decision:** A hybrid approach — a powerful "AI Agent" node with a built-in config panel (Make-style simplicity), but also exposing sub-nodes for memory, tools, and knowledge (n8n-style composability). Default is the simple modal; advanced users can expand to sub-node graph.

---

## 2. AI Agent Node Types

### 2.1 Run AI Agent (Primary Node)
The main entry point for AI in FlowHolt workflows.

```
Node type: ai_agent
Display name: "AI Agent"  
Category: AI
Visual: Robot icon with brain symbol

Parameters:
  - connection: AI provider connection picker
  - model: LLM model picker (filtered by provider)
  - instructions: textarea (multi-line, expression-enabled)
  - input: any (mapped from previous nodes)
  - input_files: file array (for multimodal)
  - conversation_id: string (optional, enables thread memory)
  - max_conversation_history: number (optional, max messages in thread)
  - step_timeout_sec: number (default 300, max 600)
  - response_format: "text" | "structured" | "json"
  - response_schema: data structure (when response_format="structured")
  - max_output_tokens: number (cost control)
  - max_steps: number (loop prevention, default: tools_count × 10)

Output:
  - response: string | object
  - metadata.execution_steps: array
  - metadata.token_usage: { prompt, completion, total }
  - reasoning: string (when model supports reasoning)
```

### 2.2 AI Chat (Interactive Testing)
Available in inspector panel, not on canvas:
- Test the agent with sample messages before deploying
- Simulates real conversation with actual tools available
- Credit usage: 1 credit per operation + tool calls + AI tokens
- Accessible via "Chat" button in AI Agent node inspector

---

## 3. AI Providers

### 3.1 FlowHolt Built-in AI Provider
- Available on ALL plans (including free)
- No user API key needed — FlowHolt handles the API billing
- Covers: GPT-4o-mini, Claude Haiku, Gemini Flash (fast/cheap tier)
- Credit billing: 1 credit per operation + credits based on AI tokens consumed
- Users who want more control use custom connections

### 3.2 Custom AI Provider Connections (Paid Plans)
Connect with user's own API credentials:
- OpenAI (GPT-4o, GPT-4 Turbo, GPT-5, Codex)
- Anthropic Claude (Claude 3.5 Sonnet, Claude Opus 4)
- Google Gemini (Gemini 1.5 Pro, Gemini 2.0 Flash)
- Groq (Llama, Mixtral)
- Custom OpenAI-compatible (self-hosted, Ollama, etc.)
- Credit billing: 1 credit per operation (AI tokens billed by the provider, not FlowHolt)

### 3.3 Model Selector
- Groups models by provider
- Shows: model name, context window size, cost tier (Fast/Balanced/Powerful)
- Favorite/pin models for quick access
- "Reasoning models" badge for models that support step-by-step thinking

---

## 4. Instructions (System Prompt)

### 4.1 The Four-Layer Prompt Architecture (from Make best practices)
Instructions in AI agents follow a priority stack (most impactful to least):

1. **Instructions field** (system prompt) — Agent's role, behavior, goals, and rules
2. **Tool descriptions** — Descriptions of each tool influence when the LLM calls them
3. **Input field** — The actual task or message per execution
4. **Additional context** — Files, knowledge results, conversation history

### 4.2 Best Practice: Instructions Clarity
- **Be specific**: Instead of "summarize", say "Write a 3-sentence summary in formal English"
- **Define role**: "You are a customer support specialist for AcmeCorp. Your goal is to..."
- **List steps**: Numbered steps the agent must follow in sequence
- **Set constraints**: "Never answer questions unrelated to AcmeCorp products. If asked, politely decline."
- **Specify format**: "Always respond in JSON with keys: { status, message, action }"

### 4.3 Tool Naming Best Practices
Tool names and descriptions are the primary signals LLMs use to decide WHICH tool to call:
- Name: `get_customer_order_status` (not just `get_status`)
- Description: "Use this tool when you need to look up the status of a specific order by order ID. Returns the order state, estimated delivery date, and last update."
- FlowHolt UI: Each tool in the agent config has a "Tool name" and "Tool description" field
- Bad example: Name "query" Description "does stuff with data"

---

## 5. Knowledge (RAG System)

### 5.1 Overview
Knowledge = files uploaded to the agent's memory, used for Retrieval-Augmented Generation (RAG).

How it works:
1. User uploads files (PDF, DOCX, TXT, CSV, JSON)
2. FlowHolt chunks files into segments
3. Chunks are converted to embedding vectors
4. Vectors stored in FlowHolt's vector database
5. At agent runtime: input text → embedding → nearest chunks retrieved → injected into context

### 5.2 Knowledge File Requirements
| Attribute | Limit |
|-----------|-------|
| Max file size | 20 MB per file |
| Max files per agent | 20 files |
| Max files per workspace | 50 files (250 Enterprise) |
| Supported formats | PDF, DOCX, TXT, CSV, JSON, MD |

### 5.3 Credit Cost of Knowledge
- **Embedding cost**: Billed once when file is uploaded (based on file size/content length)
- PDF/DOCX: 10 tokens per page + embedding tokens + file description AI tokens (Make's AI Provider)
- JSON/CSV/TXT: embedding tokens + file description AI tokens
- Custom provider: embedding tokens only (provider-side cost)

### 5.4 Knowledge Management UI
Location: AI Agent node inspector → Knowledge tab
- Upload files (drag and drop or browse)
- View uploaded files (name, size, upload date, status)
- Delete files
- "Re-index" button (force re-embedding if file changed)
- "Test retrieval" — input a query, see which chunks would be retrieved

### 5.5 Knowledge File Labels
- Name: meaningful label used by LLM to decide when to query this knowledge source
- Example: "AcmeCorp Product Catalog Q1 2025" 
- The name appears in the LLM's context alongside the retrieved chunks
- Follow same naming best practices as tools

---

## 6. Tools

### 6.1 Three Types of Tools
1. **Module tools** — Any FlowHolt integration action (e.g., "Gmail: Send email", "Slack: Post message")
2. **Workflow tools** — Call another workflow (sub-workflow) as a tool (free credit cost)
3. **MCP tools** — Model Context Protocol tools from external MCP servers

### 6.2 Module Tools
- Any action node from FlowHolt's integration library
- Configured like normal nodes (credentials, static params)
- Dynamic params left blank → LLM provides them at runtime
- Tool name + description auto-populated from integration name (user can override)

### 6.3 Workflow Tools (Sub-workflow as Tool)
- Expose a FlowHolt workflow as a callable tool for AI agents
- Workflow must have inputs/outputs defined (via "Scenario Inputs" concept)
- Agent calls the workflow with structured inputs, gets structured outputs back
- Use case: complex multi-step logic the agent shouldn't reason about itself
- Cost: No extra credit per workflow call (free via sub-workflow system)

### 6.4 MCP Tools
- Connect to any external MCP (Model Context Protocol) server
- MCP server exposes tools → agent can call them
- Setup: Add MCP connection → define MCP server URL + auth → tools auto-discovered
- Use case: Connect to GitHub MCP, Zapier MCP, company's own internal tools

### 6.5 Tool Configuration in Inspector
For each tool added to the agent:
```
  - Tool type: module | workflow | mcp
  - Tool name: string (override auto-name)
  - Tool description: string (clear, specific description for LLM)
  - Parameters: (for module tools — same as node config)
  - Required: boolean (force LLM to always call this tool)
```

---

## 7. Conversation / Thread Memory

### 7.1 How Conversation Memory Works
- **conversation_id** identifies the thread
- All messages with the same conversation_id are linked
- Agent can "remember" past messages in the thread
- Without conversation_id: each run is stateless (no memory)

### 7.2 conversation_id Strategies
| Strategy | Value | Use case |
|----------|-------|----------|
| User-based | Map `user_id` | Support chatbot remembering each user's history |
| Thread-based | Map `email_thread_id` | Email reply agent that remembers the email chain |
| Session-based | Map `session_id` | Web chat widget maintaining session |
| Fresh each time | Leave blank | Stateless tasks (summarize document, classify text) |

### 7.3 max_conversation_history
- Limits how many past messages are sent to LLM per call
- Each message consumes tokens — more history = higher token cost
- Default: 10 messages
- Set to 0 for fully stateless (no history sent even if conversation_id set)
- Leave blank: no history limit (WARNING: can hit context window limits)

### 7.4 Memory Storage (Backend)
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  agent_node_id TEXT,
  conversation_id TEXT,
  messages JSONB,  -- [{role: "user"|"assistant", content: "..."}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, agent_node_id, conversation_id)
);
```

---

## 8. Response Format

### 8.1 Text (default)
- Agent returns a plain text string
- Simple and works with all models

### 8.2 Structured Output
- Agent returns a JSON object matching a defined schema (Data Structure)
- More reliable than text + JSON parsing
- Uses OpenAI's structured outputs or equivalent function-calling trick
- FlowHolt UI: "Define response schema" button → open Data Structure editor

### 8.3 JSON (simple)
- Agent instructed to respond with raw JSON
- FlowHolt auto-parses the JSON before passing to next node
- Less reliable than Structured Output (LLMs may add markdown around JSON)

---

## 9. Reasoning / Thinking

### 9.1 What it is
- Some LLMs (o1, o3, Claude 3.7 Sonnet, Gemini 2.0 Flash Thinking) support "reasoning"
- The model internally "thinks" step-by-step before responding
- FlowHolt surfaces this thinking in the output `reasoning` field

### 9.2 When to use reasoning models
| Task | Use reasoning? |
|------|---------------|
| Simple classification / formatting | No (slower + more expensive) |
| Complex multi-step planning | Yes |
| Math / logic problems | Yes |
| Writing tasks | No |
| Debugging / code analysis | Yes |

### 9.3 Accessing reasoning in FlowHolt
- AI Agent node output → "Reasoning" tab in inspector
- Shows: instructions + input used, agent's thinking (when available), response time
- Execution steps shown in chronological order
- Each step: { role, tool_called, tokens, duration_ms }

---

## 10. Safety & Cost Controls

### 10.1 Max Output Tokens
- Sets a hard cap on how many tokens the LLM can generate in a response
- Prevents runaway costs on tasks where the model goes verbose
- Recommendation: Start with 1000-2000, increase only if responses are cut off

### 10.2 Max Steps (Loop Prevention)
- Limits total tool calls the agent can make in one run
- Formula: `max_steps = number_of_tools × 10` (Make recommendation)
- Prevents infinite loops where agent keeps calling tools without concluding
- Hard stop at max_steps → error with message "Agent exceeded maximum steps"

### 10.3 Step Timeout
- Max seconds per individual step (default 300s, max 600s)
- If a tool call takes longer → timeout error
- Agent can retry (if retry is configured) or fail

### 10.4 Data Security Best Practices
- Don't put PII in knowledge files unless data residency is confirmed
- Don't pass sensitive data through Make's AI Provider if HIPAA required — use custom provider
- Use "Data Confidential" mode on the workflow to prevent execution logging
- Don't map credentials directly into agent instructions (use Vault/Connections instead)

---

## 11. AI Agent Triggers

### 11.1 Available Trigger Types for AI Agents
Agents can be triggered from:
- Chat message (built-in chat widget)
- Email received (e.g., Gmail: Watch Emails)
- Form submission
- Webhook (HTTP POST)
- Scheduled trigger (for proactive agents)
- Slack message
- Telegram message
- Another workflow calling it as a sub-workflow tool

### 11.2 Trigger-Specific Setup
| Trigger | Input field mapping |
|---------|-------------------|
| Chat | `{{trigger.message}}` |
| Email | `{{trigger.body}}` or `{{trigger.subject}} + {{trigger.body}}` |
| Webhook | `{{trigger.data.message}}` or full body |
| Slack | `{{trigger.text}}` |

### 11.3 Multi-Turn Chat Widget (Built-in)
- FlowHolt provides a shareable chat URL for each agent workflow
- Users can embed as iframe in their product
- Handles conversation threading automatically
- Sends messages → triggers workflow → streams response back

---

## 12. Agent vs. Standard Workflow: Decision Guide

From Make AI Agents documentation (adopted for FlowHolt):

| Scenario | Use |
|----------|-----|
| Fixed logic, same output every time | Standard workflow |
| Combines fixed steps + AI-generated content | Workflow + AI app node (not full agent) |
| Flexible reasoning, judgment calls, variable I/O | AI Agent node |
| Tasks like "intern-level" complexity | AI Agent node |
| Sensitive data / high-stakes financial decisions | Standard workflow + deterministic logic |
| Complex long-running research tasks | AI Agent with sub-workflow tools |

**Key principle:** AI agents introduce unpredictability. Use them for tasks where "good enough most of the time" is acceptable. Use standard workflows when exact, deterministic behavior is required.

---

## 13. Credit Usage for AI Features

| Feature | FlowHolt AI Provider | Custom Provider |
|---------|---------------------|----------------|
| Run an agent (execution) | 1 credit + token credits | 1 credit only |
| Chat (testing) | 1 credit + tool credits + token credits | 1 credit + tool credits |
| Knowledge upload (PDF/DOCX) | 1 credit + 10 tokens/page + embedding | 1 credit + embedding |
| Knowledge upload (JSON/TXT/CSV) | 1 credit + file desc. tokens + embedding | 1 credit + embedding |
| Tool call (per call) | 1 credit + token credits | 1 credit |
| Input file processing | Token credits based on file size/type | Token credits from provider |

---

## 14. FlowHolt Decision Summary

| Feature | n8n | Make | FlowHolt |
|---------|-----|------|---------|
| Agent node architecture | LangChain nodes wired on canvas | Single "Run agent" module | **Hybrid: single node with expandable sub-nodes** |
| Instructions | System message node | Instructions field | **Instructions field (Make approach, simpler)** |
| Knowledge (RAG) | RAG nodes (Vector Store + Embeddings chain) | Built-in Knowledge tab | **Built-in Knowledge tab (Make approach) + n8n-style vector store for advanced** |
| Tools | Tool nodes wired to agent on canvas | Tools added in agent config | **Tools added in agent inspector config (Make approach)** |
| Thread memory | Window Buffer Memory node | conversation_id parameter | **conversation_id + max_history (Make approach)** |
| Response format | Structured output node | Response format setting | **Response format setting with Data Structure (Make approach)** |
| MCP tools | MCP nodes | MCP Client tools | **Both: MCP node on canvas + MCP tools in agent config** |
| Testing | Manual trigger + canvas | Built-in Chat tab | **Adopt Make's built-in Chat tab for testing** |
| Max tokens | — | max_output_tokens | **Adopt Make's max_output_tokens** |
| Max steps | — | max_steps | **Adopt Make's max_steps (loop prevention)** |
| Reasoning output | Via output panel | Reasoning tab | **Adopt Make's Reasoning tab** |
| AI provider | 15+ LLM nodes | AI provider connection | **AI provider connection (Make approach) + Built-in FlowHolt AI Provider** |
| Cost model | User pays provider directly | Credits + tokens | **Credits (FlowHolt provider) + passthrough (custom provider)** |
| Workflow as tool | Execute Workflow node | Scenarios tool in agent | **Sub-workflow as tool, zero-credit calls** |
