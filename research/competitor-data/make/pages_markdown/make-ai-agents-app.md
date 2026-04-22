# Make AI Agents app - Help Center

Source: https://help.make.com/make-ai-agents-app
Lastmod: 2026-04-08T14:40:14.912Z
Description: Explore Make AI Agents app modules and settings to use AI agents in scenarios
Make AI Agents

# Make AI Agents app

8 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

Make AI Agents is available on **all plans** using **Make's AI Provider**, with the option to use **custom AI provider connections** on **paid plans**. It is available in **open beta**. As a beta feature, both product functionality and pricing may change.

The **Make AI Agents** app, in the Scenario﻿ Builder, allows you to use AI agents in scenarios﻿. This article outlines the app's modules and their credit usage.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-3AIay7drWQFkx1sM1uvB2-20250605-101047.jpg?format=webp "Document image")

﻿

## Modules

This section covers all **Make AI Agents** modules and their settings.

### Run an agent

The **Make AI Agents** > **Run an agent** module allows you to create AI agents, provide agents with tools, and send messages to agents—either as additional instructions or tasks.

The following outlines the fields in the **m****odule settings**, found by clicking the module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/yjLou-4qz1AO_B_LMOePz-20251031-150720.png?format=webp "Document image")

﻿

**Agent**

﻿

In **Agent**, choose an existing agent or click the **Create agent** button to create a new agent.

* In the **Connection** field, select your connection.

* In the **Agent name** field, fill in your agent's identification.

* In the **Model** field, select the language model and version provided by your AI service provider.

* In the **System prompt** field, define the agent's purpose and constraints. The system prompt defines the agent in all the scenarios﻿ it uses. In each scenario﻿, you can further customize the agent's description with additional instructions.

**Context**

In **Context**, you can view the **Context** files the agent uses for reference.

**Thread ID**

In **Thread ID**, you can specify a custom thread ID to keep all of your interactions with the agent in the same communication thread.

If you leave the **Thread ID** field empty, a new thread ID appears in the output. The agent will have no memory of previous communication.

Examples of what to map to the **Thread ID** field:

* The **userId** to remember conversations with a user

* The **timestamp** of the first message of a continuing thread to remember the thread

The more context an agent must remember in the **Thread ID**, the higher the tokens. In the **Agent settings** of an agent configuration, you can limit the number of agent runs in the thread history to reduce context from the **Thread ID**.

**Additional system instructions**

In **Additional system instructions**, you can share extra contextual information with the agent. Dynamically provide context by mapping data from the scenario﻿ to this field.

**Messages**

In **Messages**, you can send tasks and specific requirements to the agent. You can send multiple user messages at once.

**Timeout**

In **Timeout**, you can set the maximum number of seconds the agent can execute until it is terminated.

If you leave the **Timeout** field empty, the timeout is 300 seconds (5 minutes). The maximum timeout is 600 seconds (10 minutes).

**Output schema**

In **Output schema**, you can define the output schema of the agent response.

* **Text**: The response is text.

* **Make Schema**: The response is based on the output structure you define. If you click **Generate**, Make﻿ generates a structure based on a content type and sample data.

The following outlines the fields in the **module output**, found by clicking the output bubble after running the module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/P71ZuqG2pnwzzvI5YaNXK-20251031-150850.png?format=webp "Document image")

﻿

**response**

In **response**, you can view the agent's response to the user request. Optionally, [map](/mapping#what-is-mapping)﻿ this data to the next modules.

**executionSteps**

In **executionSteps**, you can expand each step to view the agent's thinking and decision-making process.

Steps are in chronological order and describe any of the following factors:

* **role**: role providing the reasoning step, which includes the **system** (prompt), **user**, **assistant** (AI agent), or **tool**.

* **content**: information processed at a given step of the agent's reasoning, for example, a text input.

* **reasoning**: summary of the agent's thought process before responding to the user, for example:

