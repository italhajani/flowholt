# SQL AI Agent node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/sql-agent
Lastmod: 2026-04-14
Description: Learn how to use the SQL Agent of the AI Agent node in n8n. Follow technical documentation to integrate the SQL Agent into your workflows.
# SQL AI Agent node[#](#sql-ai-agent-node "Permanent link")

Feature removed

n8n removed this functionality in February 2025.

The SQL Agent uses a SQL database as a data source. It can understand natural language questions, convert them into SQL queries, execute the queries, and present the results in a user-friendly format. This agent is valuable for building natural language interfaces to databases.

Refer to [AI Agent](../) for more information on the AI Agent node itself.

## Node parameters[#](#node-parameters "Permanent link")

Configure the SQL Agent using the following parameters.

### Data Source[#](#data-source "Permanent link")

Choose the database to use as a data source for the node. Options include:

* **MySQL**: Select this option to use a MySQL database.
  + Also select the **Credential for MySQL**.
* **SQLite**: Select this option to use a SQLite database.
  + You must add a [Read/Write File From Disk](../../../../core-nodes/n8n-nodes-base.readwritefile/) node before the Agent to read your SQLite file.
  + Also enter the **Input Binary Field** name of your SQLite file coming from the Read/Write File From Disk node.
* **Postgres**: Select this option to use a Postgres database.
  + Also select the **Credential for Postgres**.

Postgres and MySQL Agents

If you are using [Postgres](../../../../credentials/postgres/) or [MySQL](../../../../credentials/mysql/), this agent doesn't support the credential tunnel options.

### Prompt[#](#prompt "Permanent link")

Select how you want the node to construct the prompt (also known as the user's query or input from the chat).

Choose from:

* **Take from previous node automatically**: If you select this option, the node expects an input from a previous node called `chatInput`.
* **Define below**: If you select this option, provide either static text or an expression for dynamic content to serve as the prompt in the **Prompt (User Message)** field.

## Node options[#](#node-options "Permanent link")

Refine the SQL Agent node's behavior using these options:

### Ignored Tables[#](#ignored-tables "Permanent link")

If you'd like the node to ignore any tables from the database, enter a comma-separated list of tables you'd like it to ignore.

If left empty, the agent doesn't ignore any tables.

### Include Sample Rows[#](#include-sample-rows "Permanent link")

Enter the number of sample rows to include in the prompt to the agent. Default is `3`.

Sample rows help the agent understand the schema of the database, but they also increase the number of tokens used.

### Included Tables[#](#included-tables "Permanent link")

If you'd only like to include specific tables from the database, enter a comma-separated list of tables to include.

If left empty, the agent includes all tables.

### Prefix Prompt[#](#prefix-prompt "Permanent link")

Enter a message you'd like to send to the agent before the **Prompt** text. This initial message can provide more context and guidance to the agent about what it can and can't do, and how to format the response.

n8n fills this field with an example.

### Suffix Prompt[#](#suffix-prompt "Permanent link")

Enter a message you'd like to send to the agent after the **Prompt** text.

Available LangChain expressions:

* `{chatHistory}`: A history of messages in this conversation, useful for maintaining context.
* `{input}`: Contains the user prompt.
* `{agent_scratchpad}`: Information to remember for the next iteration.

n8n fills this field with an example.

### Limit[#](#limit "Permanent link")

Enter the maximum number of results to return.

Default is `10`.

### Tracing Metadata[#](#tracing-metadata "Permanent link")

Add custom key-value metadata to tracing events for this agent. This is useful for filtering and debugging runs in tracing tools like [LangSmith](../../../../../../advanced-ai/langchain/langsmith/).

Entries with empty keys or values are ignored.

## Templates and examples[#](#templates-and-examples "Permanent link")

Refer to the main AI Agent node's [Templates and examples](../#templates-and-examples) section.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](../common-issues/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
