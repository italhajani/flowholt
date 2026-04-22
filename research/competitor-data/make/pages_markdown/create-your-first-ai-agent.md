# Create your first AI agent - Help Center

Source: https://help.make.com/create-your-first-ai-agent
Lastmod: 2026-03-31T14:58:27.691Z
Description: Build your first AI agent: plan your agent, configure instructions, add tools and knowledge, and test before going live.
Make AI Agents (New)

# Create your first AI agent

4 min

In this guide, learn how to create your first agent in Make﻿. This process involves several steps:

1. **Plan an agent** so you have a framework to build from.

2. **Build the scenario** where the agent lives.

3. **Configure the agent** so it understands its job and how to do it.

4. **Add the agent's tools** so it has the capabilities to perform its tasks.

5. **Add the agent's knowledge** so it has additional context to tailor its responses.

6. **Test the agent** so it performs as expected before going live.

Once you complete these steps, you'll have a working agent ready to use in your scenarios.

## Step 1. Plan your AI agent

Plan your agent so you know what it does, the tools and knowledge it needs, and what triggers it, for example:

* **What the agent does:** Content marketing specialist who creates blogs for social media based on trending industry topics

* **Tools:** Google Drive, Airtable, LinkedIn, and Facebook modules

* **Knowledge:** The company style guide and product glossary

* **Trigger:** Google Sheets document with trending topics

## Step 2. Build your AI agent scenario

In Make﻿, your agent belongs to a scenario﻿. To start building, sign in to Make﻿ and click **Create scenario** at the top.

### Add a trigger

