# Make AI Agents (New) app - Help Center

Source: https://help.make.com/make-ai-agents-new-app
Lastmod: 2026-04-08T14:40:14.404Z
Description: Explore Make AI Agents (New) app settings: configure tools and knowledge, use chat for testing, and review credit usage by feature.
Make AI Agents (New)

# Make AI Agents (New) app

14 min

The **Make AI Agents (New)** app is available in **open beta**, so product functionality and pricing may change. The app is available on **all plans** using Make's AI Provider, with the option to use custom AI provider connections on **paid plans**.

**Make AI Agents (New)** is an app that creates agents, adds their tools and knowledge, and tests them using a chat interface. This article is a reference for its modules and their settings.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/FaN3pV97eywk8vs0-E0rx-20260203-154010.png?format=webp "Document image")

﻿

## Modules

The **Make AI Agents (New)** app includes the **Run an agent (New)** module.

### Run an agent

Create agents, add tools and knowledge, and chat for testing purposes.

Below is a reference for its **module settings**.

**Knowledge**

Upload files so your agent has the additional context to tailor its responses to your goals. Knowledge files are typically static, for example, company guidelines, glossaries, and style guides.

See [Knowledge file requirements](/knowledge#knowledge-file-requirements)﻿ for knowledge file limitations.

**Add tool**

Provide your agent with tools to perform its tasks. Tools in Make﻿ are modules, scenarios, and MCP server tools.

Each tool corresponds to a specific module:

* **Module**: The module for a specific third-party service and action, for example, **Gmail** > **Send an email**

* **Scenario**: The **Scenarios** > **Call a scenario** module

* **MCP server tool:** The **MCP Client** > **Call a tool** module

**Chat**

Interact with your agent to evaluate its performance before going live. Send sample tasks and adjust the agent settings based on the results.

**Connection**

Select the AI provider that connects your agent to a large language model (LLM).

The AI provider available depends on your plan:

* **Make's AI Provider** is available on all plans.

* **Custom AI provider connections** are available to paid plans.

**Model**

Select an LLM from the ones that your AI provider offers. Models vary in processing speed, reasoning abilities, token cost, and effectiveness for specific tasks.

**Instructions**

Clearly and systematically describe what the agent does, including its role, behavior, goals, and steps to achieve them. The agent follows these guidelines across all tasks.

**Input**

Add a specific task or incoming data for the agent to work on. Map data from previous modules, such as chat messages, emails, customer names, and other values.

**Input files**

Upload a file for your agent to process with its task.

File limitations include:

* Make's AI Provider, OpenAI, Anthropic Claude, or Gemini only

* A model that accepts files

* JPG, PNG, GIF, and PDF for the input files you give the agent

* PDF, DOCX, TXT, and CSV for the output files you ask the agent to generate

**Input files** > **File name**

Name your file.

**Input files** > **Data**

Map the file from a previous download file module, such as **Google Docs** > **Download a file**.

**Conversation ID**

Specify a custom ID so your agent keeps user interactions in the same communication thread and remembers them.

Examples:

* A mapped **userId** to remember conversations with a specific user, in the case of multiple users

* A mapped **timestamp** of the first message or email to remember the entire thread and reply

* A unique combination of characters to remember your requests

If you leave this field blank, your agent generates a unique ID for each scenario﻿ run and has no memory of previous communication.

**Maximum conversation history**

Define the maximum number of replies the agent remembers in a conversation.

**Step timeout**

Enter the maximum number of seconds an agent runs in each step before it fails. The maximum timeout is 600 seconds (10 minutes).

If you leave this field blank, the timeout is the default 300 seconds (5 minutes).

**Response format**

Specify the response format that the agent returns.

**Response format** > **Text**

Returns a response in text format.

**Response format** > **Data structure**

Returns a response in a custom format, either as output items (**Add item**) or as a content type, such as JSON (**Generate**).

Below is a reference for **key fields in the module output**. To view them, click the output bubble of the **Run an agent** module. In the **Output** tab, expand an operation, thena bundle.

**Response**

The agent's answer to the user request. Map the response to other modules to use it elsewhere.

**Metadata**

The agent's execution steps and token usage summary.

**Metadata** > **Execution steps**

The agent's decision-making process in chronological order. Each step describes factors such as the role behind the step, the tool used, and the tokens consumed.

**Metadata** > **Token usage summary**

The tokens used in a single run, including **Prompt tokens**  (input), **Completion tokens** (output), and **Total tokens**.

To view the **Reasoning** tab of the module output, click the output bubble of the **Run an agent** module and go to the **Reasoning** tab.

**Reasoning**

View how the agent processes data and responds to requests step by step, including:

* The instructions and inputs the agent used to generate a response, and its processing speed in seconds (always shown)

* What the agent was thinking (shown when using a reasoning model and the task requires deeper reasoning)

## Credit usage

﻿[Credits](https://help.make.com/credits "Credits ") are the currency you buy and consume to use Make﻿. The **Make AI Agents (New)** app, and its knowledge, tools, and chat, each use credits differently. Credit usage also depends on whether a [Make's AI Provider](/credits#PGtNM)﻿ or custom AI provider is selected.

Users on **all plans** can use **Make's AI Provider**. Users on **paid plans** can also use **custom AI provider connections**, such as OpenAI and Anthropic Claude.

Below is a reference for credit usage, by feature and AI provider connection type.

| **Source** | **Make's AI Provider**  ﻿ | **Custom AI provider connection**  ﻿ |
| --- | --- | --- |
| **Run an agent (New)** | 1 credit per operation + credits based on AI tokens | 1 credit per operation |
| **Chat** | 1 credit per operation + 1 credit per operation from called tools + credits based on AI tokens | 1 credit per operation + 1 credit per operation from called tools |
| **Knowledge** (PDF/DOCX) | 1 credit per operation + 10 tokens per page + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Knowledge** (JSON/CSV/TXT) | 1 credit per operation + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Input files** | AI tokens based on the file size, type, AI provider, and model | AI tokens based on the file size, type, AI provider, and model |
| **Tools** | 1 credit per operation and credits based on AI tokens | 1 credit per operation |

The tokens mentioned above refer to the following token types:**﻿**

**Embedding tokens**

These tokens are used to convert your knowledge file into a searchable format that your agent can query. It involves converting chunks of a file into numbers (vectors) to be stored in a RAG vector database.

The number of tokens used depends on the file size, with larger files using more tokens. You are billed once, when you upload a file.

**File description AI tokens (Make's AI Provider only)**

These tokensare used to generate a file summary based on the first part of the file. When you use Make's AI Provider, Make﻿ bills you for these tokens. If you use a custom AI provider connection, the provider bills you for the tokens.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Knowledge](/knowledge "Knowledge")[NEXT

Make AI Agents (New) best practices](/make-ai-agents-new-best-practices "Make AI Agents (New) best practices")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
