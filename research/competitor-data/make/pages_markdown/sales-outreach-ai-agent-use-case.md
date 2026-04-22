# Sales outreach AI agent use case - Help Center

Source: https://help.make.com/sales-outreach-ai-agent-use-case
Lastmod: 2026-04-08T14:40:13.837Z
Description: Build a sales outreach AI agent: watch Gmail for leads, research companies, qualify them, draft personalized emails, and send to Slack.
Make AI Agents (New)

# Sales outreach AI agent use case

6 min

In this guide, you'll create a sales outreach agent step by step in Make﻿. Your agent will:

1. **Watch your Gmail** for new emails labeled as leads

2. **Analyze the email content** to decide whether the lead is a potential sales opportunity

3. **Research the lead** with web scraping to learn more about the lead company

4. **Qualify the lead** based on the information gathered

5. **Check your calendar availability** for a meeting if the lead qualification score is high

6. **Draft a personalized email** to the lead

7. **Sends the email draft to you** on Slack

## Overview

You'll follow these steps to build your agent:

1. Build your AI agent scenario

2. Add tools

3. Test your AI agent

4. Finish with a Slack module

Once you complete the steps, you'll have a sales outreach agent that you can use or extend further, depending on your goals.

Later, you can tailor this agent to your company guidelines by [adding knowledge](/create-your-first-ai-agent#step-5-add-knowledge)﻿, as shown in the video.

## Prerequisites

You must set up the following before you build your agent:

* A **Gmail account** with a **label for lead emails** called "Leads" or similar

* A **Slack account** with a **private channel** called "Leads" or similar

* **Google Calendar**

Typically, an external system, such as a form or CRM tool, would automatically send lead emails to your Gmail. For now, send yourself a sample email that looks like a typical lead inquiry and apply the "Lead" label.

Additionally, you'll use the instructions below when building your agent. Copy them now so you're ready to give them to your agent in Step 1.

**Instructions**

You are a Lead Qualification Agent that autonomously processes inbound leads, researches companies, and drafts personalized responses with meeting proposals when appropriate.

INPUT FORMAT

You will receive:

* sender\_email: Email address of the lead

* sender\_name: Name of the person who sent the email

* email\_subject: Subject line of the email

* email\_body: Content of the email

* thread\_id: Gmail thread ID for threading

AVAILABLE TOOLS
Research Tools:

* Research Lead information - Research companies and gather intelligence

Meeting Tools:

* Get Free/Busy information - Get user availability for next 7 days

Email Tools:

* Create email draft - Create Gmail draft response
  Input: To, Subject, Body (MUST BE HTML FORMAT)
  CRITICAL: This tool must ALWAYS be called LAST in your workflow

CONTEXT
You should always access your context to retrieve the knowledge of the kind of company we are and services we offer

YOUR WORKFLOW

STEP 1: EXTRACT COMPANY DOMAIN

* Extract the domain from sender\_email (everything after @)

* Identify the company name from the domain

* Extract sender name and relevant context from email\_body

STEP 2: RESEARCH THE COMPANY (MANDATORY)

* Call research\_lead\_information with the company domain

* Gather information about:

* Industry and sector

* Company size (estimated employees/revenue if available)

* Products or services offered

* Recent news, funding, or announcements

* Potential pain points or business challenges

* Technology stack or tools they use (if discoverable)

STEP 3: QUALIFY THE LEAD
Analyze the gathered information and assign a qualification score:

HIGH - If 3 or more apply:

* Company in target industry

* Significant company size or budget indicators

* Recent funding or growth signals

* Clear pain point matching your solution

* Specific inquiry or clear intent in email

MEDIUM - If 2 apply:

* Relevant industry but unclear fit

* Some budget indicators

* General inquiry without specifics

* Limited information available

LOW - If most apply:

* Outside target industry

* Very small company or individual

* Generic or spam-like inquiry

* No clear pain points

* Minimal information available

STEP 4: MEETING WORTHINESS ASSESSMENT

Before proceeding, you must evaluate whether this lead warrants a meeting proposal. Consider:

PROPOSE A MEETING IF:

* Qualification score is HIGH AND

* Clear business opportunity exists (budget signals, specific need, decision-maker contact) AND

* The inquiry is specific and actionable (not just information gathering) AND

* There is explicit or implicit request for discussion/demo/call in the email AND

* Timeline indicators suggest near-term decision making

DO NOT PROPOSE A MEETING IF:

* Qualification score is LOW

* Generic inquiry with no specific needs mentioned

* Information-only request that can be handled via email

* Student, academic, or research inquiry with no commercial intent

* Sender appears to be in early exploration phase with no clear timeline

* Red flags present (competitor research, spam patterns, unclear legitimacy)

* MEDIUM qualification without strong engagement signals

MEETING DECISION FRAMEWORK:
Ask yourself: "Would I personally want to spend 30 minutes on this call based on the information available?"

If YES: Proceed to get availability (Step 5)
If NO: Skip to Step 6 (no meeting proposal)

STEP 5: GET CALENDAR AVAILABILITY (ONLY IF STEP 4 DETERMINED MEETING IS WARRANTED)

Step 5A: Get Calendar Availability

* Call get\_freebusy\_information to retrieve available time slots for next 7 days

* Analyze the returned availability data

* Identify 2-3 available 30-minute slots within business hours (10 AM - 5 PM Berlin timezone)

* Prefer slots in the next 3-5 business days

* Avoid early morning (before 10 AM) or late afternoon (after 4:30 PM) slots

STEP 6: DRAFT PERSONALIZED EMAIL RESPONSE

Prepare a personalized email response that:

* Acknowledges their specific inquiry or context from email\_body

* References specific company research (shows you did homework)

* Addresses potential pain points discovered

* Provides relevant value proposition

* Includes clear call-to-action

* Professional but warm tone

* around 250 words

Email structure:

* Greeting with name

* Thank them and acknowledge their specific inquiry

* 1-2 sentences showing company knowledge

* Brief value proposition relevant to their needs

* Clear next step or call-to-action

* Professional signature

IF MEETING SHOULD BE PROPOSED (based on Step 4 and 5):

* Propose 2-3 specific available time slots from the calendar availability

* Format: "I have availability on [Day, Date] at [Time] or [Day, Date] at [Time]. Would either of these work for you?"

* Frame it as a helpful suggestion for discussion

* Keep tone flexible and accommodating

IF NO MEETING SHOULD BE PROPOSED:

* Provide helpful information or resources

* Offer to schedule a call if they want to discuss further

* Keep door open for future engagement

STEP 7: CREATE EMAIL DRAFT

* Call create\_email\_draft with:

* To: sender\_email

* Subject: Re: [original email\_subject]

* Body: Your drafted response in HTML format (including meeting time proposals if warranted)

CRITICAL: create\_email\_draft must be called for EVERY lead

HTML EMAIL FORMATTING REQUIREMENTS

When creating email drafts, format the body content in HTML with proper structure:

Basic structure:

Hi [Name],

[First paragraph content]

[Second paragraph content]

[Closing paragraph with call-to-action]

Best regards,
[Your name]
[Your title]

HTML formatting guidelines:

* Wrap all content in and tags

* Use inline CSS for styling (font-family, font-size, color, line-height)

* Use tags for paragraphs with proper spacing

* Use
  for line breaks within paragraphs

* Use for emphasis if needed

* Keep styling professional and clean

* Ensure proper closing tags for all elements

IMPORTANT NOTES

* This is a fully autonomous workflow - execute all steps without any user interaction

* ALWAYS research the company before making any decisions

* Apply critical thinking in Step 4 - not every lead deserves a meeting proposal

* Base all decisions on objective criteria and available information

* Keep email drafts personalized - avoid generic templates

* When proposing meeting times, provide 2-3 specific options from available slots

* Format meeting time proposals clearly with day, date, and time

* CRITICAL: Email body content MUST always be in HTML format

* CRITICAL: create\_email\_draft must ALWAYS be called for every lead

* Reference specific details from the original email in your response draft

* Work completely autonomously - no confirmations or user interactions needed

## Step 1. Build your AI agent scenario

To start building, sign in to Make﻿ and click **Create scenario** at the top.

### Add a Gmail trigger

The **Gmail** > **Watch emails** module triggers the scenario﻿ where your agent lives. It monitors your inbox for new emails and sends them to the agent to process further.

To add the **Gmail** > **Watch emails** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search **Gmail**, and select **Watch emails**.

3

Click the module to open its settings.

4

In **Connection**, select an existing Gmail connection from the dropdown or click **Add** to create a new one.

5

In **Filter type**, select **Simple filter**.

6

In **Folder**, select **All mail**.

7

In **Label**, select the label you set up in Gmail for lead emails, such as **Leads**.

8

In **Criteria**, select **All messages**.

9

In **Limit**, specify the number of emails to return in each run, such as 5 or 10.

10

In **Content format**, select **Full content**.

11

Click **Save**.

12

In thedialog, select the point in time from which to process your inbox data. For example, to process only new emails from now on, select **From now on**.

Once you test this scenario﻿, you can choose when to start processing inbox data at any time. Right-click the **Gmail** > **Watch email** and select **Choose where to start.**

13

Click the clock icon on the module to schedule the scenario﻿.

14

In **Schedule settings**, specify how often your scenario﻿ runs, for example, every day at 9:00.

15

Click **Save** on the Scenario﻿ toolbar.

16

Click **Run once** on the Scenario﻿ toolbar to retrieve email data that you'll map this data in later modules.

You've now added the **Gmail** > **Watch emails** module to your AI agent scenario﻿.

### Add a Make AI Agents (New) module

Next, add the **Make AI Agents (New)** > **Run an agent (New)** module to your scenario﻿:

1

Click the plus icon next to the **Gmail** > **Watch emails** module.

2

Search for **Make AI Agents (New)** and click **Run an agent (New)**.

3

In the **Run an agent (New)** module settings, in **Connection**, select an existing AI provider connection from the dropdown. Alternatively, click **Add** to create a new one.

4

In **Model**, select a model.

5

In **Instructions**, add the copied instructions from prerequisites to this field.

6

In **Input**, copy the below input items and add them to the field. These items are email data you want the agent to work on.

*sender\_email: "{{1.fromEmail}}"
sender\_name: "{{1.fromName}}"
email\_subject: "{{1.subject}}"
email\_date: "{{1.internalDate}}"
email\_body: "{{1.fullTextBody}}"
thread\_id: "{{1.threadId}}"*

7

Replace the placeholders between the quotation marks: map the output values from the **Gmail** > **Watch emails** module that correspond to each input item.

Once done, the **Inputs** field looks like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Jkyjqi7puCOoKDElRPltL-20260128-103123.png?format=webp "Document image")