Your AI agent scenario﻿ typically starts with a trigger. A [trigger](https://help.make.com/types-of-modules#triggers "trigger ") is the module that starts the scenario﻿ and determines how the agent receives new requests or information.

To add a trigger module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, enter the name of the third-party service you need, such as **Gmail** or **Google Sheets**, and click its app.

3

Select the module that corresponds to the action you need, for example, **Watch Changes** or **Search Rows**.

4

Click the module, configure it based on your requirements, and save.

5

Click the clock icon on the module.

6

In **Schedule settings**, configure how often the scenario﻿ runs.

The option to start the scenario﻿ immediately when new data arrives is only available in [instant triggers](https://help.make.com/types-of-modules#instant-triggers "instant triggers"), which are marked with an instant tag. For information on all scheduling options, see [Schedule a scenario](https://help.make.com/schedule-a-scenario "Schedule a scenario").

7

Click **Save** on the Scenario﻿ toolbar.

You've now added a trigger to the AI agent scenario﻿.

### Add more modules (optional)

Optionally, add more modules before the agent.

Certain use cases require additional modules, such as providing your agent information that frequently changes. Download file, web search, and chat message modules are examples of modules you can add.

To add more modules:

1

Click the plus icon next to the trigger.

2

In the app search, enter the name of the third-party service you need, and click its app.

3

Select the module that corresponds to the action you need.

4

Click the module and configure it based on your requirements.

5

Click **Save**.

6

Click **Save** on the Scenario﻿ toolbar.

7

Repeat steps 1-5 for any other modules you want to add.

Once you have the other modules ready, you can add the agent. Optionally, return to this step at the end to add a module after the agent.

### Add your AI agent

To add the **Make AI Agents (New)** > **Run an agent (New)** module to your scenario﻿:

1

Click the plus icon on the right side of the last module in your scenario﻿.

2

Search for **Make AI Agents (New)** and click the app.

3

Click the **Run an agent (New)** module.

You've now added the **Make AI Agents (New)** > **Run an agent (New)** module to your scenario﻿. Next, configure its settings.

## Step 3. Configure your AI agent

In the module settings of the **Make AI Agents (New)** > **Run an agent (New)** module, configure the agent's AI provider and model, instructions, and other specifics.

### Choose an AI provider and model

AI providers, such as Make's AI Provider, OpenAI, and Claude, connect your agent to large language models (LLMs). To choose your AI provider and model:

1

In **Connection** in the **Make AI Agents (New)** > **Run an agent (New)** module, click **Add** to create a new AI provider connection, or select an existing one from the dropdown.

2

Select an AI provider connection from the **Connection type** dropdown.

If you're on a **Free plan**, select Make's AI Provider. If you're on a **paid plan**, select Make's AI Provider or a custom AI provider connection, such as OpenAI or Anthropic Claude.

3

Name the connection and configure the remaining fields. If the connection requires an API or access key, obtain the key from your AI provider account.

4

Click **Save**.

5

From the **Model** dropdown, select a model. The AI provider offers the models listed.

Models vary in processing speed, reasoning abilities, token costs, and effectiveness in specific tasks. Research the models available to decide which best fits your goals.

Your agent now has an AI provider and model for its decision-making.

### Add instructions

Instructions tell the agent what its job is and how to do it. The agent follows these rules across all tasks and requests.

In **Instructions**, clearly and systematically outline the agent's role, behavior, goals, and the steps to achieve them.

### Add inputs and files

Specify the inputs that the agent processes in each scenario﻿ run. Optionally, add input files to process with the inputs.

To add inputs and files:

1

In the **Make AI Agents (New)** > **Run an agent (New)** module, in **Input**, add any specific, one-time requests or mapped data from previous modules.

2

Optionally, in **Input** files, add the file that the agent receives from a previous module to process with its inputs:

1. In **File name**, name the file to identify it later.

2. In **Data**, click the text field and map the file from the module that downloads files.

**File requirements**

To input files to the agent, you must select Make's AI Provider, OpenAI, Anthropic Claude, or Gemini, and a model that supports files.

Supported file formats include:

* JPG, PNG, GIF, PDF for input files that you give the agent

* PDF, DOCX, TXT, CSV for output files that you tell the agent to generate in **Instructions** or **Input**

Refer to your AI provider's documentation to check file support specifics for your chosen model.

**Text input files**

To input text files, in **Input**, add a separate HTML tag for each file. Within it, map the output value from your download file module that corresponds to the text data (**Data**).

For example: <CSV File> toString(**Data**)</CSV File>.

This action may consume significant space in the agent's memory. Instead, you can upload the file as a knowledge file so the agent only retrieves relevant chunks based on your requests.

**Binary input files**

To input binary files, add an AI module before the agent, such as **Make AI Content Extractor**, to transform the data into a readable format.

You've now added inputs and files to your agent.

### Add additional specifics (optional)

In the remaining fields, configure any additional settings, such as:

* Conversation ID

* Maximum conversation history

* Step timeout

* Response format

To add these specifics:

1

In the **Make AI Agents** > **Run an agent** module, in **Conversation ID**, specify a custom ID so your agent remembers your interactions in a single thread and can reply to them.

2

Alternatively, map a thread ID or timestamp from a previous module, such as the thread ID of an email or Slack message.

If you leave the **Conversation ID** blank, the agent has no memory of your previous interactions and generates a new ID with each run.

3

Toggle **Advanced settings** for more setting options.

4

If you added a Conversation ID, specify in **Maximum conversation history** the maximum number of replies the agent remembers in the conversation.

5

In **Step timeout**, enter the maximum number of seconds an agent runs in each step before it fails. If you leave this field blank, the default time is 300 seconds (5 minutes).

6

In **Response format**, specify the response format that the agent returns.

* Select **Text** in the dropdown to return text as output.

* Select **Data structure** in the dropdown to return responses in a custom structure that you define.

7

Click **Save**.

You've now configured your agent. Adjust its settings at any time.

## Step 4. Add tools

Tools extend agent capabilities by connecting to Make﻿ apps to help agents perform tasks. In Make﻿, tools include modules,scenarios﻿, and MCP server tools. You can add as many as needed.

### Modules

A module is a built-in or third-party app that performs a specific action. Add modules as agent tools for one-step tasks, such as monitoring new customer contacts, sending emails, downloading files, or updating spreadsheets.

To add a module as a tool:

1

In the Scenario﻿ Builder, hover over the plus icon of the **Make AI Agents (New)** > **Run an agent (New)** module, and click **Add tool**.

2

In the app search, enter the name of the third-party service you need, such as Gmail, and click its app.

3

Select the module that corresponds to the action you need.

4

Click the module, configure it according to your requirements, and save.

You've now added a module as a tool for your agent.

### Scenarios

﻿Scenarios﻿ are automated workflows that consist of multiple modules. Add scenarios﻿ as agent tools for more complex tasks that involve several steps or third-party services.

You have two ways to add a scenario﻿: choose an existing scenario﻿ or create a new one.

To choose an existing scenario﻿:

1

In the Scenario﻿ Builder, hover over the plus icon of the **Make AI Agents (New)** > **Run an agent (New)** module, and click **Add tool**.

2

In the app search, search for and click **Scenarios**.

3

Select the **Call a scenario** module to open a dialog.

4

Select an existing scenario from the **Scenario** dropdown.

If you want the scenario﻿ to return data to the agent, the scenario﻿ must end with a [Return outputs](https://apps.make.com/scenario-service)﻿ module.

5

In **Description**, describe what the scenario﻿ does and when the agent uses it.

6

In **Wait for the scenario to finish**, select **Yes** if you want to wait for the called scenario﻿ to finish its run or return output before continuing this scenario's run.

7

Click **Save**.

You've now added an existing scenario﻿ as a tool for your agent.

To create a new scenario﻿:

1

In the Scenario﻿ Builder, hover over the plus icon of the **Make AI Agents (New)** > **Run an agent (New)** module, and click **Add tool**.

2

In the app search, search for and click **Scenarios**.

3

Select the **Call a scenario** module to open a dialog.

4

From the **Scenario** dropdown, click **Create scenario**.

5

Name your scenario﻿, for example, "Watches new rows and sends emails."

6

Describe what the scenario﻿ does so the agent knows when to use it, for example, "Watches new rows in Google Sheets and sends a welcome email to new customers."

7

Define [scenario inputs and outputs](/scenario-inputs-and-outputs)﻿. Inputs are data parameters that the agent fills when it calls the new scenario, and outputs are data that the new scenario returns to the agent.

Examples of inputs and output items:

* **Input items:** Customer email address, first name, last name, email body, and row ID from a spreadsheet

* **Output items**: Email timestamp and success status

Add as many as needed.

8

Click **Create scenario**.

9

In the newly created scenario﻿ , add the modules you need between the **Scenarios** modules.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LiE5He2xuWV7r1u-MfYkT-20260124-115357.png?format=webp "Document image")

﻿

10

Configure the added modules, including mapping the previously defined scenario﻿ inputs to the relevant fields.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/W9QmifqLxLvCXbk78zMMw-20260124-115649.png?format=webp "Document image")

﻿

11

In the **Scenarios** > **Return output** module, map the scenario﻿ outputs.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/t3EHD1pW3Xh43TN3MU_Ky-20260124-120558.png?format=webp "Document image")

