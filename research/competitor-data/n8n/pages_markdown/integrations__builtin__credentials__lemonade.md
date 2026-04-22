# Lemonade credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/lemonade
Lastmod: 2026-04-14
Description: Documentation for Lemonade credentials. Use these credentials to authenticate Lemonade in n8n, a workflow automation platform.
# Lemonade credentials[#](#lemonade-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Lemonade Chat Model](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatlemonade/)
* [Lemonade Model](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.lmlemonade/)
* [Embeddings Lemonade](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingslemonade/)

## Prerequisites[#](#prerequisites "Permanent link")

Lemonade runs AI inference locally. These nodes connect directly to a Lemonade server process running on your machine or network. [Install and run Lemonade server](https://lemonade-server.ai/install_options.html) before creating credentials in n8n.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Lemonade server connection

## Related resources[#](#related-resources "Permanent link")

Refer to [Lemonade's documentation](https://lemonade-server.ai/docs/) for more information about the service.

View n8n's [Advanced AI](../../../../advanced-ai/) documentation.

## Configuring Lemonade server connection[#](#configuring-lemonade-server-connection "Permanent link")

To configure this credential, you'll need:

* **Base URL**: The URL of your Lemonade server, including the API path. The default for a local installation is `http://localhost:8000/api/v1`. If you're running n8n in Docker, use `http://host.docker.internal:8000/api/v1` instead. If your Lemonade server is on a remote machine, replace `localhost` with the server's address.
* **API key** (optional): Optional API key for Lemonade server authentication. This isn't required for default Lemonade installation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
