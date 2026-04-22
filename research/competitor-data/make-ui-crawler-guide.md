# Make UI Crawler Guide

## What It Does

The crawler opens the Make.com scenario editor in a real Chrome session, explores visible interactive UI, and saves:

- screenshots
- DOM summaries
- overlay and dialog inventories
- discovered transitions
- interesting API and websocket traffic
- replayable paths for reopened states

## Before You Run It

1. Open Chrome normally.
2. Log into Make.com.
3. Open the exact scenario editor page you want to inspect.
4. Note the URL.
5. Note the Chrome profile name.

To find the profile name, open `chrome://version` and check the profile path.
Typical names are `Default`, `Profile 1`, `Profile 2`.

6. Close Chrome completely before starting the crawler.

## First Crawl

Run this from the project root:

```powershell
npm run explore:make-editor -- --url "https://us1.make.com/NNNN/scenarios/NNN/edit" --clone-from-chrome-profile "Profile 2"
```

Useful tuning flags:

```powershell
npm run explore:make-editor -- --url "https://us1.make.com/NNNN/scenarios/NNN/edit" --clone-from-chrome-profile "Profile 2" --max-depth 3 --max-interactions 180 --max-elements-per-state 35
```

## Output

The crawler writes to:

```text
research/make-ui-exploration/
```

The main files are:

- `EXPLORATION-REPORT.md`
- `catalog.json`
- `transitions.json`
- `replay-paths.json`
- `network-summary.json`
- `network-log.json`
- `websocket-log.json`
- `ui-taxonomy-aggregate.json`

## Reopen a Discovered Hidden State

Every visited state gets its own `replay-path.json`.

You can also use the global index:

```text
research/make-ui-exploration/replay-paths.json
```

Pick one path file, then replay it:

```powershell
npm run explore:make-editor -- --url "https://us1.make.com/NNNN/scenarios/NNN/edit" --clone-from-chrome-profile "Profile 2" --replay-path "research/make-ui-exploration/01-root-exploration/0007-some-panel/replay-path.json" --replay-only
```

That will reopen the saved UI path and stop after capturing the final replayed state.

## Replay Then Keep Exploring

If you want to reopen a hidden panel or dialog and then continue crawling from there:

```powershell
npm run explore:make-editor -- --url "https://us1.make.com/NNNN/scenarios/NNN/edit" --clone-from-chrome-profile "Profile 2" --replay-path "research/make-ui-exploration/01-root-exploration/0007-some-panel/replay-path.json" --max-depth 2 --max-interactions 120
```

## Recommended Workflow

1. Run a broad crawl first.
2. Open `replay-paths.json`.
3. Identify states with overlays, inspector panels, menus, or lots of new elements.
4. Replay one of those paths with `--replay-only` to verify it is stable.
5. Replay that same path again without `--replay-only` to continue digging deeper from that state.

## Practical Tips

- Start with a stable scenario that you do not mind inspecting heavily.
- Avoid editing module fields manually while the crawler is running.
- If Make shows unusual popups or onboarding banners, dismiss them first before starting the crawl.
- If a replay path stops matching reliably, rerun a fresh crawl and use the newer replay path from the updated output.