* "I retrieved the value of 'alpha,' which is 111. Now, I need to multiply it by 3, giving me a new value of 333 for 'beta.' I'll set this using the function functions.set\_variable\_1, specifying 'beta' as the module name and '333' as the module value. After that, I want to inform the user concisely about the value saved. I'll go ahead and call the function now!"

* **agent IterationId**: the ID shared by all of the agent's steps towards producing an output.

* **toolCalls**: tool called, such as a scenario or module tool, and its identifying information.

* **tokenUsage:** AI tokens used in a single module run,including **promptTokens** (input), **completionTokens** (output), and total tokens.

* **toolResponse**: response of the tool called, including the information retrieved and execution time.

**tokenUsageSummary**

In **tokenUsageSummary**, you can view AI tokens used in a single module run, including:

* **promptTokens:** the input tokens processed, such as for prompts, tool responses, tool descriptions, and arguments.

* **completionTokens:** the output tokens processed, such as for content, reasoning, and tool calls.

* **totalTokens**: the tokens processed overall.

### Create Agent Context (file)

The **Make AI Agents** > **Create Agent Context (file)** module allows you to upload a context file to an AI agent. This module is an alternative to uploading context files in the **Context** field of the **AI Agents** configuration tab.

To use **Create Agent Context (file)** in a scenario﻿:

1. In the Scenario Builder, add a module that retrieves the context file, for example, a **Google Drive > Download a File** module.

2. Add the **Create Agent Context (file)** module.

3. In the **Create Agent Context (file)** module's configuration, under **Agent**, select an existing agent that will store the file as context. Alternatively, create a new agent.

4. In **File**, select the preceding module that retrieved the file, or map specific data from the file in **Map**.

5. Click **Save**.

6. Click **Run once**.

You have now uploaded a context file to your AI agent. You can view the file under the **Context** field of the **AI Agents** configuration tab.

To replace an uploaded context file with an updated version that has the same file name, use an **Upsert Agent Context** module.

**Agent**

Select an existing agent that will store the context file, or click the **Create agent** button to create a new agent.

**Context**

Upload a context file that your selected agent can access. You can also see the files you already uploaded to the agent.

* **File**

* Choose the name of the module that downloaded the context file. This option uploads the entire file and keeps the same file name as the original.

* **Map**: Change the file name in **File** name and map a specific value from the context file in **Data**.

### Create Agent Context (text)

The **Make AI Agents** >**Create Agent Context (text)** module allows you to upload text to an AI agent to be used as context.

**Agent**

Select an existing agent that will store the context file, or click the **Create agent** button to create a new agent.

**Context Name**

Name the context file to identify and retrieve it later.

**Context**

Insert text or map text from preceding modules.

### Get Agent Contexts

The **Make AI Agents** > **Get Agent Contexts** module retrieves all the context files uploaded to an AI agent.

When you run the module, context files appear in the module's output. To view its output, click on the white bubble above the module. Under **Operation**, expand **Body**, which includes a numbered item for each context file.

**Agent**

Select an existing agent, or click the **Create agent** button to create a new agent.

### Delete Specific Agent Context

The **Make AI Agents** > **Delete Specific Agent Context** module allows you to delete a specific context file from an AI agent's memory.

**Agent**

Select an existing agent, or click the **Create agent** button to create a new agent.

**Context**

Select an uploaded context file to delete from an agent's memory.

### Delete All Agent Context

The **Make AI Agents** > **Delete All Agent Context** module allows you to delete all context files from an AI agent's memory.

You can use this module on its own in a scenario. Click **Run once** to delete all of the agent's context files.

**Agent**

Select an existing agent, or click the **Create agent** button to create a new agent.

### Upsert Agent Context (file)

The **Make AI Agents** > **Upsert Agent Context (file)** module allows you to upload or replace a context file. This module is ideal when you need to replace an existing file with a file of the same name.

To use **Upsert Agent Context (file)** in a scenario﻿:

1. In the Scenario Builder, add a module that retrieves the context file, for example, a **Google Drive > Download a File** module.

