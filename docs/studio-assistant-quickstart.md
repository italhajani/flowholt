# Studio Assistant Quickstart

FlowHolt Studio now includes a first premium assistant layer directly inside the editor.

## What is new

Inside Studio, you can now:
- write a plain-language change request
- click `Preview proposal`
- review reasoning, validation, and planned changes
- click `Apply to workflow`
- restore older revisions
- undo the latest change

## How to use it

1. Open any workflow in Studio.
2. Look at the right sidebar card named `Assistant composer`.
3. Type something simple like:
   - `add a reviewer step before final output`
   - `make the false branch clearer`
   - `turn this into a lead qualification workflow`
4. Click `Preview proposal`.
5. Read the `Proposal review` card.
6. If it looks good, click `Apply to workflow`.

## What you will see

- assistant reasoning
- change summary
- validation status
- revision history
- one-click restore
- undo last change

## Why this matters

This is the beginning of the final premium workflow-building experience:
- user talks in plain language
- AI proposes the flow change
- user reviews it clearly
- user applies or restores without touching JSON

## Related backend already powering this UI

- composer API
- workflow revisions API
- restore API
- workflow chat thread storage
