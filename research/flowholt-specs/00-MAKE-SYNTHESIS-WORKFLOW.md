# Make To FlowHolt Synthesis Workflow

This file defines how the scraped `help.make.com` corpus will be used.

## Principle

We will not load the full Make corpus into a single prompt. The corpus is too large and too mixed in quality. Instead, we will use it as a structured research base.

## How the corpus will be used

For each planning topic, we will:

1. Pull the relevant Make domain pages.
2. Extract repeated patterns, controls, rules, and maturity signals.
3. Compare those patterns against FlowHolt's current repo and UI direction.
4. Convert the comparison into explicit planning decisions.
5. Record those decisions in the final FlowHolt planning artifacts.

## Synthesis pipeline

### Step 1. Domain indexing

The scraped Make help center is grouped into planning domains:
- tenancy and identity
- scenario builder and authoring
- data and mapping
- integrations, connections, and webhooks
- runtime, executions, and observability
- AI agents and MCP
- templates and reuse
- billing, usage, and analytics
- alternate views such as Make Grid
- release-note evidence for product evolution

### Step 2. Reference extraction

For each domain, we will extract:
- product objects
- page and nav surfaces
- settings and toggles
- user actions
- scope and permission rules
- runtime behaviors
- backend implications

### Step 3. FlowHolt comparison

Each extracted pattern will be translated into:
- current FlowHolt equivalent
- maturity gap
- keep, adapt, or reject decision
- desired FlowHolt implementation direction

### Step 4. Planning output

The output will not be "Make copy". It will be:
- Make-backed maturity patterns
- adapted for FlowHolt
- biased where useful toward n8n-like agent logic later
- reorganized into a stronger FlowHolt product model

## Core comparison rule

Every Make finding must be evaluated through this lens:

`Make reference -> Why it feels mature -> FlowHolt current state -> Better FlowHolt design`

## What we are planning toward

The final FlowHolt plan should be detailed enough to answer:
- what pages exist
- what belongs in each page
- what every important panel and tab contains
- what every major settings group contains
- what scopes and roles exist
- how workflows, agents, tools, knowledge, credentials, templates, and environments relate
- how the backend must support the product model

## How n8n will fit later

After Make synthesis, we will run the same process for n8n.

Then we will create:
- a Make-driven maturity plan
- an n8n-driven logic and agent-pattern plan
- a final merged FlowHolt ultimate plan that uses both references without copying either one blindly
