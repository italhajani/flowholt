---
title: "LLM Providers | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/ai-agents/llm-providers
scraped_at: 2026-04-21T12:43:14.706222Z
---

1. API Reference chevron-right
2. AI Agents

# LLM Providers

The following endpoints allow you to inspect supported AI Providers connections and retrieve the list of supported models. These endpoints are available in open beta to all users. As beta endpoints, both functionality and availability may change.

### hashtag List LLM Providers

Retrieve a list of all LLM providers

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

LLM providers listed successfully

Response body containing a list of available LLM providers.

```
openAi
```

```
anthropic
```

```
mistral
```

```
ai-agent-foundry-openai
```

```
ai-agent-foundry-non-openai
```

```
cohere
```

```
groq
```

```
xai
```

```
gemini
```

```
amazon-bedrock
```

```
openai-api-spec-compatible
```

Name of the account (Make connection) associated with the LLM provider

LLM providers listed successfully

### hashtag Get LLM Provider

Retrieve details of a specific LLM provider by ID

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

LLM provider details retrieved successfully

Detailed information about a specific LLM provider.

```
openAi
```

```
anthropic
```

```
mistral
```

```
ai-agent-foundry-openai
```

```
ai-agent-foundry-non-openai
```

```
cohere
```

```
groq
```

```
xai
```

```
gemini
```

```
amazon-bedrock
```

```
openai-api-spec-compatible
```

LLM provider details retrieved successfully

### hashtag List Models for LLM Provider

Retrieve a list of models for a specific LLM provider by ID

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

List of models for the LLM provider retrieved successfully

Response body containing a list of models for a specific LLM provider.

```
gpt-4o
```

```
gpt-4o-mini
```

```
gpt-4.1
```

```
gpt-4.1-mini
```

```
gpt-4.1-nano
```

```
o1
```

```
o3
```

```
o3-mini
```

```
o4-mini
```

```
claude-3-7-sonnet-latest
```

```
claude-3-5-sonnet-latest
```

```
claude-3-5-haiku-latest
```

```
claude-3-opus-latest
```

```
claude-3-haiku-20240307
```

```
claude-3-sonnet-20240229
```

```
mistral-large-latest
```

```
open-mistral-nemo
```

```
mistral-small-latest
```

```
codestral-latest
```

```
command-r7b-12-2024
```

```
command-r-plus-08-2024
```

```
command-r-08-2024
```

```
llama-3.3-70b-versatile
```

```
llama-3.1-8b-instant
```

```
llama3-70b-8192
```

```
llama3-8b-8192
```

```
grok-3-latest
```

```
grok-3-fast-latest
```

```
grok-3-mini-latest
```

```
grok-3-mini-fast-latest
```

```
grok-2-latest
```

```
gemini-2.5-pro
```

```
gemini-2.5-flash
```

```
gemini-2.0-flash
```

```
gemini-2.0-flash-lite
```

```
gemini-1.5-flash
```

```
gemini-1.5-pro
```

```
openAi
```

```
anthropic
```

```
mistral
```

```
ai-agent-foundry-openai
```

```
ai-agent-foundry-non-openai
```

```
cohere
```

```
groq
```

```
xai
```

```
gemini
```

```
amazon-bedrock
```

```
openai-api-spec-compatible
```

List of models for the LLM provider retrieved successfully

Last updated 1 day ago
