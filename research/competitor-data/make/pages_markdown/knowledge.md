# Knowledge - Help Center

Source: https://help.make.com/knowledge
Lastmod: 2026-04-08T14:40:16.204Z
Description: Learn about knowledge for AI agents: upload and manage knowledge files, understand how RAG works, and review credit usage for Knowledge modules.
Make AI Agents (New)

# Knowledge

23 min

When you have large blocks of text that an agent must reference often, upload them as knowledge files and reduce the tokens used in requests. This guide covers how knowledge works for Make AI agents, where to upload and manage it, and its modules and credit usage.

## What is knowledge for AI agents?

Knowledge is reference information that your agent uses to tailor its responses to your goals. It consists of files stored in the agent's long-term memory.

Examples of knowledge files:

* Knowledge bases

* Brand guidelines

* Style guides

* Company policies

## How knowledge works

When you upload a knowledge file, your agent can search it and retrieve only the relevant parts when responding to requests.

These steps show how knowledge file upload and retrieval work:

1. You upload a knowledge file to an agent.

2. Make﻿ stores the file in a RAG vector database, splitting the file into smaller text segments called chunks, and converting the chunks to vectors.

3. You later send a request to the agent that relates to the file.

4. The agent searches the database for the chunks relevant to the request.

5. To respond, the agent only returns the most relevant chunks instead of the entire file.

## Knowledge file requirements

Knowledge files have the following limitations:

**Supported file types**

* TXT, PDF, DOCX, CSV, MD, and JSON files

**File size and quantity**

* 20 MB maximum per file

* 20 files maximum per agent

**Team and organization limits**

* **Free, Core, Pro plans:** 100 files per team, 150 files per organization

* **Teams plan:** 150 files per team, 200 files per organization

* **Enterprise plan:** 250 files per team, 500 files per organization

