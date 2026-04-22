# AI agent best practices - Help Center

Source: https://help.make.com/ai-agent-best-practices
Lastmod: 2026-03-06T10:17:18.720Z
Description: Design effective AI agents with tips on tools, prompts, data security, and more
Make AI Agents

# AI agent best practices

19 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

Well-designed AI agents can run tools for you with minimal human intervention. However, their effectiveness depends on their setup and instructions. This guide outlines tips for building AI agents in Make, such as tool naming, prompting, and data access.

## Tools

If a large language model (LLM) is an AI agent's brain, tools are its hands and actions. They give the agent the capabilities to do its job. In Make﻿, you have three types of [tools for an AI agent](https://help.make.com/tools-for-ai-agents "tools for an AI agent"): scenarios, modules, and MCP server tools.

### Tool naming

An agent chooses the right tool for a task based on your tool names and descriptions. Write concise names and descriptions that reflect the tool's purpose and when to run it.

For example: "Add customer email to Customer Contacts table" as the scenario name and "This adds a new customer email address to the Customer Contacts table. Do not run this if '@' is missing" as the scenario description.

Well-named tools are essential when sharing with external AI systems, such as agents, through [Make MCP Server.](https://developers.make.com/mcp-server "Make MCP Server.") These systems rely on tool metadata (not the system prompt) to make the right decisions.

### Input and output naming in scenarios

Well-defined [scenario inputs and outputs](/scenario-inputs-and-outputs)﻿ help the AI agent understand what data to receive and share. Inputs and output fields include:

* Name

* Type

* Description

* Default value

* Required (Yes/No)

* Multi-line (Yes/No)

Take advantage of this configuration to specify your requirements for inputs or outputs. For example: "customer\_email" as the scenario input name and "Full name of the customer" as the description. It is a required text input.

You can also add stylistic requirements to input descriptions, if relevant. For example, you can specify that a string (text) input must be all lowercase, sentence case, all caps, and so on.

### Debugging in tools

If you notice your agent returns suboptimal outputs, first check if the issue is with your tools. You can debug by adjusting tool-specific logic in tool names, descriptions, and input and output schemas.

For example, you can add a hint in your tool description about when the agent should run the tool ("Only run when you have a bank user ID").

Also, check that all scenarios with an agent are activated; scenario errors can cause deactivation.(For handling errors in scenarios, see [Error handling](/error-handling)﻿.)

You can adjust the logic in the system prompt if that change applies to all tools.

## Prompting

Make AI agent prompts serve two distinct but related functions: system instructions and user-agent communication.

The **System prompt** serves as the core instructions guiding agent behavior, including role, limitations, and processes.

Prompting (or communicating with) agents involves task requests and instructions. You can send prompts in:

* Scenario-based **Messages** in the **Make AI Agents >** **Run an agent**module

* The chat window, **Testing & Training**, in the **AI Agents** configuration tab

### Global system prompts

Keep the system prompt broad enough to enable your agent to work across different scenarios (e.g., quoting, inventory, and customer support). An overly specific prompt may restrict your agent's effectiveness to a limited set of tasks.

For example, consider these two approaches to writing system prompts – specific or simple – for a content agent you expect to use across multiple content creation scenarios:

**Specific and restrictive prompt**

"You're a content agent designed to generate Instagram content under 150 characters. Drawing from various sources, you will write captions for lifestyle brands. Use an upbeat tone, two relevant hashtags, and three emojis. End the caption with a question to the audience."

**Simple and global prompt**

"You're a content agent designed to generate and refine text across formats and platforms. You can produce engaging, informative, or persuasive content (including short-form, long-form, outlines, and more) tailored to audience needs and platform requirements."

The specific prompt restricts the agent in platform (Instagram), form (character count, emojis, hashtags), and task (social media caption writing), which limits its ability to help with other content-related tasks like SEO-optimized blog writing.

Keep system prompts general and include more specific instructions in the relevant tool's description or **Messages** field.

### Redundancy in AI-assisted prompts

If you are not an advanced prompt writer, you may benefit from using the **Improve** button in **System prompt**, which enhances your prompt with AI. However, overly lengthy prompts can increase the risk of LLM confusion or hallucinations. Using AI to write prompts may contribute to this risk if you don't review its work.

Always review your AI-enhanced prompts for redundancies and remove them. Similarly, edit or remove the Workflow section if it does not align with your process.

### Additional prompts in tools

After writing your system prompt, you can add further specifications in tools. You can do this in **Messages** and **Additional system instructions** in the **Make AI Agents > Run an agent** module.

In **Messages**, you can write a prompt or input that tells the agent what to do with that specific tool, including limitations and conditions.

For example, in a social media caption scenario, you can instruct the agent to limit the length to 150 characters, avoid complex punctuation like em dashes or semicolons, and request human validation for specific topics.

In the optional **Additional system instructions**, you can add extra contextual information that the agent wouldn't receive from the user.

For example, if users call your agent through communication channels like Slack or Telegram, you can use this field to pass metadata such as user type, timestamp, and profile name from that channel.

## Data security and access

LLMs are imperfect systems that are vulnerable to risk, such as PII disclosure in outputs or prompt hacking. The best precaution is to assume that anyone could successfully access what you share with your agent, including its tools and data.

### Agent access to information

Agents only use the personal data you explicitly provide through tools and context files. To reduce data security risk, limit the agent's access to the data it needs to do its job. Avoid exposing it to sensitive, non-essential information.

For example, instead of connecting the agent to a tool that exports your entire calendar, its access could be limited to a public calendar, with only free/busy slots listed.

### Limits of user-imposed constraints

An agent's system prompt includes limitations and constraints, or rules. Limitations guide the agent's behavior by defining desirable and undesirable actions. For example, you can instruct your AI agent to:

* Limit engagement with off-topic queries

* Avoid sharing sensitive information in outputs

* Flag harmful or unsafe inputs

* Prioritize internal knowledge bases as references

* Prompt a human to validate outputs

However, even with thorough, explicit guardrails, the agent could still behave unpredictably. In AI systems, constraints themselves have limitations: agents may not always follow them. Given the implications for data security, the most reliable constraint in this area is giving the agent minimal access to sensitive information.

## Model configuration

In **Agent settings** in the **AI Agents** configuration tab, you can improve how your agent functions by setting limits on its output tokens, execution steps, and thread history.

### **Max output tokens**

Agents can provide lengthy responses, which can get costly. Use **Max Output Tokens** to limit the number of tokens an agent outputs. If you set the maximum tokens too low, you may get incomplete responses. One token equals about 4 characters of text.

### **Steps per agent call**

In rare cases, agents can get stuck in a loop, repeating the same actions without achieving their goal. Prevent this by limiting the execution steps an agent can take. A safe estimate for execution steps is to multiply your maximum expected number of tool calls by 10.

### **Max number of agent runs in thread history**

Agents use thread history, similar to a chat history, to remember interactions with you. However, you may not want to keep the entire thread history. Doing so consumes additional tokens, as the agent needs to read the entire history during each execution. To save tokens, limit the number of previous messages the system stores. For example, if you only want to keep the last 5 messages, set this field to 5.

## Knowledge enhancement

The LLM behind your agent is likely unaware of your company's internal knowledge and processes. Improve your agent's decision-making by uploading private files to **Context** in the **AI Agents** configuration tab. These files serve as reference information for the agent.

Context files should contain fixed information that applies to all tools. For example:

* Company guidelines

* Internal knowledge bases (e.g., Confluence)

* Support tickets

* Community posts

* Company Slack conversations

Your files shouldn't include sensitive information when the agent will be used by users who shouldn't access that data.

When deciding on files to upload, consider the garbage in, garbage out (GIGO) principle: poor-quality or unrepresentative inputs lead to similarly flawed outputs. Upload information that reflects the results you want the agent to reproduce. For example, do not upload poorly executed work as examples to follow.

## Cost optimization

When using Make AI agents, you incur fees for Make credits and LLM provider (e.g., ChatGPT) tokens.

Overall costs can rise quickly if using one thread ID, multiple tools, and advanced reasoning LLMs. Keep LLM costs low by optimizing your token usage and choosing a cost-effective LLM.

### Token usage

Token usage depends on two main factors: the amount of information the LLM processes in requests and the number of user-to-LLM interactions.

**Data scope**

To reduce the amount of information an agent handles in a request, specify the data you want to pass to the agent and the data you want it to return. For example, instead of instructing the agent to scan an entire database, narrow the scope of its search to entries after June 1st, 2025.

To limit the data handled in requests:

* Define scenario inputs and outputs.

* Filter inputs before passing them into the agent. In a scenario, you can add a filter in the route before the **Make AI Agents >** **Run an agent**module.

* Store files with global information (e.g., contact details) in the agent's **Context**.

**Context**

When you have large blocks of text that an agent must reference often, you can upload them as context files and reduce the tokens processed in requests.

Your context files are split into text segments called chunks, converted to vectors, and stored in Make’s RAG vector database. Agents can search the database for the chunks relevant to your queries, and return the most relevant sections instead of entire files, using fewer tokens.

You can upload context files in the **AI Agents** tab in the left sidebar, or the **Context** modules in the **Make AI Agents** app.

After uploading a file, update the system prompt or user message to describe what the agent can find in the file. This action helps the agent understand when to retrieve the file, distinguish between similar files, and avoid processing irrelevant information.

These strategies can help prevent errors in Make that result from exceeding the token limit of the LLM underlying your agent. See OpenAI’s [GPT-5 documentation](https://platform.openai.com/docs/models/gpt-5 "GPT-5 documentation") for an example of LLM token limits.

**Interactions**

User-to-LLM interactions, which include your inputs and the LLM's outputs, also consume tokens.

To reduce interactions, prioritize clarity in prompts and consolidate data requests instead of making multiple sequential requests. These strategies enable complete, accurate outputs sooner.

Additionally, when you use the same thread ID across **Make AI Agents** module runs, the entire thread gets passed into the agent. If you don't need to reference your conversation history with an agent, leave the **Thread ID** field blank. This action creates a new thread ID, which can significantly save costs.

You can monitor token usage in the **Make AI Agents > Run an agent** output bundle in **tokenUsageSummary**, and on your LLM provider account.

### Choice of starter LLM

You have multiple LLMs to choose from for powering your AI agent, each with varying costs depending on factors like speed and reasoning abilities.

When creating an AI agent, start with an LLM with a good speed-to-cost ratio. The ideal starter model is fast and inexpensive, such as OpenAI's GPT‑4.1 mini. More advanced, slower models, like OpenAI's o3, can rapidly increase costs. Test how well an affordable model can achieve your goals, and scale up as needed.

While a fast LLM performs well in many cases, the right model depends on what you want to do with an agent. Some LLMs are better suited for certain use cases than others, and many LLM providers classify their models accordingly.

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

MCP tools for AI agents](/mcp-tools-for-ai-agents "MCP tools for AI agents")[NEXT

AI Agents configuration](/ai-agents-configuration "AI Agents configuration")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
