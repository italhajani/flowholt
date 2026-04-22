# AI Agents configuration - Help Center

Source: https://help.make.com/ai-agents-configuration
Lastmod: 2026-03-06T10:17:43.063Z
Description: Understand the configuration settings needed to set up and customize AI agents
Make AI Agents

# AI Agents configuration

3 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

The **AI Agents** configuration tab, located on the left sidebar, is where you can create and configure AI agents. This article serves as a reference for all fields in this tab.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/FzsjmBiHto_6xA8P1c_Mi-20250929-071833.png "Document image")

﻿

**System prompt**

The **System prompt** is your agent's core instructions. It outlines its purpose, behavior, and any guidelines or constraints it should follow. The agent follows these instructions across all workflows.

The **Improve** button on the lower right-hand side is an optional prompt improvement feature. Use it to improve your existing prompt with AI and enable more consistent outcomes.

When you click **Improve**, you can leave the field empty for an auto-improvement or suggest specific improvements. Click **Save** to apply the changes.

**Context**

In **Context**,upload external information to improve the agent's knowledge. Examples include internal knowledge bases or reference tables.

Once uploaded, context files are split into text segments called chunks, converted to vectors, and stored in Make’s RAG vector database.

Current limitations for uploading in **Context**:

* TXT, PDF, DOCX, CSV, MD, and JSON files only

* 20 MB maximum per file

* 50 files maximum per team (250 for Enterprise plans)

* 100 files maximum per organization (500 for Enterprise plans)

* 20 files maximum per AI agent

You can also upload context files in the **Make AI Agents** app's [Context modules](https://help.make.com/make-ai-agents-app#tO34g "Context modules").

**MCP**

In **MCP**, connect your agent to MCP servers to access additional tools.

Click the **Add** button to create a connection to an available MCP server, then toggle on the tools that you want the agent to access. Click **Save**.

**Tools**

**T****ools** are modules and scenarios﻿ your agent uses to make decisions and complete tasks across all workflows.

When an agent processes requests, it uses tool names and descriptions to choose the right tool for the task. When using scenarios as tools, it processes [scenario inputs and outputs](/scenario-inputs-and-outputs)﻿ names and descriptions to choose the right data.

**Testing & Training**

**Testing & Training** is a chat interface that allows you to communicate with your agent in Make﻿ instead of external tools like Telegram or Slack. Use it to test, debug, and refine your agent's responses.

When you interact with your agent in **Testing & Training**, the agent shows you the tools it uses and their inputs and outputs.

You can click the **New chat** button to start a new chat.

For reference information on the **Make AI Agents** app, see [Make AI Agents app](/make-ai-agents-app)﻿.

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

AI agent best practices](/ai-agent-best-practices "AI agent best practices")[NEXT

Make AI Agents app](/make-ai-agents-app "Make AI Agents app")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