﻿

12

Toggle **On demand** on the Scenario﻿ toolbar to activate the scenario﻿ and allow the agent to call it when needed.

13

Click **Save** on theScenario﻿ toolbar.

You've now added a new scenario﻿ as a tool for your agent.

### MCP server tools

MCP server tools are tools that the agent accesses by connecting to third-party MCP servers. Add them when the actions that you want the agent to perform are unavailable through the standard Make﻿ apps.

To add an MCP server tool:

1

In the Scenario﻿ Builder, hover over the plus icon of the **Make AI Agents (New)** > **Run an agent (New)** module, and click **Add tool**.

2

In the app search, search for and click **MCP Client**.

3

Click the **Call a tool** module.

4

Name your tool.

5

Briefly describe what the tool does so the agent knows when to call it.

6

In **Connection**, click **Add** to add a connection to an MCP server, or select an existing connection from the dropdown.

7

If you click **Add**, configure the fields in the **Create a connection** dialog:

1. Name your connection.

2. From the **MCP Server** dropdown, select a third-party MCP server.

3. Enter the connection URL of the selected MCP server, indicated in the [MCP Client](https://apps.make.com/mcp-client#verified-remote-mcp-servers " MCP Client ") documentation.

4. If an API key is required, obtain it from your account with the third-party service.

5. Click **Save**.

8

From the **Tool Name** dropdown, select the tool you want the agent to use.

9

Click **Save**.

You've now added an MCP server tool to your agent.

## Step 5. Add knowledge

﻿[Knowledge](/knowledge)﻿ is reference information that the agent uses to tailor its responses to your goals. Knowledge files are typically static, such as company guidelines or glossaries. The agent stores files in a RAG vector database, retrieving relevant parts based on your request.

You have two ways to add knowledge files to your agent:

* Directly with the **Make AI Agents (New)** app for static files and a quick setup

* With the **Knowledge** app for files that update frequently

Before adding a file to your agent, give it a name that clearly decribes what it contains.

### With the Make AI Agents (New) app

To add knowledge files directly with the **Make AI Agents (New)** app:

1

In the Scenario﻿ Builder, hover over the plus icon of ﻿the﻿ **Make AI Agents (New)** > **Run an agent (New)** module, and click **Knowledge.**

2

In **Knowledge files**, click **Upload files**.

3

Click **Choose file** to select a file to upload. Supported file types include JSON, TXT, CSV, and PDF.

File upload consumes tokens for converting file content to vectors and generating file descriptions. Tokens vary based on file size.

4

Click **Save**.

5

Click the pencil icon next to your added file.

6

Optionally, in **Description**, edit the AI-generated description of your file, or leave it as is.

7

Click **Save**.

8

Toggle **Advanced settings** for more file settings.

9

Optionally, specify a search query that the agent uses to find information in your file, or allow the agent to decide the query (recommended).

10

Optionally, specify the number of results (relevant chunks of the file) the agent returns, or allow the agent to decide the number (recommended).

11

Click **Save**.

You've now added a knowledge file to the agent.

### With the Knowledge app

You can add knowledge files with the **Knowledge** app in your main scenario﻿, or in a separate one dedicated to uploading and managing knowledge.

To avoid uploading files each time the main scenario﻿ runs, create a separate scenario﻿:

1

In a new tab, click **Create scenario** at the top.

2

In the Scenario﻿ Builder, click the giant plus.

3

In the app search, search for and click the name of the third-party service that downloads a file, such as Google Drive or Gmail.

4

Select the download file module, such as the **Google Drive** > **Download a File** module.

5

Configure the download file module settings and click **Save**.

6

Click **Save** on the Scenario﻿ toolbar.

7

Click **Run once** to get mappable data for later modules.

8

Click the plus icon next to the download file module.

9

In the app search, search for and click the **Knowledge** app.

10

Select the **Upload knowledge** module.

11

In **File name**, map the output value from the download file module that corresponds to the file name, for example, Name.

12

In **File content**, map the output value from the download file module that corresponds to the file content, for example, Data.

13

Click **Save**.

14

Click **Run once** to upload the knowledge file.

You've now added knowledge to your agent in a separate scenario﻿.

Alternatively, to add knowledge with the **Knowledge** app in your main scenario﻿, add the download file and **Knowledge** > **Upload knowledge** modules after the **Make AI Agents (New)** > **Run an agent (New)** module.

## Step 6. Test your AI agent

Once you've created your agent, test how well it performs its tasks.

You have a few ways to test agents in Make﻿:

* Chat with the agent

* Run the scenario

* View previous runs in the Scenario﻿ history

### Chat with the agent

Chat is an interface where you send sample requests to your agent to test its performance.

To chat with the agent:

1

Hover over the plus icon of the **Run an agent** app and click **Chat**, or right-click the **Run an agent** app and select **Chat with Agent**.

2

Enter a request, for example, "What is my recipe for this week?"

3

The agent calls the relevant tools and returns a response. If the called tools have a red error symbol, expand a tool and view its output.

4

Adjust your agent's settings, tools, or knowledge based on the results.

5

Return to the chat and resend the sample request.

6

Repeat steps 3-5 until the agent performs as expected.

You've now used chat to test your agent.

### Run the scenario

Test your agent directly in the Scenario﻿ Builder using trigger data from previous scenario﻿ runs. To run the scenario﻿ with existing data:

1

In the Scenario﻿ Builder, click the downward arrow next to **Run once**.

2

From the **Scenario run** dropdown, select a previous scenario run to use for test data.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qHAzfpdsCNZ2LPwOv3u6u-20260126-132409.png?format=webp "Document image")

