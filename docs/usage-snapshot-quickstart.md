# Usage Snapshot Quickstart

FlowHolt now shows a simple usage layer in the dashboard.

## What it shows

- total recent workflow runs
- success rate
- active schedules
- runs in the last 7 days
- token estimate in the last 7 days
- queued jobs right now
- failed runs in the last 7 days

## Why this matters

This is the early base for:
- billing later
- workspace limits later
- capacity planning later
- operations visibility right now

## How to see it

1. Start `flowholt-web` with `npm run dev`.
2. Open `/app/dashboard`.
3. Look at the top stat cards.
4. Look at the new `Usage pulse` card.

## Simple mental model

- stat cards = quick numbers
- usage pulse = operational health
- later we can grow this into billing, quotas, and team reporting
