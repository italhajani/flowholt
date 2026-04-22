# New Make AI Agents Reasoning feature: OpenAI reasoning model users must verify organization - Help Center

Source: https://help.make.com/new-make-ai-agents-reasoning-feature-openai-reasoning-model-users-must-verify-organization
Lastmod: 2026-01-19T12:20:51.205Z
Description: On November 24th, Make AI Agents launches a new Reasoning feature, requiring OpenAI organization verification for continued use of reasoning models like GPT-5.
Release notes

2025

# New Make AI Agents Reasoning feature: OpenAI reasoning model users must verify organization

7 min

Starting **November 24th**, Make AI Agents will support **Reasoning**, a capability that exposes the agent’s thought process before proceeding with the next step.

If you use a reasoning model and the agent requires deeper reasoning for a task, this feature will be visible in its output in the **Reasoning** field of the **executionSteps**.

Due to a new OpenAI requirement for users to verify their organizations to use reasoning models, **users of AI agents with** [**OpenAI reasoning models**](https://platform.openai.com/docs/guides/reasoning "OpenAI reasoning models")(GPT-5, GPT-5-mini, GPT-5-nano, O3, O4-mini, and O3-mini) must **verify their organization in OpenAI** **by the 24th** to allow affected agents to continue running after the feature release.

## What's happening?

* Make AI Agents' **Reasoning** feature launches on November 24th.

* Users of OpenAI reasoning models (**GPT-5, GPT-5-mini, GPT-5-nano, O3, O4-mini, and O3-mini**) in AI agents must verify their OpenAI organization by the 24th.

* If users don't verify by this date, agents using OpenAI reasoning models will stop running.

## What's next?

To keep AI agents using OpenAI reasoning models running after the 24th, you can **verify your OpenAI organization** if you want to continue using the same model, or **switch AI models**.

### Option 1: Verify your OpenAI organization

To verify your organization in OpenAI:

1

Log in to your account on OpenAI Platform.

2

Click on the **Settings** icon in the top-right corner.

3

In **Organization settings**, click the **Verify Organization** button under **Verifications**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EKHpFVHe_VkZBptXQoYVz-20251103-164948.png?format=webp "Document image")

﻿

Once an organization is verified, no further action is needed in Make﻿.

### Option 2: Switch AI models

If you choose not to verify your organization in OpenAI, you can:

* Switch to a **OpenAI model without reasoning**, such as GPT-4o or GPT-4.1.

* Switch to the **Large model** (GPT-5) if you're using **Make's AI Provider**.

Agents that use models without reasoning will continue running.

## FAQs

### Why do I need to verify my organization now?

On November 24th, Make﻿ will execute a system-wide migration to introduce the Reasoning feature to all compatible models. This update is subject to the OpenAI requirement for users to verify their OpenAI organization to use reasoning models.

### **What happens if I don’t verify by November 24th?**

If you don't verify your organization by November 24th, any AI agents using OpenAI reasoning models will return an error message indicating that verification is required to resume service.

### **How do I know if my model is affected?**

OpenAI's update impacts AI agents with OpenAI models that are "reasoning-capable," including:

* GPT-5

* GPT-5-mini

* GPT-5-nano

* O3

* O3-mini

* O4-mini

To enable your AI agents using OpenAI reasoning models to continue running, make sure to verify your OpenAI organization before November 24th.

### **Will other models continue to work?**

Yes. Make's AI Provider models, and those of custom AI providers, such as Gemini and Anthropic, will continue to run normally after November 24th. The new organization verification requirement only affects OpenAI reasoning models.

### **What’s the difference between models with and without reasoning?**

The key difference between models with and without reasoning is how information is processed when handling tasks:

* **Complexity:** Reasoning models are designed to process more complex or multi-step queries than those without reasoning, ideal for tasks related to coding, mathematics, and complex problem-solving.

* **Reasoning:** Reasoning models consume tokens to generate internal reasoning steps, allowing them to perform advanced planning and analysis before producing a response.

* **Speed:** While reasoning models are newer and more capable than modules without reasoning, they are typically slower to process information.

## Learn more

To find out more about OpenAI verification and the new Make AI Agents reasoning feature, see these resources:

* ﻿[**OpenAI organization verification**](https://apps.make.com/openai-gpt-3#vklrW "OpenAI organization verification") ﻿

* ﻿[**Make AI Agents Reasoning feature**](https://help.make.com/make-ai-agents-app#OWPW0 "Make AI Agents Reasoning feature ") ﻿

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Make AI Web Search, MCP client and MCP server improvements](/make-ai-web-search-mcp-client-and-mcp-server-improvements "Make AI Web Search, MCP client and MCP server improvements")[NEXT

Organization and team info, apps updates](/organization-and-team-info-apps-updates "Organization and team info, apps updates")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
