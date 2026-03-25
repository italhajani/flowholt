# Integration Stage

This is the stage where FlowHolt should move from generic workflow simulation to real agent and tool integrations.

## What competitors do

### n8n
- Separates nodes from credentials.
- Treats HTTP Request and Webhook as core primitives.
- Uses expressions to map data from earlier nodes into later ones.
- Has many provider-specific credential types, but the execution pattern stays consistent.

### Make
- Treats webhook modules and app connections as first-class building blocks.
- Each scenario owns its webhook setup.
- API key and connection management are explicit, not hidden inside the node body.

### CrewAI
- Gives agents a list of tools from a tool repository.
- Tools are attached intentionally to agents instead of invented on the fly.
- Integration tools are used to hand work off to external systems or existing automations.

## FlowHolt free-tier direction

We should follow a hybrid model:

1. Chat plans from a known registry of blocks.
2. Nodes stay simple in Studio.
3. Credentials are stored separately from node config.
4. Runtime injects secrets when executing a node.
5. Start with the smallest useful integration pack.

## First real integration pack

### Built-in runtime blocks
- Manual trigger
- Schedule trigger
- Condition
- Output

### AI blocks
- Groq agent
- Hugging Face agent later

### Tool blocks
- HTTP request
- Webhook trigger/response

### Business blocks to add after the generic foundation
- WooCommerce content writer helper blocks
- Email sender
- Search/research block

## Required next implementation steps

1. Add integration records in Supabase for saved credentials and connection metadata.
2. Add a credential-aware integration registry in code.
3. Let tool nodes reference an integration id instead of embedding secrets.
4. Add HTTP/Webhook as the first production-ready tools.
5. Add Groq agent profiles as reusable agent presets.

## Why this is the right moment

FlowHolt already has:
- chat-driven draft creation
- visual Studio editing
- node config editing
- runtime template mapping
- branch routing
- basic agent/tool execution

The missing layer is now the real connection and credential system.