﻿Make﻿ deletes files after 180 days of inactivity (if your agent hasn't queried them).

## Upload knowledge

You can upload knowledge files to the **Make AI Agents (New)** app or the **Knowledge** app, depending on your workflow.

### With the Make AI Agents (New) app

Upload knowledge with the **Make AI Agents (New)** app for files that rarely change, such as company guidelines or style guides.

When to use it:

* For one-time file uploads

* For files that you don't plan to update often

* For a quick setup during the agent configuration

### With the Knowledge app

Upload knowledge with the **Knowledge** app for files that require regular updates, such as knowledge bases or contact lists.

When to use it:

* For files that update periodically

* When you want to manage knowledge separately in a dedicated scenario﻿

* When you want to reduce token costs

For step-by-step instructions, see [Add knowledge](/create-your-first-ai-agent#step-5-add-knowledge)﻿.

## Manage knowledge

Use **Knowledge** modules upload, update, delete, search, and view details about your knowledge files. This section is a reference for these modules and their settings.

### Add Knowledge modules to scenarios

You can add **Knowledge** modules to scenarios﻿ in three ways:

* In an AI agent scenario﻿ after the **Make AI Agents (New)** > **Run an agent (New)** module

* In an AI agent scenario﻿ as a tool for the **Make AI Agents (New)** > **Run an agent (New)** module

* In a standard scenario﻿ on its own or with other **Knowledge** modules

### Append knowledge text

The **Knowledge** > **Append knowledge** **text** module adds content to the end of an existing file. Supported file types include .txt and .md.

**Tip**: Your agent can use this module to regularly update its knowledge.

**Select file**

Select an existing text-based file to update or append.

**Content**

Enter the text to add to the end of the file.

### Delete knowledge

The **Knowledge** > **Delete knowledge** module deletes a file from the knowledge base.

**File ID**

Specify the ID of the file to delete, or let the agent decide.

### Update knowledge file

The **Knowledge** > **Update knowledge file** replaces the content of an existing file that has the same file type. For example, it replaces one PDF with another PDF.

**Select file**

Select the existing file to replace.

**File**

Map the value corresponding to the file content from a previous download file module, for example, Data.

### Update knowledge text

The **Knowledge** > **Update knowledge text** replaces the text content of an existing text file. Supported file types include .txt and .md.

**Select file**

Select the existing file to replace.

**Content**

Enter the text to replace the existing file with.

### Upload knowledge file

The **Knowledge** > **Upload knowledge** file adds a file to the knowledge base.

**Prerequisites**

* Add a download file module before this module to map the file name and content.

Use it when:

* You want a separate scenario to manage knowledge

* You want to automate knowledge uploads from external sources like Google Drive

**Tip:** To keep costs low, add this module to a separate scenario that manages knowledge.

**File name**

Name the file, or map the value corresponding to the file name from a previous download file module.

**File content**

Map the value corresponding to the file content from a previous download file module, for example, Data.

### Upload knowledge text

The **Knowledge** > **Upload knowledge text** module adds a text file to the knowledge base. Give the agent text to turn into a file.

**File name**

Name the file.

**File content**

Paste text into this field to turn it into a file when you run the module.

### Get knowledge

The **Knowledge** > **Get knowledge** module retrieves details about a specific knowledge file (metadata), such as name, description, date, and ID. View this information in the output bundle of the module.

Use it when:

* You need the file ID of a specific file to use in other modules

* You want to see when a file was last updated

* You're debugging knowledge file issues

**File**

Select an existing file to get its metadata.

### List knowledge files

The **Knowledge** > **List knowledge files** module shows all files in an agent's knowledge base.

Use it when:

* You want to see all available files

* You want the file IDs of multiple files

* You want to see order files based on name, size, and upload date

**Order by**

Specify how the agent orders the returned files.

**Limit**

Specify the number of files you want to return. Alternatively, leave this field empty to return all files.

### Query knowledge

Use the **Knowledge** > **Query knowledge** module to ask a question about the files in the agent's knowledge base.

Use it when:

* You want to test the information your agent can find in your files

* You're debugging why the agent isn't retrieving the right information

**Search query**

Ask a question about an existing file, like how you would interact with an AI search engine or chatbot.

Alternatively, if you ask this question in the **Make AI Agents (New)** > **Run an agent (New)** module, in **Input**, let the agent decide.

**Files**

Add existing knowledge files for the agent to search in, or leave empty to search all files.

**Limit**

Specify the number of results (chunks) the agent outputs, or let the agent decide.

## Credit usage

﻿[Credits](https://help.make.com/credits "Credits ") are the currency you buy and consume to use Make﻿. The **Knowledge** app uses credits differently depending on the module and whether a [Make's AI Provider](/credits#PGtNM)﻿ or custom AI provider is selected.

Users on **all plans** can use **Make's AI Provider**. Users on **paid plans** can also use **custom AI provider connections**, such as OpenAI and Anthropic Claude.

Below is a reference for credit usage, by module and AI provider connection type.

| **Module** | **Make's AI Provider**  ﻿ | **Custom AI provider connection**  ﻿ |
| --- | --- | --- |
| **Delete Knowledge file** | 1 credit per operation | 1 credit per operation |
| **Update/Append knowledge**  (PDF/DOCX) | 1 credit per operation + 10 tokens per page + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Update/Append knowledge**  (JSON/CSV/TXT) | 1 credit per operation + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Upload knowledge** (PDF/DOCX) | 1 credit per operation + 10 tokens per page + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Upload knowledge**  (JSON/CSV/TXT) | 1 credit per operation + credits based on tokens:  * AI tokens for file description generation  * Embedding tokens | 1 credit per operation + embedding tokens |
| **Get knowledge** | 1 credit per operation | 1 credit per operation |
| **List knowledge files** | 1 credit per operation | 1 credit per operation |
| **Query knowledge** | 1 credit per operation + credits based on embedding tokens | 1 credit per operation + credits based on embedding tokens |

The tokens mentioned above refer to the following token types:

**Embedding tokens**

These tokens are used to convert your knowledge file into a searchable format that your agent can query. It involves converting chunks of a file into numbers (vectors) to be stored in a RAG vector database.

The number of tokens used depends on the file size, with larger files using more tokens. You are billed for these tokens when you upload a file.

**File description AI tokens (Make's AI Provider only)**

These tokensare used to generate a file summary based on the first part of the file. When you use Make's AI Provider, Make﻿ bills you for these tokens. If you use a custom AI provider connection, the provider bills you for the tokens.

You are billed for these tokens each time you upload a file or change a file description.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Mailhook-triggered AI agent](/mailhook-triggered-ai-agent "Mailhook-triggered AI agent")[NEXT

Make AI Agents (New) app](/make-ai-agents-new-app "Make AI Agents (New) app")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
