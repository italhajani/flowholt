# How to use Make Grid - Help Center

Source: https://help.make.com/how-to-use-make-grid
Lastmod: 2026-03-19T11:29:37.786Z
Description: Discover how to use Make Grid to visualize, manage, and optimize your automation ecosystem
Make Grid

# How to use Make Grid

10 min

﻿Make﻿ Grid helps you understand and manage your automation ecosystem. Here are the most common ways to work with Make﻿ Grid based on what you're trying to accomplish.

### Open your dependencies from Make﻿ Grid

Your automation landscape is not just something you can view, it is a fully interactive environment where you can manage your dependencies.

**What you can do**:

You can open, review, and edit connected objects directly from Make﻿ Grid canvas without needing to jump between tabs.

**View and edit:** View and edit Google Sheets, Docs, Slides, Calendar, and JotForm directly within Make﻿ Grid to make live changes.

**View Only:** Preview Google Forms, Tally, and Typeform to verify configurations.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EVGmMKGNe8sxB_v1Q8pJV-20260319-112935.png?format=webp "Document image")

﻿

**Example:** You are reviewing a complex automation and spot a Google Sheet that needs a quick data correction before your automation goes live. Instead of searching through your Drive or browser history, you simply open the Google Sheet from Make﻿ Grid, update the cell, and save it. You cav perform a cross-platform update without ever leaving your automation map.

### View and understand your dependencies

When you're managing multiple scenarios﻿, it's easy to lose track of how everything is connected. Make﻿ Grid shows exactly which scenarios﻿ rely on each dependency.

**What you can do**:

Click any dependency, such as an Airtable table, to see which scenarios﻿ rely on it. Hover on the specific links to open the scenario﻿ directly. You can also search for any entity such as a table, an URL, or app to instantly see what depends on it.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3vVMfLq4w-tusD-znW58M-20251210-144029.png?format=webp "Document image")

﻿

**Example:** Your team uses a shared "Offboading Users" table in Airtable across multiple scenarios﻿. You search for it in Make﻿ Grid and immediately see it's used by four scenarios﻿. Now when someone asks "Can we change this table structure?" you have a complete picture of the impact.

﻿

### Trace your data flows

﻿Make﻿ Grid helps showcase data flow of the automation you've built using Make﻿. When you click on a dependency, you can view which scenarios﻿ read or write to that dependency.

**What you can do**:

Click on any dependency to see which scenarios﻿ interact with it. View which scenarios﻿ read from or write to that dependency and understand the chain of actions.

**Example:**

In the example below, you can see that the Request Logger scenario﻿ is triggered by a webhook and it writes to a dependency, which is Google Sheets. So when a colleague asks where does the Request Logger scenario﻿ gets its data from, you open Make﻿ Grid to explain the flow.

Click on the Request Logger scenario﻿ to trace the flow: webhook triggers Request Logger → Request Logger writes to Google Sheets → data is now available for you. Due to this data flow, you can see the chain of actions within your solution.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/UWOXklCD6ySnvf8dmb7to-20251210-154953.png?format=webp "Document image")

﻿

﻿

### Find errors in your scenarios

The red flags shown in the image are an indication that your scenarios﻿ have errors and need your attention.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/x3MT0CrDx88fsjLVEq2HX-20251210-162312.png?format=webp "Document image")

﻿

**What you can do**:

You can either click on individual red flags or click the **Need your attention** widget and view all scenarios﻿ with errors at once. This allows you to quickly identify which scenarios are impacted and prioritize your investigation.

**Example:**

In the example below, click the Slack AI Gardener scenario﻿ error for analysis. Click **Check** to view the scenario﻿’s history log and investigate further. These errors are not only displayed in scenarios﻿ but can also alert you to issues with dependencies, such as capacity problems in data stores or queue backlogs in webhooks.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gMuiWNIYixZWCZ8ZP7UjQ-20251211-074054.png?format=webp "Document image")

﻿

﻿