﻿

3

Click **Run once**.

4

Repeat steps 1-3 until the agent performs as expected.

You've now run your scenario﻿ using existing data.

### View scenario run details

View previous scenario runs in detail to understand how to resolve the errors that your agent or its tools return.

To view Scenario﻿ run details:

1

In the Scenario﻿ Builder, click the back arrow next to the scenario name.

2

Click **History**.

3

Next to the scenario﻿ run with an **Error** status, click **Details**.

4

In the Run details, click the output bubble.

5

To view outputs, expand an operation in the **Output** tab. Some key fields to focus on include **Response** and **Metadata** > **Execution steps**.

6

To view the agent's thought process, go to the **Reasoning** tab.

7

Adjust your agent's settings, tools, or knowledge based on what you discover.

You've now viewed scenario﻿ run details to understand how to resolve errors in your agent.

Once you've tested your agent, it's now ready to use in your scenarios﻿.

## Manage your AI agent (optional)

Optionally, once you've created and tested your agent, you can duplicate or delete it.

Duplicate an agent to use it again in a scenario﻿. You can do this by cloning or copying it:

* Clone to duplicate only the **Make AI Agents (New)** > **Run an agent (New)** module

* Copy to duplicate the **Make AI Agents (New)** > **Run an agent (New)** module and its tools

