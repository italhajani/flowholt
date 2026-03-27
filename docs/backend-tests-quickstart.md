# Backend Tests Quickstart

This is the first real backend test layer for FlowHolt.

## What is covered now

- workflow graph validation
- workflow simulation
- revision compare logic
- correlation id helpers
- queue retry and enqueue runtime logic
- scheduler claim timing logic
- scheduler preset pattern logic
- studio graph normalization for saved workflows
- composer preview/apply helper logic
- live run stream helper logic
- event trigger matching logic
- email trigger matching logic

## How to run it

1. Open terminal in `flowholt-web`
2. Run:
   `npm run test:backend`

## Why this matters

These tests protect the core backend logic that powers:

- whether a workflow is considered runnable
- how the flow is simulated before execution
- how revisions are compared in Studio
- how trace ids are generated and preserved
- how queued jobs retry or fail safely
- how schedules decide their next run time
- how daily and weekday presets calculate the next automatic run
- how Studio strips bad placeholder model values before save
- how assistant preview/apply state is summarized and stored
- how live run streaming clamps polling values and formats SSE events
- how event names and event sources match the right workflows safely
- how inbox address and subject filters match the right workflows safely

## Easy meaning

Before this, we were mostly trusting the backend by manual clicking.
Now the core runtime path has a bigger automatic safety net before we touch the heavier integration architecture stage.