2. Add the **Upsert Agent Context(file)** module.

3. Configure the module settings and click **Save**.

4. Click **Run once**.

You have now upserted a context file. You can check the file in the **AI Agents** configuration tab, in **Context**.

**Agent**

Select an existing agent that will store the context file, or click the **Create agent** button to create a new agent.

**Context**

Upload a context file that your agent can access. You can also see the files you already uploaded to the agent.

* **File**

* Choose the name of the module that downloaded the context file. This option uploads the entire file and keeps the same file name as the original.

* **Map**: Change the file name in **File** name and map a specific value from the context file in **Data**.

### Upsert Agent Context (text)

The **Make AI Agents** > **Upsert Agent Context (text)** module allows you to insert updated text to replace an existing text context. This module is ideal when you need to replace existing text that has the same name.

To use **Upsert Agent Context (text)** in a scenario﻿, see the steps outlined in the **Upsert Agent Context (file)** section**.**

**Agent**

Select an existing agent that will store the context file, or click the **Create agent** button to create a new agent.

**Context Name**

Name the context file to identify and retrieve it later.

**Context**

Insert text or map text from preceding modules.

## Credit usage

The **Make AI Agents** app consumes [credits](/credits)﻿ differently depending on the module and whether [Make's AI Provider](/credits#PGtNM)﻿ or a custom AI provider connection is selected.

The [Credit usage](/how-to-track-credits#credit-usage) ﻿table in Make﻿ tracks credit usage from AI agents.

Users on **all plans** can use **Make's AI Provider**. Users on **paid plans** can also use **custom AI provider connections**, such as OpenAI and Anthropic Claude.

The following outlines **Make AI Agents** modules and their credit usage logic:

| **Module** | **Uses Make's AI Provider**  **(All plans)** | **Uses a custom AI provider connection**  **(Paid plans)** |
| --- | --- | --- |
| **Run an agent** | 1 credit per operation + credits based on AI token usage | 1 credit per operation |
| **Create Agent Context (file)** | 1 credit per operation + credits based on token usage, including:  * AI tokens (file description generation)  * Embedding tokens (vectorization) | 1 credit per operation + embedding tokens (vectorization) |
| **Create Agent Context (text)** | 1 credit per operation + credits based on token usage, including:  * AI tokens (file description generation)  * Embedding tokens (vectorization) | 1 credit per operation + embedding tokens (vectorization) |
| **Get Agent Contexts** | 1 credit per operation | 1 credit per operation |
| **Delete Specific Agent Context** | 1 credit per operation | 1 credit per operation |
| **Delete All Agent Context** | 1 credit per operation | 1 credit per operation |
| **Upsert Agent Context (file)** | 1 credit per operation + credits based on token usage, including:  * AI tokens (file description generation)  * Embedding tokens (vectorization) | 1 credit per operation + embedding tokens (vectorization) |
| **Upsert Agent Context (text)** | 1 credit per operation + credits based on token usage, including:  * AI tokens (file description generation)  * Embedding tokens (vectorization) | 1 credit per operation + embedding tokens (vectorization) |

Token usage in **Create Agent Context** and **Upsert Agent Context** modules includes:

* **Embedding tokens** to convert chunks of a context file into numbers (vectors) to be stored in Make's RAG database, turning the file into a retrievable format for AI agents. The number of embedding tokens will depend on the file size.

* **AI tokens** to generate file descriptions when an AI provider summarizes a context file based on the first part of the file. When you use Make's AI Provider, Make﻿ bills you for these AI tokens. If you use a custom AI provider connection, the provider bills you for the tokens.

When you trigger an agent in a scenario﻿ through **Testing & Training** in the **AI Agents** configuration tab, this action uses 1 credit for each chat input, in addition to each operation (and tokens, when relevant) used.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

AI Agents configuration](/ai-agents-configuration "AI Agents configuration")[NEXT

AI agent use case](/ai-agent-use-case "AI agent use case")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