### Clone your AI agent

To clone an agent:

1

In the Scenario﻿ Builder, right-click the **Make AI Agents (New)** > **Run an agent (New)** module.

2

Click **Clone**.

3

Link the cloned **Run an agent (New)** module to the scenario﻿.

4

Click the module and adjust any of its settings.

5

Click **Save** on the Scenario﻿ toolbar.

You've now cloned your agent.

### Copy your AI agent and its tools

To copy an AI agent and its tools:

1

In the Scenario﻿ Builder, press the Shift key while clicking the canvas.

2

Drag over the **Make AI Agents (New)** > **Run an agent (New)** module and its tools.

3

Press Ctrl + C if you have Windows, or Command + C if you have a Mac.

4

Click the canvas.

5

Press Ctrl + V if you have Windows, or Command + V if you have a Mac.

6

Link the copied **Run an agent (New)** module and tools to the scenario﻿.

7

Click the **Run an agent (New)** module and its tools, and adjust any of their settings.

8

Click **Save** on the Scenario﻿ toolbar.

You've now copied your agent.

### Delete your AI agent

You have two ways to delete your agent: by deleting the **Make AI Agents (New)** > **Run an agent (New)** module, or by deleting the scenario﻿.

To delete the **Run an agent** module:

1

In the Scenario﻿ Builder, right-click the **Make AI Agents (New)** > **Run an agent (New)** module.

2

Click **Delete module**.

You've now deleted the **Make AI Agents (New)** > **Run an agent (New)** module. To add a new one, right-click and select **Add a module**.

To delete a scenario﻿:

1

Click **Scenarios** on the left sidebar.

2

In the scenario﻿ list, find the AI agent scenario﻿ you want to delete.

3

Click the three-dot menu next to the scenario﻿.

4

Click **Delete**.

You've now deleted the scenario﻿.

Next, to walk through a guided use case, see [Sales outreach AI agent use case](/sales-outreach-ai-agent-use-case)﻿.

Updated 31 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Introduction to Make AI Agents (New)](/introduction-to-make-ai-agents-new "Introduction to Make AI Agents (New)")[NEXT

Sales outreach AI agent use case](/sales-outreach-ai-agent-use-case "Sales outreach AI agent use case")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