﻿

8

Toggle **Advanced settings**.

9

In **Response format**, select **Data structure** from the dropdown.

10

In **Response structure**, click **Add item**.

11

In **Name**, enter "draft\_mail\_id."

12

In **Label**, enter "Mail ID."

13

In **Description**, copy the following instructions and add them to the field. They tell the agent to take the draft email id.

*After creating the draft mail, you'll get back a JSON like:
{
"draftId": "r7956931764211347721",
"id": "19b46f571debca3f",
"threadId": "19b46f571debca3f",
"labelIds": [
"DRAFT"
],
"sysFolders": [
{
"id": "DRAFT",
"name": "Draft"
}
]
}
Pass here the "id" item of the JSON. In the example is "19b46f571debca3f"*

14

Click **Save**.

15

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Make AI Agents (New)** > **Run an agent (New)** module to your scenario﻿. You'll finish the scenario﻿ with a **Slack** module in a later step.

## Step 2. Add tools

Your sales outreach agent uses three modules as tools:

* **Google Calendar** > **Get Free/Busy Information**: Checks your calendar for your meeting availability

* **Make AI Web Search** > **Generate a response**: Researches the company associated with the lead email address

* **Gmail** > **Create a draft email**: Creates an email draft based on the content of the lead email

### Add a Google Calendar module

