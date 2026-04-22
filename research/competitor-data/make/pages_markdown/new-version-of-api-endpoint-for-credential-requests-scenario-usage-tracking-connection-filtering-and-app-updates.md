# New version of API endpoint for credential requests, scenario usage tracking, connection filtering, and app updates - Help Center

Source: https://help.make.com/new-version-of-api-endpoint-for-credential-requests-scenario-usage-tracking-connection-filtering-and-app-updates
Lastmod: 2026-04-08T14:40:15.170Z
Description: Help Center
Release notes

2026

# New version of API endpoint for credential requests, scenario usage tracking, connection filtering, and app updates

7 min

## Improvements and changes

### New version of Make API endpoint for creating credential requests

We've released **v2** of the POST Make API endpoint: /api/v2/credential-requests/requests/v2. It significantly simplifies credential request creation by reducing the number of required parameters.

The previous version will be deprecated on **June 10, 2026**. Please migrate to **v2** before that date. See [Make API documentation](https://developers.make.com/api-documentation/api-reference/credential-requests#post-credential-requests-requests-v2 "Make API documentation") for details.

### ﻿Scenario﻿ usage tracking expanded

We've expanded the scenario usage tracking feature. Previously available only for connections, you can now easily identify where you are using [data stores](/data-stores#create-a-data-store)﻿, [data structures](/data-stores#add-a-new-data-structure)﻿, and [custom variables](/custom-variables#create-a-custom-variable)﻿ in your scenarios﻿ as well.

![Scenario tracking of a data store](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RqOEAhyu_8a6HPL4bAzwI-20260316-100011.png?format=webp "Scenario tracking of a data store")

﻿

### **Enhanced connection filtering**

We’ve added **My connections** to filter the connections you created. Click the filter icon next to the search box and select **My connections** to see the connections created by you. For more information, see the [Filter connections](https://help.make.com/connect-an-application#filter-connections "Filter connections") page.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/0ZkvAorvFP0zUUntce-Th-20260325-093348.png?format=webp "Document image")

﻿

## App updates

### Simple text prompt: Real-time awareness

The **Simple text prompt** module for [Google Gemini AI](https://apps.make.com/gemini-ai "Google Gemini AI") and [Anthropic Claude](https://apps.make.com/anthropic-claude "Anthropic Claude") apps now automatically includes the current date and time. This ensures that time-sensitive context is accurately represented in your scenarios without requiring manual input.

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8tRxaJrLLoSGmYIbNiADV-20260326-104909.png?format=webp "Document image")

﻿

﻿[**Make AI Web Search**](https://apps.make.com/make-ai-web-search "Make AI Web Search")﻿

**Token-based credit consumption** -The module now uses **GPT-5 nano** model, and calculates credit usage based on input and output tokens consumed per run. Input tokens are determined by your prompt, while output tokens reflect the generated response. Token usage is displayed in the module's output after each run.

For more information, see:

* ﻿[Credits](https://help.make.com/credits#makes-ai-provider "Credits")﻿

* ﻿[Make AI Web Search](https://apps.make.com/make-ai-web-search "Make AI Web Search")﻿

﻿

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-qavpMXHulX97Gv2xXTgah-20250904-154516.png?format=webp "Document image")

﻿

﻿[Etsy](https://apps.make.com/etsy "Etsy")

We've added a new **Personalizations** group of modules:

* List Personalization Questions

* Create or Update a Personalization

* Delete a Personalization

﻿

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-UUjn5uUTngOmDCOl0lrvW-20250814-103121.png?format=webp "Document image")

﻿

﻿[OpenAI](https://apps.make.com/openai-gpt-3 "OpenAI")﻿

GPT-5.4 mini and GPT-5.4 nano models are now available in the **Simple text prompt** module.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

2026](/2026 "2026")[NEXT

Make now a built-in connector on Anthropic Claude](/make-now-a-built-in-connector-on-anthropic-claude "Make now a built-in connector on Anthropic Claude")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
