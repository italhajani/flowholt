# Scenario inputs and outputs - Help Center

Source: https://help.make.com/scenario-inputs-and-outputs
Lastmod: 2026-03-13T16:54:36.696Z
Description: Set the data passed to the scenario you call, and the information it returns
Explore more

Scenarios

# Scenario inputs and outputs

7 min

﻿Scenario﻿ inputs and outputs let you control what data goes into your scenario﻿ and what data comes out. They define the information that scenarios﻿ expect and share when communicating with other scenarios or external systems.

To find scenario﻿ inputs and outputs, navigate to the Scenario﻿ Builder and click on the **Scenario inputs and outputs** icon on the toolbar.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/1TXZRlsEOf_NhpfIQTbx8-20260121-145416.png?format=webp "Document image")

﻿

## What scenario﻿ inputs and outputs do

**Scenario inputs** define what data a scenario receives when triggered.

**Scenario outputs** define what data the scenario returns after execution.

When a scenario﻿ calls another scenario﻿ (subscenario), inputs specify what data gets passed to the subscenario, while outputs specify what data gets returned to the calling scenario﻿.

## When you need scenario﻿ inputs and outputs

You will need to [configure scenario inputs and outputs](m0Sq0-LOYhxLFze6FxUsd)﻿ when building scenarios﻿ that communicate with other scenarios﻿ or external systems. This includes scenarios﻿ that:

* Call other scenarios﻿ (subscenarios)

* Get triggered by external systems via API

* Function as tools in AI systems

Some cases when you need scenario﻿ inputs and outputs:

* Syncing customer information across multiple systems

* Adding leads to CRM and email lists while creating proposals

* Creating records, invoices, emails, or orders with specific input parameters

## Where to use scenario﻿ inputs and outputs

﻿Scenario﻿ inputs and outputs enable your scenarios to function as tools across different systems: subscenarios, APIs, Make AI agents, and Make MCP server.

Regardless of which system you are working with, scenarios﻿ with scenario﻿ inputs and outputs use three modules of the **Scenarios** app: **Call a scenario**, **Start scenario**, and **Return output**.

Consider this flow to understand how these modules interact:

1. In the parent scenario, you add a **Call a scenario** module, then select an existing (sub)scenario or create a new one.

2. In the subscenario, add a **Start scenario** module, which allows you to map scenario﻿ inputs to modules.

3. Add more modules depending on what the subscenario aims to do.

4. Add a **Return output** module to send output from the subscenario to the parent.

This flow applies to all cases using scenario﻿ inputs and outputs.

### Subscenarios

﻿[Subscenarios](https://help.make.com/subscenarios "Subscenarios") break complex workflows into smaller, reusable components. Each subscenario handles a specific task or business function. Scenario﻿ inputs and outputs define the data exchanged between parent scenario﻿ and subscenarios.

The **Start scenario** module triggers the subscenario and passes input data. The **Return output** module returns data from the subscenario to the calling scenario.﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3m3nxy9qMeU6Y7_2CTa13-20260129-090314.png?format=webp "Document image")

﻿

Benefits of inputs and outputs in subscenarios:

* **Reusability:** Updates to a subscenario's inputs and outputs automatically apply to all scenarios﻿ using that subscenario.

* **Structured data sharing:** Inputs and outputs clearly define what data gets shared between scenarios﻿.

**Example:** A scenario﻿ that retrieves restaurant menus could use subscenarios for individual restaurants. Each subscenario receives restaurant name/ID and date as inputs, then returns menu items, prices, and last-updated timestamps as outputs.

### APIs

The [Make API](https://developers.make.com/api-documentation "Make API") allows external systems to trigger scenarios﻿. Scenario﻿ inputs and outputs define the structure of API requests and responses.

When calling a scenario﻿ via API, the defined inputs become the request body parameters. After execution, the scenario﻿ returns the defined outputs in the response structure.

**Example:** An external application triggers a restaurant menu scenario﻿ via API, sending date and restaurant ID as inputs. The scenario﻿ returns structured menu data as outputs.

### Make AI agents

﻿[Make AI agents](/make-ai-agents)﻿ can use scenario﻿ as tools. Scenario﻿ inputs and outputs help agents understand what data to provide and what to expect in return.

Input and output names and descriptions help AI agents select appropriate data, similar to how tool names and descriptions help agents choose the right tools.

Inputs and outputs in data flow patterns:

* **Agent to scenario:** When scenario﻿ inputs are defined

* **Scenario to agent:** When scenario﻿ outputs are defined

* **Bidirectional:** When both inputs and outputs are defined

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2lgGe02JvFoENX8LFz5PS-20260129-090413.png?format=webp "Document image")

﻿

**Example**: A simple AI agent for retrieving daily restaurant menus uses subscenarios for each restaurant as its tools. Based on the user prompt, the agent calls the right scenario﻿ and returns a menu. The agent uses the outputs' structure in the subscenario to understand the menu data to be provided in the response.

### Make MCP server

The [Make MCP server](https://developers.make.com/mcp-server " Make MCP server ") enables scenarios﻿ to run from MCP-enabled AI systems like Claude. Scenario﻿ inputs and outputs serve as instructions for AI systems by defining the information to exchange during interactions.

﻿Scenario﻿ inputs are parameters that AI systems fill when using scenarios. Scenario﻿ outputs are parameters for data that scenarios return to AI systems.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Zu43H885E3akULEuyxL4_-20260129-090505.png?format=webp "Document image")

﻿

**Example:** When you ask Claude, an MCP client, about a restaurant's daily menu, Claude calls the relevant scenarios﻿ through the MCP server. The scenario﻿ outputs provide the menu information for Claude's response.

## Scenario input and output types

To help you correctly define inputs and outputs, the following table outlines the input and output types available in scenarios﻿, including descriptions and when to use them.

| **Type** | **Description** |
| --- | --- |
| Array | A list of similar items. For example, a list of email attachments, where each item is a single file. |
| Collection | A group of related details about a single item. For example, a "Contact" collection containing a name, email address, and phone number. |
| Date | A specific point in time, including the year, month, and day. Date is in ISO 8601 format (e.g., 2015-09-18T11:58Z). |
| Text | Any type of plain text, from a word to a paragraph. Use this for names, descriptions, or messages. |
| Number | A numerical value. Use this for quantities, prices, ratings, or any other data that consists of digits. |
| Boolean | A type with only two options: true/false or yes/no. Good for toggles. |
| Select | A dropdown list of predefined options. Use this when you want a user to choose from a list of specific items, such as a country. |
| Dynamic collection | Use this type to map a collection/object or paste a valid JSON string into the field. |
| Uinteger | A whole positive number.Use it for ID numbers or counts where a negative value is impossible or an error. |
| Integer | A whole number with no fractional part. Use it for any value that cannot have a decimal (e.g., the number of users on a site). |
| Email | Use this type for emails. |
| URL | Use this for URLs. |
| UUID | Use this type for a Universally Unique Identifier. |
| Color | Use this type for colors. |
| Any | Use it when you can't define a type. |

﻿

Updated 13 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenario notes](/scenario-notes "Scenario notes")[NEXT

Create the structure of scenario inputs or outputs](/create-the-structure-of-scenario-inputs-or-outputs "Create the structure of scenario inputs or outputs")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
