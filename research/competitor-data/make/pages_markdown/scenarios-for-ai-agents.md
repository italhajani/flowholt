# Scenarios for AI agents | AI agent scenarios Make - Help Center

Source: https://help.make.com/scenarios-for-ai-agents
Lastmod: 2026-03-10T08:15:52.480Z
Description: Help Center
Make AI Agents

Tools for AI agents

# Scenarios for AI agents

6 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

When you use a scenario﻿ as a tool for an AI agent, you need to create a scenario﻿ (or choose an existing one), and specify its name and description. Unlike module tools, scenarios﻿ require you to define the [scenario inputs and outputs](https://help.make.com/scenario-inputs-and-outputs "scenario inputs and outputs") so that the agent knows how to handle the data it receives and returns.

To use a scenario﻿ as a tool for an AI agent, make sure it's active and scheduled **On demand**. You can also use scenarios﻿ triggered by a Custom webhook.

### Create a scenario﻿﻿

You can create a scenario﻿ for an AI agent in the **AI Agents** configuration tab or in the **Make AI Agents > Run an agent** module.

To create a scenario﻿ for an AI agent in the **AI Agents** configuration tab:

1

Go to the **AI Agents** configuration tab on the left sidebar.

2

Select an agent where you want to add a scenario﻿.

3

In the **Tools** section, click **Add**, and select **Scenario**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/vjb4_BwKmX0Az4vFCKeSm-20250923-075628.png "Document image")

﻿

4

Click **Create scenario**.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-hkSSlrM95FomhsH5ZyeUT-20250821-161259.png?format=webp "Document image")

﻿

5

Configure the scenario﻿:

* Enter scenario's **Name** and **Description.**

* Define scenario inputs and outputs:

* **Name:** The name of the input (e.g., "city")

* **Description:** The description of the input (e.g., "City we want to get the weather report from")

* **Type:** The data type (e.g., Text for a city name)

6

Click **Create scenario**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/untoS8Sp2W8IzF2MBKyz--20250924-084908.png "Document image")

﻿

To create a scenario﻿ for an AI agent in the **Make AI Agents > Run an agent** module:

1

Open the **Make AI Agents > Run an agent** module in a scenario﻿.

2

In the **Agent** field, select your agent.

3

In the **Tools** section, click **Add**, and select **Scenario**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/N3bSys30BU0Sspj3H5RTy-20250924-085302.png "Document image")

﻿

4

Follow the same steps as when creating a scenario﻿ tool in the **AI Agents** configuration tab.

Once the scenario﻿ is created, add modules to it:

1

Click the scenario﻿ or the **Edit** button, and then click the giant plus.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/_nvQN8CXH_Mb2BCUoSX5R-20250926-163403.png "Document image")

﻿

2

Choose the module you want to add.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-ZoPo0aX0Vkcw-yz0H1r7P-20250822-060928.png?format=webp "Document image")

﻿

3

Map the corresponding scenario﻿ inputs you've added in step 5, and click **Save**.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-c0LiG_ShfmO563C8C8jo5-20250826-095026.png?format=webp "Document image")

﻿

4

In the Toolbar, click **Save** to save the scenario﻿, check if it's scheduled to run **On demand** and activate it. This is required to use a scenario﻿as a tool for AI agents.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-18VZhZjc0Cd3Dkf1Wo17N-20250822-062700.png?format=webp "Document image")

﻿

5

Go back to the AI Agent configuration tab, click **Add > Scenarios**, select the scenario﻿ you've created, and click **Save** in the top-right corner to save the changes in your AI Agent.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/xyX0oyJHkshgdDW9s4BTl-20250929-080150.png "Document image")

﻿

You can see below that a scenario﻿ with a single module looks the same as the scenario﻿ created for a module tool. The difference is:

* With a module tool, Make﻿ automatically creates the scenario﻿ with inputs and outputs. You can't edit it in the Scenario﻿ Builder unless you convert it to a scenario﻿.

* With a scenario﻿ tool, you have to add manually the module you want to use, do the mappings for the scenario﻿ inputs/outputs, and edit scenarios﻿ afterward.

Thus, if you don't plan to add additional modules or build a more complex workflow, we recommend using a module tool instead.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/QkMigpPFEDJB2RlmgPijH-20250926-163635.png "Document image")

﻿

Now you can use your as a tool for an AI agent. You can test it by typing a request in the **Testing & Training** chat.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/SSMBnS7cb2Jmt-tzLmnS9-20250929-075540.png "Document image")

﻿

You can find the scenarios﻿ created for AI agents in the **All scenarios** folder.

### Edit a scenario﻿﻿

To edit a scenario﻿ for an AI agent:

1

Go to the **Tools** section of the AI agent configuration tab, and click the expand icon next to the scenario﻿.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/MDtAYZPHP2U5ciRawhNRr-20250924-092527.png "Document image")

﻿

2

Alternatively, within the **Make AI Agents > Run an agent** module, select your agent, and click the expand icon next to the scenario﻿.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/aBFMaYUCe5X-bMYZAa-vs-20250924-091429.png "Document image")

﻿

3

Or just go to the **All scenarios** folder and select the required scenario﻿ from the list.

![Document image](https://app.archbee.com/api/optimize/PL8X94efBsjvhfQV3wyyj-9cogRNhV_sy_IaqXl16Wk-20250824-084142.png "Document image")

﻿

4

In all cases, you will be redirected to the scenario diagram. Click **Edit** in the top-right corner, make the required changes, and save your scenario﻿.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/c7-nAHaH7b3E7z-E53db8-20250926-164417.png "Document image")

﻿

Once you're done editing the scenario, ensure the scenario﻿ is active and scheduled to **On demand**.

### Delete a scenario﻿﻿

To delete a scenario﻿ for an AI agent:

1

Go to the **Tools** section of the AI agent configuration tab, click the delete icon next to the scenario﻿.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-0Uj8UoPJdVuSZnv0gq3s9-20250824-120902.png?format=webp "Document image")

﻿

2

Alternatively, within the **Make AI Agents > Run an agent** module, select your agent and click the delete icon next to the scenario﻿.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/UZ6ztsgEXCSPBa_Yu0zG--20250924-092036.png "Document image")

﻿

Your scenario﻿ will be deleted **from all instances of the agent** across all scenarios. However, it will still be available in your **All scenarios** folder.

Updated 10 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Module tools for AI agents](/module-tools-for-ai-agents "Module tools for AI agents")[NEXT

MCP tools for AI agents](/mcp-tools-for-ai-agents "MCP tools for AI agents")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