To add the **Google Calendar** > **Get Free/Busy Information** module to your agent:

1

Hover over the plus icon on the **Run an agent (New)** module and click **Add tool**.

2

In the app search, search for and click **Google Calendar**.

3

Select the **Get Free/Busy Information** module.

4

In the **Connection** dropdown, select an existing Google connection or create an new one.

5

In **Time Range From**, map the Date value from the **Gmail** > **Watch emails** module. This tells the agent to search your calendar for free slots after the email sent date.

6

In **Time Range To**, select **Let AI Agent decide**. Optionally, click **Add details** and specify your preferred time range, for example, "Within one month after the date."

7

In **Calendars**, select **Let AI Agent decide**.

8

Click **Save**.

9

Click **Save** on the Scenario﻿ toolbar.

You've now added a **Google Calendar** > **Get Free/Busy Information module** to your agent.

### Add a Make AI Web Search module

To add the **Make AI Web Search** > **Generate a response** module to your agent:

1

Hover over the plus icon on the **Run an agent (New)** module and click **Add tool**.

2

In the app search, search for and click **Make AI Web Search**.

3

Select the **Generate a response** module.

4

In **Text**, copy the following instructions and add them to the field.

*Research the company associated with the domain for the mail "{{1.fromEmail}}"
Gather comprehensive lead qualification information including:
COMPANY BASICS
- Official company name
- Industry and sector
- Company size (number of employees, revenue if available)
- Headquarters location
- Website and online presence
BUSINESS INTELLIGENCE
- Core products or services offered
- Business model (B2B, B2C, SaaS, etc.)
- Target market and customer base
- Key differentiators or unique value propositions
RECENT ACTIVITY
- Recent news, press releases, or announcements from the last 6 months
- Funding rounds, acquisitions, or partnerships
- Product launches or major updates
- Leadership changes or company milestones
SIGNALS AND INDICATORS
- Growth signals (hiring, expansion, new offices)
- Technology stack or tools they use (if discoverable)
- Pain points or challenges mentioned in recent content
- Budget indicators or financial health signals
COMPETITIVE CONTEXT
- Main competitors in their space
- Market position or reputation
- Any awards, recognition, or notable achievements
Focus on recent and relevant information that would help qualify this lead and personalize outreach. Prioritize facts over speculation.*

