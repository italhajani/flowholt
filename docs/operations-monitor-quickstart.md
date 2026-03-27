# Operations Monitor Quickstart

This page is the first real backend monitoring view for FlowHolt.

## What it shows

- queue depth
- processing jobs
- stuck runs
- stuck jobs
- success rate in the last 24 hours
- failed runs in the last 24 hours
- average run duration
- average node duration
- busiest rate-limited endpoints
- top failing nodes
- recent audit activity

## How to see it

1. Restart `flowholt-web`
2. Open `/app/monitoring`
3. Also open `/app/dashboard` and use the new `Open operations monitor` shortcut

## Easy meaning

- if `queue depth` keeps growing, background work is falling behind
- if `stuck runs` or `stuck jobs` is not zero, something needs attention
- if one node keeps failing, that workflow step is the real problem area
