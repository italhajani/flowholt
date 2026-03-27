# Agent Tool Access Quickstart

This is the next architecture step after connection-aware tool contracts.

FlowHolt agent nodes can now carry explicit tool access rules.

## What changed

Each agent node can now say:

- `Workspace default`
- `All tools`
- `Selected tools only`
- `No tools`

When `Selected tools only` is chosen, the workflow stores which preset keys that agent is allowed to use later.

## Why this matters

Right now FlowHolt agents and tools are still mostly separate workflow steps.

But for the final premium platform, some agents will reason, choose tools, and act more dynamically.

This permission layer is the groundwork that will stop those future agents from having unlimited tool access by accident.

## How to see it

1. Restart `flowholt-web`.
2. Open any workflow in Studio.
3. Click an `Agent` node.
4. Look for `Tool access`.
5. Try `Selected tools only` and tick a few presets.
6. Save the workflow.

## What it means in easy words

Before:
- the workflow did not clearly say what tools an agent should be allowed to use later

Now:
- the workflow stores that rule directly on the agent step
- Studio shows that rule in a beginner-friendly way
- the backend normalizes that config so later orchestration can trust it
