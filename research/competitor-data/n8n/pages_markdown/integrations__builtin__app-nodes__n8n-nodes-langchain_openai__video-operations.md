# OpenAI Video operations | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/video-operations
Lastmod: 2026-04-14
Description: Documentation for the Video operations in OpenAI node in n8n, a workflow automation platform. Includes details of operations and configuration, and links to examples and credentials information.
# OpenAI Video operations[#](#openai-video-operations "Permanent link")

Use this operation to generate a video in OpenAI. Refer to [OpenAI](../) for more information on the OpenAI node itself.

## Generate Video[#](#generate-video "Permanent link")

Use this operation to generate a video from a text prompt.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [OpenAI credential](../../../credentials/openai/).
* **Resource**: Select **Video**.
* **Operation**: Select **Generate Video**.
* **Model**: Select the model you want to use to generate a video. Currently supports `sora-2` and `sora-2-pro`.
* **Prompt**: The prompt to generate a video from.
* **Seconds**: Clip duration in seconds (up to 25).
* **Size**: Output resolution formatted as width x height. 1024x1792 and 1792x1024 are only supported by Sora 2 Pro.

### Options[#](#options "Permanent link")

* **Reference**: Optional image reference that guides generation. Has to be passed in as a binary item.
* **Wait Timeout**: Time to wait for the video to be generated in seconds. Defaults to 300.
* **Output Field Name**: The name of the output field to put the binary file data in. Defaults to `data`.

Refer to [Video Generation | OpenAI](https://platform.openai.com/docs/guides/video-generation) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
