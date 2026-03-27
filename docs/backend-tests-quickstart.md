# Backend Tests Quickstart

This is the first real backend test layer for FlowHolt.

## What is covered now

- workflow graph validation
- workflow simulation
- revision compare logic
- correlation id helpers

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

## Easy meaning

Before this, we were mostly trusting the backend by manual clicking.
Now we have the first automatic safety net.
