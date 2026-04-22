---
title: "AI Agents | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/ai-agents
scraped_at: 2026-04-21T12:41:17.130732Z
---

1. API Reference

# AI Agents

The following endpoints allow you to get, create, update, delete, and run AI Agents. These endpoints are available in open beta to all users. As beta endpoints, both functionality and availability may change.

### hashtag Get Agents

Retrieve a list of all agents

- ai-agents:read

```
ai-agents:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

List of agents retrieved successfully

List of agents retrieved successfully

### hashtag Create Agent

Create a new agent

- ai-agents:write

```
ai-agents:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Request body for creating a new agent.

Agent created successfully

Agent created successfully

### hashtag Get Agent by ID

Retrieve an agent by its ID

- ai-agents:read

```
ai-agents:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Agent retrieved successfully

Agent retrieved successfully

### hashtag Delete Agent by ID

Delete an agent by its ID

- ai-agents:write

```
ai-agents:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Agent deleted successfully

Agent deleted successfully

```
No content
```

No content

### hashtag Modify Agent by ID

Modify an existing agent by its ID

- ai-agents:write

```
ai-agents:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Request body for modifying an existing agent.

Agent modified successfully

Agent modified successfully

```
No content
```

No content

### hashtag Run Agent

Run an agent with the provided ID

- ai-agents:write

```
ai-agents:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Request body for running an agent.

```
a64d23ed-2580-43e4-a898-e97193d7fd5e
```

Agent run started successfully

Response body for running an agent.

Agent run started successfully

### hashtag Run Agent with Server Sent Events (SSE) Streaming

Run an agent with the provided ID and stream the response using Server Sent Events (SSE)

- ai-agents:write

```
ai-agents:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Request body for running an agent.

```
d7fbd183-6b53-4dba-9469-00ec3d047cef
```

Agent run with streaming started successfully

Server-Sent Events stream (text/event-stream)

```
event:step id:4ebb9c59-ab75-41d5-8146-7407ce71f484 data:{"role":"system","content":"do what user says\nCurrent time (ISO): 2025-06-26T01:42:30.080-06:00","id":"445431dd-c20e-4a58-a043-ca9c131d4010","agentIterationId":"a132ced5-4afd-4444-ac9d-330cc99c4986"}
```

Agent run with streaming started successfully

Last updated 1 day ago
