# Manage AI agents - Help Center

Source: https://help.make.com/manage-ai-agents
Lastmod: 2026-03-06T10:14:30.456Z
Description: Create, configure, and manage AI agents with instructions, knowledge, and tools
Make AI Agents

# Manage AI agents

7 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

To create and manage AI agents in Make﻿, navigate to the **AI Agents** configuration tab in the left sidebar.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/FzsjmBiHto_6xA8P1c_Mi-20250929-071833.png "Document image")

﻿

In the **AI Agents** configuration tab, you can:

* View the existing AI agents available in your team

* Create and duplicate agents

* Configure agents

* Delete agents

AI agents are shared across all team members, like connections. If you'd like to have a private agent, use a team where you're the only member.

## Create agents

To create a new AI agent, navigate to the **AI Agents** configuration tab, then click the **Create agent** button in the top-right corner:

1

In the **Connection** dropdown, select an existing connection, or click **Add** to open a **Create a connection** dialog:

1. In the **Connection type** dropdown, select your AI provider.

2. If applicable, fill in the rest of the form according to the documentation for creating a connection to the AI provider. Check the list of [AI service providers](https://www.make.com/en/help/ai-in-make "AI service providers").

3. Click **Save** to complete the connection.

Users on **all plans** can select **Make's AI Provider** as a connection type. Those on **paid plans** can also choose a **custom AI provider connection**, such as OpenAI or Anthropic Claude.

2

In the **Agent name** field, specify a name for the agent.

3

In the **Model** field, select the AI model that the agent will use for reasoning.

4

In the **System prompt** field, define the agent's purpose and constraints.

A concise system prompt is recommended. You can later tailor the agent's behavior to a specific task in the **Make AI Agents** app.

5

Click **Save** to confirm agent settings.

Next, add the agent's tools and context:

1

In **Context**, click **Add** to upload files that the agent can use, then **Upload**.

**Context** allows you to add external information that enhances the agent's knowledge base. Examples include internal knowledge bases or reference tables. Context files are stored in a RAG vector database to enable long-term memory.

Current limitations for uploading in **Context**:

* TXT, PDF, DOCX, CSV, MD, and JSON files only

* 20 MB maximum per file

* 20 files maximum per AI agent

* 150 files per team and 200 files per organization (Teams plan)

* 250 files per team and 500 files per organization (Enterprise plan)

* 100 files per team and 150 files per organization (all other plans)

2

In **MCP**, you can connect your agent to MCP servers to access additional tools.

Click **Add** to create a connection to an available MCP server, then toggle on the tools that you want the agent to access. Click **Save**.

3

In **T****ools**, click **Add** to select the module(s) or scenarios﻿ the agent can use.

4

Click **Save**.

You have created an AI agent. You can now use it in a **Make AI Agents** > **Run an agent** module, or you can continue configuring it.

## Duplicate agents

If you need to create a new agent based on an existing agent, you can duplicate an agent for a quicker setup.

To duplicate an agent:

1

Navigate to the **AI agents** configuration tab in the left sidebar.

2

Identify the existing agent to duplicate.

3

Click the three dots next to the **Configure** button.

4

Select **Duplicate**.

5

In the **Duplicate agent** dialog, configure your new agent's connection, name, model, and system prompt.

6

Click **Duplicate**.

You have now duplicated an agent. To further configure this agent, click the **Configure** button.

## Configure agents

When using AI agents, you will need to adapt them to your processes or update them to improve their efficiency.

Options for configuring your agent:

* Update the agent's system prompt in **System prompt**

* Add background information or data for the agent to use in **Context**

* Add modules or scenarios﻿ the agent can use as its tools in **Tools**

The tools you select in the agent's settings are always available to the agent, in addition to tools that you add in the **Make AI Agents** > **Run an agent** module.

To configure an agent:

1

Navigate to the **AI Agents** configuration tab in the left sidebar, then click **Configure**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Tv3c1dTEDHliFxX4Bebya-20251104-154117.png?format=webp "Document image")

﻿

2

Alternatively, you can click the **Configuration** link in the **Make AI Agents** > **Run an agent** module settings:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/W6HaZIbptVOHIQBavuQAX-20250924-101937.png "Document image")

﻿

3

To make further changes to the agent's model, click the **Agent settings** button within an agent in the **AI Agents** configuration tab.

This allows you to:

* Change the name of the agent

* Change the model the agent is using if the AI provider has different models

* If the model supports **Model Configuration**, you can configure the following:

* **Maximum tokens**: The maximum amount of tokens that the agent can generate and send back to the **Make AI Agents** > **Run an agent** module.

* **Maximum steps**: The maximum number of iterations the agent can run before providing the final reply to your request.

* **Maximum history**: The maximum number of messages that the agent adds to its context from the communication thread. This setting influences the agent's context only if you specify the **Thread ID** in the **Make AI Agents** > **Run an agent** module settings.

Updating agent settings affects all **Run an agent** modules using the agent. To revert changes, you must do so manually.

You can't change an agent's AI provider. To use a different provider, you must create a new agent.

## Delete agents

To delete an agent:

1

Navigate to the **AI Agents** configuration tab on the left sidebar.

2

Click the button with the three dots next to the agent to delete.

3

Select **Delete**.

AI agent deletion is permanent. If you delete an AI agent, all modules using the agent will stop working.

﻿

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Introduction to AI agents](/introduction-to-ai-agents "Introduction to AI agents")[NEXT

Tools for AI agents](/tools-for-ai-agents "Tools for AI agents")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
