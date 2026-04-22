# Weaviate credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/weaviate
Lastmod: 2026-04-14
Description: Documentation for Weaviate credentials. Use these credentials to authenticate Weaviate in n8n, a workflow automation platform.
# Weaviate credentials[#](#weaviate-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Weaviate Vector Store](../../cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreweaviate/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [Weaviate's connection documentation](https://docs.weaviate.io/weaviate/connections)for more information on how to connect to Weaviate.

View n8n's [Advanced AI](../../../../advanced-ai/) documentation.

## Using API key[#](#using-api-key "Permanent link")

### Connection type: Weaviate Cloud[#](#connection-type-weaviate-cloud "Permanent link")

Create your [Weaviate Cloud Database](https://docs.weaviate.io/cloud/quickstart) and [follow these instructions get the following parameter values](https://docs.weaviate.io/cloud/quickstart#13-connect-to-your-weaviate-cloud-instance) from your Weaviate Cloud Database:

* **Weaviate Cloud Endpoint**
* **Weaviate Api Key**

Note: Weaviate provides a free sandbox option for testing.

### Connection type: Custom Connection[#](#connection-type-custom-connection "Permanent link")

For this Connection Type, you need to [deploy Weaviate](https://docs.weaviate.io/deploy) on your own server, configured so n8n can access it. Refer to [Weaviate's authentication documentation](https://docs.weaviate.io/deploy/configuration/authentication#api-key-authentication) for information on creating and using API keys.

You can then provide the arguments for your custom connection:

* **Weaviate Api Key**: Your Weaviate API key.
* **Custom Connection HTTP Host**: The domain name or IP address of your Weaviate instance to use for HTTP API calls.
* **Custom Connection HTTP Port**: The port your Weaviate instance is running on for HTTP API calls. By default, this is 8080.
* **Custom Connection HTTP Secure**: Whether to connect to the Weaviate through HTTPS for HTTP API calls.
* **Custom Connection gRPC Host**: The hostname or IP address of your Weaviate instance to use for gRPC.
* **Custom Connection gRPC Port**: The gRPC API port for your Weaviate instance. By default, this is 50051.
* **Custom Connection gRPC Secure**: Whether to connect to the Weaviate through HTTPS for gRPC.

For community support, refer to [Weaviate Forums](https://forum.weaviate.io/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
