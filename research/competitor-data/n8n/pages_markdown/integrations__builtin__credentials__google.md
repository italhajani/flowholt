# Google credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/google
Lastmod: 2026-04-14
Description: Documentation for Google credentials. Use these credentials to authenticate Google in n8n, a workflow automation platform.
# Google credentials[#](#google-credentials "Permanent link")

This section contains:

* [OAuth2 single service](oauth-single-service/): Create an OAuth2 credential for a specific service node, such as the Gmail node. Two options exist:
  + [Managed OAuth2](oauth-single-service/#managed-oauth2): Sign in with Google directly on n8n, with no setup required on the Google Cloud Console. Available for n8n Cloud users only, for certain Google nodes.
  + [Custom OAuth2](oauth-single-service/#custom-oauth2): Configure an OAuth2 app in the Google Cloud Console and connect it to your n8n credential.
* [OAuth2 API (generic)](oauth-generic/): Create an OAuth2 credential for use with [custom operations](../../../custom-operations/).
* [Service Account](service-account/): Create a [Service Account](https://cloud.google.com/iam/docs/service-account-overview) credential for some specific service nodes.
* [Google PaLM and Gemini](../googleai/): Get a Google Gemini/Google PaLM API key.

## OAuth2 and Service Account[#](#oauth2-and-service-account "Permanent link")

There are two authentication methods available for Google services nodes:

* [OAuth2](https://developers.google.com/identity/protocols/oauth2): Recommended because it's more widely available and easier to set up.
* [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts): Refer to the [Google documentation: Understanding service accounts](https://cloud.google.com/iam/docs/understanding-service-accounts) for guidance on when you need a service account.

### Managed OAuth2 for n8n Cloud users[#](#managed-oauth2-for-n8n-cloud-users "Permanent link")

[Managed OAuth2](oauth-single-service/#managed-oauth2) is available for the following Google nodes, for n8n Cloud users. This provides a simplified credential creation process:

* [Google Calendar](../../app-nodes/n8n-nodes-base.googlecalendar/)
* [Google Calendar Trigger](../../trigger-nodes/n8n-nodes-base.googlecalendartrigger/)
* [Google Contacts](../../app-nodes/n8n-nodes-base.googlecontacts/)
* [Google Docs](../../app-nodes/n8n-nodes-base.googledocs/)
* [Google Drive](../../app-nodes/n8n-nodes-base.googledrive/)
* [Google Drive Trigger](../../trigger-nodes/n8n-nodes-base.googledrivetrigger/)
* [Google Mail](../../app-nodes/n8n-nodes-base.gmail/)
* [Google Mail Trigger](../../trigger-nodes/n8n-nodes-base.gmailtrigger/)
* [Google Sheets](../../app-nodes/n8n-nodes-base.googlesheets/)
* [Google Sheets Trigger](../../trigger-nodes/n8n-nodes-base.googlesheetstrigger/)
* [Google Slides](../../app-nodes/n8n-nodes-base.googleslides/)
* [Google Tasks](../../app-nodes/n8n-nodes-base.googletasks/)

## Compatible nodes[#](#compatible-nodes "Permanent link")

Once configured, you can use your credentials to authenticate the following nodes. Most nodes are compatible with OAuth2 authentication. Support for Service Account authentication is limited.

| Node | OAuth | Service Account |
| --- | --- | --- |
| [Google Ads](../../app-nodes/n8n-nodes-base.googleads/) | ✅ | ❌ |
| [Gmail](../../app-nodes/n8n-nodes-base.gmail/) | ✅ | ⚠ |
| [Google Analytics](../../app-nodes/n8n-nodes-base.googleanalytics/) | ✅ | ❌ |
| [Google BigQuery](../../app-nodes/n8n-nodes-base.googlebigquery/) | ✅ | ✅ |
| [Google Books](../../app-nodes/n8n-nodes-base.googlebooks/) | ✅ | ✅ |
| [Google Calendar](../../app-nodes/n8n-nodes-base.googlecalendar/) | ✅ | ❌ |
| [Google Chat](../../app-nodes/n8n-nodes-base.googlechat/) | ✅ | ✅ |
| [Google Cloud Storage](../../app-nodes/n8n-nodes-base.googlecloudstorage/) | ✅ | ❌ |
| [Google Contacts](../../app-nodes/n8n-nodes-base.googlecontacts/) | ✅ | ❌ |
| [Google Cloud Firestore](../../app-nodes/n8n-nodes-base.googlecloudfirestore/) | ✅ | ✅ |
| [Google Cloud Natural Language](../../app-nodes/n8n-nodes-base.googlecloudnaturallanguage/) | ✅ | ❌ |
| [Google Cloud Realtime Database](../../app-nodes/n8n-nodes-base.googlecloudrealtimedatabase/) | ✅ | ❌ |
| [Google Docs](../../app-nodes/n8n-nodes-base.googledocs/) | ✅ | ✅ |
| [Google Drive](../../app-nodes/n8n-nodes-base.googledrive/) | ✅ | ✅ |
| [Google Drive Trigger](../../trigger-nodes/n8n-nodes-base.googledrivetrigger/) | ✅ | ✅ |
| [Google Perspective](../../app-nodes/n8n-nodes-base.googleperspective/) | ✅ | ❌ |
| [Google Sheets](../../app-nodes/n8n-nodes-base.googlesheets/) | ✅ | ✅ |
| [Google Slides](../../app-nodes/n8n-nodes-base.googleslides/) | ✅ | ✅ |
| [Google Tasks](../../app-nodes/n8n-nodes-base.googletasks/) | ✅ | ❌ |
| [Google Translate](../../app-nodes/n8n-nodes-base.googletranslate/) | ✅ | ✅ |
| [Google Workspace Admin](../../app-nodes/n8n-nodes-base.gsuiteadmin/) | ✅ | ❌ |
| [YouTube](../../app-nodes/n8n-nodes-base.youtube/) | ✅ | ❌ |

Gmail and Service Accounts

Google technically supports Service Accounts for use with Gmail, but it requires enabling domain-wide delegation, which Google discourages, and its behavior can be inconsistent.

n8n recommends using OAuth2 with the Gmail node.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
