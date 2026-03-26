# Live Backend Features Quickstart

These are the newest backend-backed features you can already see in the app UI.

## 1. Live run monitor

What it means:
- When a workflow run starts, FlowHolt now streams status and logs to a dedicated live page.
- This is the beginning of the premium "watch my automation work" experience.

How to see it:
1. Start your local app.
2. Open a workflow in Studio.
3. Click `Run workflow`.
4. Open `Runs`.
5. Click `Live monitor` on that run.

What you should see:
- current status (`queued`, `running`, `succeeded`, `failed`, `cancelled`)
- latest streamed log messages
- started/finished timestamps

## 2. Flow preview in Studio

What it means:
- Studio now summarizes the current workflow in plain language.
- It shows whether the graph looks runnable, how many possible paths it has, and the expected execution order.

How to see it:
1. Open any workflow in Studio.
2. Look at the right sidebar card called `Flow preview`.

What you should see:
- validation score
- start nodes and end nodes
- execution order
- important issues or warnings

## 3. Integration connection test

What it means:
- You can now check whether saved credentials/configs are actually reachable before using them in workflows.
- This avoids guessing whether a Groq, HTTP, or webhook connection is valid.

How to see it:
1. Open `Integrations`.
2. Save a connection if you do not already have one.
3. Click `Test connection` on that saved connection.

What you should see:
- pass, warning, or fail feedback
- a simple message saying what worked or what is missing

## 4. API endpoints added in this batch

- `POST /api/integrations/{connectionId}/test`
- `GET /api/workflows/{workflowId}/simulate`
- `POST /api/workflows/{workflowId}/simulate`
- `GET /api/runs/{runId}/stream`

## What this unlocks next

These features prepare the platform for the final premium experience:
- rich timeline-style run monitor
- sidebar reasoning and thinking feed
- button-based composer actions instead of raw JSON/manual API calls
- form-based node configuration instead of technical config editing
