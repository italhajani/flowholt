# Microsoft Agent 365 Trigger node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.microsoftagent365trigger
Lastmod: 2026-04-14
Description: Learn how to use the Microsoft Agent 365 Trigger node in n8n. Follow technical documentation to integrate Microsoft Agent 365 Trigger node into your workflows.
# Microsoft Agent 365 Trigger node[#](#microsoft-agent-365-trigger-node "Permanent link")

Early preview

This is an early preview for building agents with Microsoft Agent 365 and n8n. You need to be part of the [Frontier preview program](https://adoption.microsoft.com/copilot/frontier-program/) to get early access to Microsoft Agent 365.

Use the Microsoft Agent 365 Trigger node to receive messages from Microsoft Agent 365 and respond with AI-powered agent capabilities. This node allows n8n to act as the backend for your Agent 365 agents.

Credentials

You can find authentication information for this node [here](../../../credentials/microsoftagent365/).

## Node connectors[#](#node-connectors "Permanent link")

The Microsoft Agent 365 Trigger node can connect to the following sub-nodes:

* **Model**: Connect a language model (Chat model sub-node) to process incoming messages
* **Memory**: Connect a memory sub-node to maintain conversation context
* **Tool**: Connect tool sub-nodes to give your agent additional capabilities

## Node options[#](#node-options "Permanent link")

### Enable Microsoft MCP Tools[#](#enable-microsoft-mcp-tools "Permanent link")

Toggle this option to give your agent access to Microsoft 365 tools through the Model Context Protocol (MCP). Default: Off.

When enabled, select one of:

* **All**: Enable all available Microsoft MCP tools
* **Selected**: Choose specific tools from the list:
  + Calendar
  + Mail
  + SharePoint
  + Teams
  + Word
  + and more

## Getting started[#](#getting-started "Permanent link")

We recommend following these resources to set up your Agent 365 integration:

1. [n8n Sample Agent Documentation](https://github.com/microsoft/Agent365-Samples/tree/main/nodejs/n8n/sample-agent): Example n8n agent implementation with Microsoft Agent 365
2. [Agent 365 CLI Documentation](https://learn.microsoft.com/en-us/microsoft-agent-365/developer/agent-365-cli): Cross-platform command-line tool for deploying and managing Agent 365 applications on Azure

## Known limitations[#](#known-limitations "Permanent link")

### No conversation context in metadata[#](#no-conversation-context-in-metadata "Permanent link")

Currently, incoming messages don't include metadata to link memory to a specific user or conversation context. This functionality is coming soon.

## Related resources[#](#related-resources "Permanent link")

Refer to [Microsoft Agent 365 developer documentation](https://learn.microsoft.com/en-us/microsoft-agent-365/developer/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
