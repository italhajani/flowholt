# Weaviate Vector Store node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreweaviate
Lastmod: 2026-04-14
Description: Learn how to use the Weaviate Vector Store node in n8n. Follow technical documentation to integrate Weaviate Vector Store node into your workflows.
# Weaviate Vector Store node[#](#weaviate-vector-store-node "Permanent link")

Use the Weaviate node to interact with your Weaviate collection as a [vector store](../../../../../glossary/#ai-vector-store). You can insert documents into or retrieve documents from a vector database. You can also retrieve documents to provide them to a retriever connected to a [chain](../../../../../glossary/#ai-chain) or connect this node directly to an [agent](../../../../../glossary/#ai-agent) to use as a [tool](../../../../../glossary/#ai-tool).
On this page, you'll find the node parameters for the Weaviate node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/weaviate/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node usage patterns[#](#node-usage-patterns "Permanent link")

You can use the Weaviate Vector Store node in the following patterns.

### Use as a regular node to insert and retrieve documents[#](#use-as-a-regular-node-to-insert-and-retrieve-documents "Permanent link")

You can use the Weaviate Vector Store as a regular node to insert or get documents. This pattern places the Weaviate Vector Store in the regular connection flow without using an agent.

### Connect directly to an AI agent as a tool[#](#connect-directly-to-an-ai-agent-as-a-tool "Permanent link")

You can connect the Weaviate Vector Store node directly to the tool connector of an [AI agent](../n8n-nodes-langchain.agent/) to use a vector store as a resource when answering queries.

Here, the connection would be: AI agent (tools connector) -> Weaviate Vector Store node.

### Use a retriever to fetch documents[#](#use-a-retriever-to-fetch-documents "Permanent link")

You can use the [Vector Store Retriever](../../sub-nodes/n8n-nodes-langchain.retrievervectorstore/) node with the Weaviate Vector Store node to fetch documents from the Weaviate Vector Store node. This is often used with the [Question and Answer Chain](../n8n-nodes-langchain.chainretrievalqa/) node to fetch documents from the vector store that match the given chat input.

### Use the Vector Store Question Answer Tool to answer questions[#](#use-the-vector-store-question-answer-tool-to-answer-questions "Permanent link")

Another pattern uses the [Vector Store Question Answer Tool](../../sub-nodes/n8n-nodes-langchain.toolvectorstore/) to summarize results and answer questions from the Weaviate Vector Store node. Rather than connecting the Weaviate Vector Store directly as a tool, this pattern uses a tool specifically designed to summarizes data in the vector store.

## Node parameters[#](#node-parameters "Permanent link")

Multitenancy

You can separate your data into isolated tenants for the same collection (for example, for different customers). For that, you must always provide a [Tenant Name](#tenant-name) both when inserting and retrieving objects. [Read more about multi tenancy in Weaviate docs](https://docs.weaviate.io/weaviate/manage-collections/multi-tenancy).

### Operation Mode[#](#operation-mode "Permanent link")

This Vector Store node has four modes: **Get Many**, **Insert Documents**, **Retrieve Documents (As Vector Store for Chain/Tool)**, and **Retrieve Documents (As Tool for AI Agent)**. The mode you select determines the operations you can perform with the node and what inputs and outputs are available.

#### Get Many[#](#get-many "Permanent link")

In this mode, you can retrieve multiple documents from your vector database by providing a prompt. The prompt is embedded and used for similarity search. The node returns the documents that are most similar to the prompt with their similarity score. This is useful if you want to retrieve a list of similar documents and pass them to an agent as additional context.

#### Insert Documents[#](#insert-documents "Permanent link")

Use insert documents mode to insert new documents into your vector database.

#### Retrieve Documents (as Vector Store for Chain/Tool)[#](#retrieve-documents-as-vector-store-for-chaintool "Permanent link")

Use Retrieve Documents (As Vector Store for Chain/Tool) mode with a vector-store retriever to retrieve documents from a vector database and provide them to the retriever connected to a chain. In this mode you must connect the node to a retriever node or root node.

#### Retrieve Documents (as Tool for AI Agent)[#](#retrieve-documents-as-tool-for-ai-agent "Permanent link")

Use Retrieve Documents (As Tool for AI Agent) mode to use the vector store as a tool resource when answering queries. When formulating responses, the agent uses the vector store when the vector store name and description match the question details.

### Get Many parameters[#](#get-many-parameters "Permanent link")

* **Weaviate Collection**: Enter the name of the Weaviate collection to use.
* **Prompt**: Enter the search query.
* **Limit**: Enter how many results to retrieve from the vector store. For example, set this to `10` to get the ten best results.

### Insert Documents parameters[#](#insert-documents-parameters "Permanent link")

* **Weaviate Collection**: Enter the name of the Weaviate collection to use.
* **Embedding Batch Size**: The number of documents to embed in a single batch. The default is 200 documents.

### Retrieve Documents (As Vector Store for Chain/Tool) parameters[#](#retrieve-documents-as-vector-store-for-chaintool-parameters "Permanent link")

* **Weaviate Collection**: Enter the name of the Weaviate collection to use.

### Retrieve Documents (As Tool for AI Agent) parameters[#](#retrieve-documents-as-tool-for-ai-agent-parameters "Permanent link")

* **Weaviate Collection**: The name of the vector store.
* **Description**: Explain to the LLM what this tool does. A good, specific description allows LLMs to produce expected results more often.
* **Weaviate Collection**: Enter the name of the Weaviate collection to use.
* **Limit**: Enter how many results to retrieve from the vector store. For example, set this to `10` to get the ten best results.

### Include Metadata[#](#include-metadata "Permanent link")

Whether to include document metadata.

You can use this with the [Get Many](#get-many) and [Retrieve Documents (As Tool for AI Agent)](#retrieve-documents-as-tool-for-ai-agent-parameters) modes.

### Rerank Results[#](#rerank-results "Permanent link")

Enables [reranking](../../../../../glossary/#ai-reranking). If you enable this option, you must connect a reranking node to the vector store. That node will then rerank the results for queries. You can use this option with the `Get Many`, `Retrieve Documents (As Vector Store for Chain/Tool)` and `Retrieve Documents (As Tool for AI Agent)` modes.

## Node options[#](#node-options "Permanent link")

### Search Filters[#](#search-filters "Permanent link")

Available for the [Get Many](#get-many), [Retrieve Documents (As Vector Store for Chain/Tool)](#retrieve-documents-as-vector-store-for-chaintool), and [Retrieve Documents (As Tool for AI Agent)](#retrieve-documents-as-tool-for-ai-agent) operation modes.

When searching for data, use this to match metadata associated with documents. You can learn more about the operators and query structure in [Weaviate's conditional filters documentation](https://docs.weaviate.io/weaviate/api/graphql/filters).

You can use both `AND` and `OR` with different operators. Operators are case insensitive:

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 ``` | ``` {   "OR": [     {         "path": ["source"],         "operator": "Equal",         "valueString": "source1"     },     {         "path": ["source"],         "operator": "Equal",         "valueString": "source1"     }   ] } ``` |

Supported operators:

| Operator | Required Field(s) | Description |
| --- | --- | --- |
| `'equal'` | `valueString` or `valueNumber` | Checks if the property is equal to the given string or number. |
| `'like'` | `valueString` | Checks if the string property matches a pattern (for example, sub-string match). |
| `'containsAny'` | `valueTextArray` (string[]) | Checks if the property contains **any** of the given values. |
| `'containsAll'` | `valueTextArray` (string[]) | Checks if the property contains **all** of the given values. |
| `'greaterThan'` | `valueNumber` | Checks if the property value is greater than the given number. |
| `'lessThan'` | `valueNumber` | Checks if the property value is less than the given number. |
| `'isNull'` | `valueBoolean` (true/false) | Checks if the property is null or not. ([must enable before ingestion](https://docs.weaviate.io/weaviate/manage-collections/collection-operations#set-inverted-index-parameters)) |
| `'withinGeoRange'` | `valueGeoCoordinates` (object with geolocation data) | Filters by proximity to geographic coordinates. |

When inserting data, the document loader sets the metadata. Refer to [Default Data Loader](../../sub-nodes/n8n-nodes-langchain.documentdefaultdataloader/) for more information on loading documents.

### Metadata Keys[#](#metadata-keys "Permanent link")

You can define which metadata keys you want Weaviate to return on your queries. This can reduce network load, as you will only get properties you have defined. Returns all properties from the server by default.

Available for the [Get Many](#get-many), [Retrieve Documents (As Vector Store for Chain/Tool)](#retrieve-documents-as-vector-store-for-chaintool), and [Retrieve Documents (As Tool for AI Agent)](#retrieve-documents-as-tool-for-ai-agent) operation modes.

### Hybrid: Query Text[#](#hybrid-query-text "Permanent link")

Provide a query text to combine vector search with a keyword/text search.

### Hybrid: Explain Score[#](#hybrid-explain-score "Permanent link")

Whether to show the score fused between hybrid and vector search explanation.

### Hybrid: Fusion Type[#](#hybrid-fusion-type "Permanent link")

Select the fusion type for combining vector and keyword search results. [Learn more about fusion algorithms](https://weaviate.io/learn/knowledgecards/fusion-algorithm).

Options:
- **Relative Score**: Uses relative score fusion
- **Ranked**: Uses ranked fusion

### Hybrid: Auto Cut Limit[#](#hybrid-auto-cut-limit "Permanent link")

Limit result groups by detecting sudden jumps in score. [Learn more about autocut](https://docs.weaviate.io/weaviate/api/graphql/additional-operators#autocut).

### Hybrid: Alpha[#](#hybrid-alpha "Permanent link")

Change the relative weights of the keyword and vector components. 1.0 = pure vector, 0.0 = pure keyword. Default is 0.5. [Learn more about the alpha parameter](https://weaviate.io/learn/knowledgecards/alpha-parameter).

### Hybrid: Query Properties[#](#hybrid-query-properties "Permanent link")

Comma-separated list of properties to include in the query with optionally weighted values, e.g., "question^2,answer". [Learn more about setting weights on property values](https://docs.weaviate.io/weaviate/search/hybrid#set-weights-on-property-values).

### Hybrid: Max Vector Distance[#](#hybrid-max-vector-distance "Permanent link")

Set the maximum allowable distance for the vector search component.

### Tenant Name[#](#tenant-name "Permanent link")

The specific tenant to store or retrieve documents for. [Learn more about multi-tenancy](https://weaviate.io/learn/knowledgecards/multi-tenancy).

Must enable at creation

You must pass a tenant name at first ingestion to enable multitenancy for a collection. You can't enable or disable multitenancy after creation.

### Text Key[#](#text-key "Permanent link")

The key in the document that contains the embedded text.

### Skip Init Checks[#](#skip-init-checks "Permanent link")

Whether to [skip initialization checks](https://docs.weaviate.io/weaviate/client-libraries/typescript/notes-best-practices#initial-connection-checks) when instantiating the client.

### Init Timeout[#](#init-timeout "Permanent link")

Number of seconds to wait before [timing out](https://docs.weaviate.io/weaviate/client-libraries/typescript/notes-best-practices#timeout-values) during initial checks.

### Insert Timeout[#](#insert-timeout "Permanent link")

Number of seconds to wait before [timing out](https://docs.weaviate.io/weaviate/client-libraries/typescript/notes-best-practices#timeout-values) during inserts.

### Query Timeout[#](#query-timeout "Permanent link")

Number of seconds to wait before [timing out](https://docs.weaviate.io/weaviate/client-libraries/typescript/notes-best-practices#timeout-values) during queries.

### GRPC Proxy[#](#grpc-proxy "Permanent link")

A proxy to use for gRPC requests.

### Clear Data[#](#clear-data "Permanent link")

Available for the [Insert Documents](#insert-documents) operation mode.

Whether to clear the collection or tenant before inserting new data.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Build a Weekly AI Trend Alerter with arXiv and Weaviate**

by Mary Newhauser

[View template details](https://n8n.io/workflows/5817-build-a-weekly-ai-trend-alerter-with-arxiv-and-weaviate/)

**Build person OSINT profiles using Humantic AI, Hunter, CourtListener and GPT-5**

by Open Paws

[View template details](https://n8n.io/workflows/12507-build-person-osint-profiles-using-humantic-ai-hunter-courtlistener-and-gpt-5/)

**Research organizations with GPT‑5, Gemini, CourtListener, LegiScan and OSINT web sources**

by Open Paws

[View template details](https://n8n.io/workflows/12506-research-organizations-with-gpt5-gemini-courtlistener-legiscan-and-osint-web-sources/)

[Browse Weaviate Vector Store integration templates](https://n8n.io/integrations/weaviate-vector-store/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's Weaviate documentation](https://js.langchain.com/docs/integrations/vectorstores/weaviate/) for more information about the service.

Refer to [Weaviate Installation](https://docs.weaviate.io/deploy) for a self hosted Weaviate Cluster.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