5

Replace the {{1.fromEmail}}placeholder between the quotation marks: map the From (email)output value from the **Gmail** > **Watch emails** module.

Once done, the **Text** field looks like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/0Q3r3n_tioUbSO4Aycooo-20260128-145403.png?format=webp "Document image")

﻿

6

Click **Save**.

7

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Make AI Web Search** > **Generate a response** module to your agent.

### Add a Gmail module

To add the **Gmail** > **Create a draft email** module to your agent:

1

Hover over the plus icon on the **Run an agent (New)** module and click **Add tool**.

2

In the app search, search for and click **Gmail**.

3

Select the **Create a draft email** module.

4

In the **Connection** dropdown, select an existing Google connection or create an new one.

5

In **To**, map the output value from the **Gmail** > **Watch emails** module that corresponds to the sender address: From (email).

6

In **Subject** and **Content** fields, select **Let AI Agent decide**.

7

Click **Save**.

8

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Gmail** > **Create a draft email** module to your agent. Next, test how well the agent works so far.

## Step 3. Test your AI agent

Now that you've added tools to your agent, run your scenario﻿ to test its performance.

To test your agent:

1

Next to **Run once** on the Scenario﻿ toolbar, click the downward arrow.

2

In the **Scenario run dropdown**, select a previous successful scenario﻿ run to use its email data as test data.

3

Click the output bubble of the **Run an agent (New)** module.

4

Go to the **Reasoning** tab to view the tools called and whether they were successful or returned errors.

5

If any tools returned errors, click their output bubbles to view outputs and identify the issue.

6

If needed, go back and change any relevant module settings.

7

Run the scenario﻿ again with steps 1-2 until it runs without errors.

You've now tested your agent so it performs as expected. Next, finish with a **Slack** > **Send a Message** module.

## Step 4. Finish with a Slack module

To finish your AI agent scenario﻿ , add a **Slack** > **Send a Message** module that sends the link to the email draft to your private Slack channel for leads.

To add the **Slack** > **Send a Message** module:

1

Click the plus icon next to **Make AI Agents (New)** > **Run an agent (New)** module.

2

In the app search, search for and click **Slack**.

3

Select the **Send a message** module.

4

In **Connection**, select an existing user Slack connection or create an existing one.

5

In **Channel type**, select **Private channel**.

6

Select the private Slack channel that you created for leads.

7

In **Text**, copy the following instructions and add it to the field. This text includes a link to the email draft.

*New Lead draft mail from {{1.fromEmail}}
🔗 <*[*https://mail.google.com/mail/u/0/#drafts?compose*](https://mail.google.com/mail/u/0/#drafts?compose "https://mail.google.com/mail/u/0/#drafts?compose")*= {{2.jsonResponse}} View drafted answer>*

8

Replace the placeholders between the quotation marks:

* {{1.fromEmail}}: Map the From (email) output value from the **Gmail** > **Watch emails** module.

* {{2.jsonResponse}}: Map the JSON response output value from the **Make AI Agents (New)** > **Run an agent (New)** module.

Once done, the **Text** field looks like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/tzfueV_rqiBbcZZ0f6vZr-20260128-162745.png?format=webp "Document image")

﻿

9

Click **Save**.

10

Click **Save** on the Scenario﻿ toolbar.

11

Click **Run once** to check whether you receive the message in your lead Slack channel.

You've now added a **Slack** > **Send a message** module to your scenario﻿.

You've now created a sales outreach agent that helps you qualify and contact leads.

Next, to build agents just like this one with pre-built templates, see [Make AI agents library](https://www.make.com/en/ai-agents-library "Make AI agents library").

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Create your first AI agent](/create-your-first-ai-agent "Create your first AI agent")[NEXT

Create AI agents for different triggers](/create-ai-agents-for-different-triggers "Create AI agents for different triggers")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
