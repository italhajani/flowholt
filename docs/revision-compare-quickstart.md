# Revision Compare Quickstart

This feature helps you understand a saved workflow change before you restore it.

## What it means

- `Compare` shows what changed between the old workflow version and the newer one.
- It tells you simple things like:
  - how many nodes changed
  - which nodes were added or removed
  - whether settings changed inside existing nodes
  - whether the workflow name or description changed

## How to see it

1. Start your web app in `flowholt-web` with `npm run dev`
2. Open any workflow in Studio
3. In the right sidebar, go to `Revision history`
4. Click `Compare` on any revision
5. You will see a plain-English change summary and a small before-vs-after breakdown

## Why this matters for the final platform

This is one more step away from raw technical workflow editing and one step closer to a premium product where users can understand changes safely before acting.