# Redis credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/redis
Lastmod: 2026-04-14
Description: Documentation for Redis credentials. Use these credentials to authenticate Redis in n8n, a workflow automation platform.
# Redis credentials[#](#redis-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Redis](../../app-nodes/n8n-nodes-base.redis/)
* [Redis Chat Memory](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryredischat/)
* [Redis Vector Store](../../cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreredis/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Database connection

## Related resources[#](#related-resources "Permanent link")

Refer to [Redis's developer documentation](https://redis.readthedocs.io/en/stable/index.html) for more information about the service.

## Using database connection[#](#using-database-connection "Permanent link")

You'll need a user account on a [Redis](https://redis.io/) server and:

* A **Password**
* The **Host** name
* The **Port** number
* A **Database Number**
* **SSL**

To configure this credential:

1. Enter your user account **Password**.
2. Enter the **Host** name of the Redis server. The default is `localhost`.
3. Enter the **Port** number the connection should use. The default is `6379`.
   * This number should match the `tcp_port` listed when you run the `INFO` command.
4. Enter the **Database Number**. The default is `0`.
5. If the connection should use SSL, turn on the **SSL** toggle. If this toggle is off, the connection uses TCP only.
6. If you enable **SSL**, you have the option to **disable TLS verification**. Toggle to use self-signed certificates. WARNING: This makes the connection less secure.

Refer to [Connecting to Redis | Generic client](https://redis.readthedocs.io/en/stable/connections.html) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
