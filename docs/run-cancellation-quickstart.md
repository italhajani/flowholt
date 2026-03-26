# Run Cancellation Quickstart

FlowHolt now supports cancelling queued/running runs.

## What was added

- API endpoint: `POST /api/runs/{runId}/cancel`
- Runs page cancel button for `queued` and `running` runs
- Runner protection so cancelled runs are not overwritten by late success/failure updates

## 1. Cancel from UI (recommended)

- Open `/app/runs`
- For a `queued` or `running` row, click **Cancel run**

## 2. Cancel via API

```bash
curl -X POST "http://localhost:3000/api/runs/YOUR_RUN_ID/cancel" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"reason":"Cancelled by operator"}'
```

## 3. Confirm result

- Run status becomes `cancelled`
- `error_message` shows cancel reason
- A warning log entry is written: "Run cancelled by user request."
