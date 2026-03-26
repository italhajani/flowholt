# Studio Assistant Sidebar Quickstart

This is the easier premium-style workflow editing experience inside Studio.

## What it does

- Lets you type workflow changes in plain English.
- Stores your chat conversation in workflow threads.
- Shows the assistant reasoning timeline before you apply changes.
- Shows planned node changes, revision history, and recent assistant activity.

## How to see it in the UI

1. Start `flowholt-web` with `npm run dev`.
2. Open any workflow in Studio at `/app/studio/{workflowId}`.
3. On the right side, use the `Assistant sidebar`.
4. Type a request like `add a reviewer step before final output`.
5. Click `Preview proposal` first.
6. If it looks good, click `Apply to workflow`.

## What the sections mean

- `Conversation`: your requests and assistant replies.
- `Reasoning timeline`: why the assistant wants to change the flow.
- `Planned changes`: which nodes/branches will be added or updated.
- `Revision history`: restore older workflow versions.
- `Assistant activity`: recent preview/apply actions.

## Simple mental model

- Conversation = what you asked.
- Reasoning = how FlowHolt interpreted it.
- Planned changes = what will happen to the flow.
- Apply = save those changes into the workflow.
