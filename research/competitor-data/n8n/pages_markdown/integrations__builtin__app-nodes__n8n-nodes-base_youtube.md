# YouTube node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.youtube
Lastmod: 2026-04-14
Description: Learn how to use the YouTube node in n8n. Follow technical documentation to integrate YouTube node into your workflows.
# YouTube node[#](#youtube-node "Permanent link")

Use the YouTube node to automate work in YouTube, and integrate YouTube with other applications. n8n has built-in support for a wide range of YouTube features, including retrieving and updating channels, as well as creating and deleting playlists.

On this page, you'll find a list of operations the YouTube node supports and links to more resources.

Credentials

Refer to [YouTube credentials](../../credentials/google/) for guidance on setting up authentication.

This node can be used as an AI tool

This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](../../../../advanced-ai/examples/using-the-fromai-function/).

## Operations[#](#operations "Permanent link")

* Channel
  + Retrieve a channel
  + Retrieve all channels
  + Update a channel
  + Upload a channel banner
* Playlist
  + Create a playlist
  + Delete a playlist
  + Get a playlist
  + Retrieve all playlists
  + Update a playlist
* Playlist Item
  + Add an item to a playlist
  + Delete a item from a playlist
  + Get a playlist's item
  + Retrieve all playlist items
* Video
  + Delete a video
  + Get a video
  + Retrieve all videos
  + Rate a video
  + Update a video
  + Upload a video
* Video Category
  + Retrieve all video categories

## Templates and examples[#](#templates-and-examples "Permanent link")

**Generate AI Viral Videos with Seedance and Upload to TikTok, YouTube & Instagram**

by Dr. Firas

[View template details](https://n8n.io/workflows/5338-generate-ai-viral-videos-with-seedance-and-upload-to-tiktok-youtube-and-instagram/)

**Generate AI Videos with Google Veo3, Save to Google Drive and Upload to YouTube**

by Davide Boizza

[View template details](https://n8n.io/workflows/4846-generate-ai-videos-with-google-veo3-save-to-google-drive-and-upload-to-youtube/)

**⚡AI-Powered YouTube Video Summarization & Analysis**

by Joseph LePage

[View template details](https://n8n.io/workflows/2679-ai-powered-youtube-video-summarization-and-analysis/)

[Browse YouTube integration templates](https://n8n.io/integrations/youtube/), or [search all templates](https://n8n.io/workflows/)

## What to do if your operation isn't supported[#](#what-to-do-if-your-operation-isnt-supported "Permanent link")

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](../../core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node:

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
2. Select the service you want to connect to.
3. Select your credential.

Refer to [Custom API operations](../../../custom-operations/) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
