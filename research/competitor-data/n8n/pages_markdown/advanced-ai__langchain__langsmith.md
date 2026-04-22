# Use LangSmith with n8n | n8n Docs

Source: https://docs.n8n.io/advanced-ai/langchain/langsmith
Lastmod: 2026-04-14
Description: How to enable LangSmith for your self-hosted n8n instance.
# Use LangSmith with n8n[#](#use-langsmith-with-n8n "Permanent link")

[LangSmith](https://www.langchain.com/langsmith) is a developer platform created by the LangChain team. You can connect your n8n instance to LangSmith to record and monitor runs in n8n, just as you can in a LangChain application.

Feature availability

Self-hosted n8n only.

## Connect your n8n instance to LangSmith[#](#connect-your-n8n-instance-to-langsmith "Permanent link")

1. [Log in to LangSmith](https://smith.langchain.com/settings) and get your API key.
2. Set the LangSmith environment variables:

| Variable | Value |
| --- | --- |
| `LANGCHAIN_ENDPOINT` | `"https://api.smith.langchain.com"` |
| `LANGCHAIN_TRACING_V2` | `true` |
| `LANGCHAIN_API_KEY` | Set this to your API key |
| `LANGCHAIN_PROJECT` | Optional project name (defaults to `"default"`) |
| `LANGCHAIN_CALLBACKS_BACKGROUND` | `true` (asynchronous trace upload) |

Note

If you just created your LangSmith account, you will see a project named **"default"** only after the first trace is sent from n8n.
All traces go to this project unless you set `LANGCHAIN_PROJECT` to a different name.

Note

Traces may appear with a short delay because `LANGCHAIN_CALLBACKS_BACKGROUND` defaults to asynchronous submission.
Set it to `false` if you prefer synchronous uploads for debugging.

Set the variables so that they're available globally in the environment where you host your n8n instance. You can do this in the same way as the rest of your general configuration.

1. Restart n8n.

For information on using LangSmith, refer to [LangSmith's documentation](https://docs.smith.langchain.com/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