### View your credit consumption

﻿Make﻿ **Grid** helps you understand how credits are consumed across your automations. By using the **Select Layer** feature, you can visualize credit usage, data transfer, and operations consumed over the last 30 days. This helps identify scenarios﻿ that may need optimization.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sAcWb1eMAT0VYPQfroGEe-20251212-130220.png?format=webp "Document image")

﻿

**What you can do:**

Click on the **Credits** layer and zoom in on a scenario﻿ to view its credit usage. Each scenario﻿ is represented by a circle, where the size of the circle indicates the amount of credits consumed - the larger the circle, the higher the credit usage.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ce36WxBL5UhWWYojNaPwN-20251212-125744.png?format=webp "Document image")

﻿

**Example**:

In some cases, you may see higher consumption than what is displayed in your mapped scenario﻿. In the below example, the scenario﻿ shows a total consumption of **17,280** credits. However, reviewing the credits consumed by its dependencies, the total is 8,640+0+0=8640. This discrepancy occurs because Make﻿ Grid does not display the credit consumption by data transformers such as iterators, aggregators, and similar components.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/zb28N0hjGULGC_fez-rhE-20251212-131005.png?format=webp "Document image")

﻿

When you open the scenario﻿, you can see it includes an Array aggregator and an Iterator, which together account for the rest of the credits.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Hz1fm412bxbe4IDRVgcLC-20251212-131609.png?format=webp "Document image")

﻿

### Deprecate a column in your database

﻿Make﻿ Grid helps you safely deprecate part of a data element, such as a column in a database, by showing where it is used across your automations. This visibility helps prevent breaking scenarios﻿ when making changes.

**What you can do**:

Select the dependency and click **Attributes** in the side panel to view all scenarios﻿ mapped to a specific column. You can see which scenarios﻿ reference that attribute and assess the impact before making changes.

**Example**:

In the example below, you want to deprecate a column in an Airtable called Status. Make﻿ Grid gives you an option to view the dependencies that map to this attribute. You can click **Attributes** in the side panel and see that this column is used in two scenarios﻿. You can then open the scenario by clicking the **Open Scenario** pop-out button and edit the dependency in the scenario﻿ editor.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/SESZgtctOFa30Wk7V5sH9-20251212-134242.png?format=webp "Document image")

﻿

### Identify the endpoints of your HTTP modules

﻿Make﻿ Grid helps you quickly identify the service endpoints used by your HTTP apps.

**What you can do**:

Select an HTTP app in the grid and open the **Endpoint** tab in the right-side panel. This shows the service associated with the endpoint.

**Example**:

In the example below, selecting an HTTPapp and opening the **Endpoint** tab displays the service endpoint it connects to. This makes it easy to understand which external service the app communicates with and helps when reviewing, troubleshooting, or documenting your integrations.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/UiwY1qsJtbIY4Sf_8F2xL-20251215-073134.png?format=webp "Document image")

﻿

### View your active scenarios

﻿Make﻿ Grid helps you manage large workspaces by providing a clear view of your automations. But as the number of scenarios﻿ grows, the grid can become crowded, making it harder to navigate and analyze dependencies.

**What you can do**:

In Make﻿ Grid, you can use the **Filters** panel to narrow down the displayed scenarios﻿. For example, select **Active** scenarios﻿ to hide inactive ones and focus only on the scenarios﻿ that are currently running.

**Example**:

In the example below, applying the **Active** scenarios﻿ filter removes all inactive scenarios﻿ from the grid. Once filtered, you can use the **Align** tool to automatically arrange all elements, creating a cleaner and more organized layout.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LM-9zQ3kbiDswAdcjMMPU-20251212-161737.png?format=webp "Document image")

﻿

﻿

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Explore Make Grid GUI](/explore-make-grid-gui "Explore Make Grid GUI")[NEXT

Tutorial: How to replace a dependency](/tutorial-how-to-replace-a-dependency "Tutorial: How to replace a dependency")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
