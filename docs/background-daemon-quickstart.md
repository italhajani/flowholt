# Background Daemon Quickstart

FlowHolt now has a separate background daemon path for schedules and queued jobs.

## What this means

Before this step:
- Studio clicks or API calls could queue work.
- But a premium platform still needs a process that keeps checking for due schedules and queued jobs.

After this step:
- a daemon process can keep polling the scheduler endpoint
- a daemon process can keep draining queued run jobs
- this makes the platform feel much closer to a real automation backend

## Files added

- `flowholt-web/scripts/flowholt-daemon.mjs`
- new npm scripts in `flowholt-web/package.json`

## Required env values

Put these in `flowholt-web/.env.local`:

```env
FLOWHOLT_APP_URL=http://localhost:3000
FLOWHOLT_SCHEDULER_KEY=your-long-random-secret
FLOWHOLT_WORKER_KEY=your-other-long-random-secret
FLOWHOLT_SCHEDULER_POLL_MS=30000
FLOWHOLT_WORKER_POLL_MS=5000
FLOWHOLT_WORKER_MAX_JOBS=5
```

## How to run it

Open a new terminal in `flowholt-web`.

Run both scheduler and worker together:

```bash
npm run daemon
```

Run only the worker:

```bash
npm run daemon:worker
```

Run only the scheduler:

```bash
npm run daemon:scheduler
```

## Simple mental model

- scheduler daemon = checks which workflow schedules are due
- worker daemon = processes queued workflow jobs
- Studio and APIs = create/edit workflows and queue new work
- Runs page = shows you the result in the UI

## How to see it working

1. Start `flowholt-web` normally with `npm run dev`.
2. In a second terminal, start the daemon with `npm run daemon`.
3. Open Studio and create a schedule in the `Schedule builder`.
4. Wait for the next due time.
5. Open `/app/runs` and you should start seeing new runs created automatically.
6. Open a run and confirm `trigger_source = schedule`.

## Local development note

This daemon talks to your local Next.js app over HTTP.
That is okay for local development and early self-hosting.
Later, if needed, we can upgrade this into a more isolated runtime service.
