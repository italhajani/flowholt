# FlowHolt AI Agents, Templates, And Providers UX

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Define how FlowHolt presents AI agents, reusable templates, and provider/model configuration as first-class product domains.

---

## 1. Domain thesis

FlowHolt should treat AI and reusable automation as product categories, not scattered advanced features.

This domain covers:

- managed AI agents
- prompt/runtime evaluation
- reusable templates
- provider and model configuration
- knowledge and tool attachments

---

## 2. AI Agents domain

### Inventory page

Columns or cards should show:

- agent name
- status
- model/provider
- knowledge attachments
- tool access
- owner
- last evaluated
- linked workflows

### Filters

- active/draft
- provider
- evaluation state
- needs credentials
- needs knowledge

### Detail page tabs

1. Overview
2. Instructions
3. Knowledge
4. Tools
5. Evaluation
6. Usage
7. Versions
8. Settings

### Key UI rules

- AI agents have stronger black-accent identity than standard entities
- evaluation is always visible
- provider/model visibility is explicit
- cost and latency are available, not hidden

---

## 3. Agent creation flow

Flow:

1. choose agent type
2. write goal/instructions
3. select provider/model
4. attach tools and connections
5. attach knowledge
6. define guardrails
7. test and save

The flow should feel closer to a product setup wizard than a generic form.

---

## 4. Knowledge attachments

Knowledge surfaces should show:

- source
- freshness
- indexing state
- chunk count
- permissions
- linked agents/workflows

Users must see whether an agent is underpowered because its knowledge is missing, stale, or blocked.

---

## 5. Agent evaluation

This is one of FlowHolt's most important differentiation surfaces.

### Evaluation page must support

- test cases
- expected answers
- side-by-side run comparison
- latency
- token usage
- failure reasons
- safety / policy violations

### Evaluation views

- table view
- transcript view
- diff view

---

## 6. Templates domain

Templates cover both:

- workflow templates
- agent templates

### Gallery structure

- hero/search row
- category filters
- saved filters
- template cards
- install flow

### Template card contents

- name
- category
- use case
- complexity
- required connections
- provider requirements
- install count or recommendation signal

### Template detail

Sections:

1. Overview
2. Required assets
3. Steps included
4. Preview
5. Install options
6. Changelog

Templates should clearly explain what assets and permissions are required before installation.

---

## 7. Providers domain

Providers are not only background configuration. They are operating dependencies.

### Provider inventory

- provider name
- type
- health
- auth mode
- model count or connector count
- last verification
- usage

### Provider detail tabs

1. Overview
2. Authentication
3. Models or capabilities
4. Rate limits
5. Usage
6. Audit

### Provider categories

- AI models
- vector providers
- storage/search providers
- integration platforms

---

## 8. Model directory

Inside provider detail or a dedicated view, FlowHolt should expose:

- model name
- modality
- context window
- latency tier
- cost profile
- availability

This supports better agent and workflow authoring decisions.

---

## 9. Relationship between domains

### Agents use

- providers
- models
- knowledge
- connections
- tools

### Templates may include

- workflows
- agents
- provider assumptions
- required connections

### Providers support

- agents
- AI nodes
- template install requirements

The UI should show these relationships directly rather than forcing the user to infer them.

---

## 10. Studio integration

### Agents in Studio

- agent nodes can reference managed agents
- inline "open agent detail" action
- evaluation summary visible in inspector

### Templates in Studio

- open from template
- add template fragment into current workflow
- preview required assets before install

### Provider visibility in Studio

- model/provider shown in AI node inspector
- warnings when provider access is missing or unhealthy

---

## 11. Competitor takeaways

### From n8n

- evaluation/testing mindset
- direct visibility of AI node internals

### From Make

- stronger inventory and template/product framing
- better sense of reusable business capability

### FlowHolt should improve by

- making AI agents a managed entity, not merely a node type
- linking provider health and cost to design-time decisions
- making templates operationally transparent before install

---

## 12. Exit condition

This domain is complete only when:

- agents, templates, and providers each have clear page models
- evaluation is planned as a core interaction
- links between assets, agents, workflows, and providers are visible in UI
