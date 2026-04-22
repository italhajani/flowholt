---
title: "Not attached | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/webhooks/dedicated/not-attached
scraped_at: 2026-04-21T12:44:41.149836Z
---

1. App components chevron-right
2. Webhooks chevron-right
3. Dedicated

# Not attached

The new URL address for the webhook, created when a user opens the instant trigger and creates a new webhook, has to be registered manually by the user. The user needs to copy the URL address and paste it to the webhook configuration in the settings of the external platform.

The main advantages of webhooks that are not attached when compared to the custom webhook module are:

- Improved UX Mapping is easier when you define an interface . Ability to modify the output if needed, such as parsing dates in non-standard forms, or un-nesting parameters.
- Improved discoverability Easier for most users to notice as a viable option for their integrations.

Improved UX

- Mapping is easier when you define an interface .
- Ability to modify the output if needed, such as parsing dates in non-standard forms, or un-nesting parameters.

Mapping is easier when you define an interface .

Ability to modify the output if needed, such as parsing dates in non-standard forms, or un-nesting parameters.

Improved discoverability

- Easier for most users to notice as a viable option for their integrations.

Easier for most users to notice as a viable option for their integrations.

If your intend to have your app approved by Make, you must provide instructions on how to connect the webhook in the app's documentation.

Most webhooks that can't be attached automatically should not have a connection linked to them. However, there are a few notable exceptions where you might still need it:

- One or more RPCs are used in the parameters of the webhook.
- One or more RPCs are used in the instant trigger module.
- One or more additional requests are defined in the instant trigger communication (for example, a webhook that sends only a resource ID with a request to retrieve the actual data for that resource).

One or more RPCs are used in the parameters of the webhook.

One or more RPCs are used in the instant trigger module.

One or more additional requests are defined in the instant trigger communication (for example, a webhook that sends only a resource ID with a request to retrieve the actual data for that resource).

Last updated 5 months ago
