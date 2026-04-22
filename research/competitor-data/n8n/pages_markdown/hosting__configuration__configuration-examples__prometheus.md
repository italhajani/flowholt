# Enable Prometheus metrics | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/configuration-examples/prometheus
Lastmod: 2026-04-14
Description: Enable Prometheus metrics endpoint.
# Enable Prometheus metrics[#](#enable-prometheus-metrics "Permanent link")

To collect and expose metrics, n8n uses the [prom-client](https://www.npmjs.com/package/prom-client) library.

The `/metrics` endpoint is disabled by default, but it's possible to enable it using the `N8N_METRICS` environment variable.

|  |  |
| --- | --- |
| ``` 1 ``` | ``` export N8N_METRICS=true ``` |

Refer to the respective [Environment Variables](../../environment-variables/endpoints/) (`N8N_METRICS_INCLUDE_*`) for configuring which metrics and labels should get exposed.

Both `main` and `worker` instances are able to expose metrics.

## Queue metrics[#](#queue-metrics "Permanent link")

To enable queue metrics, set the `N8N_METRICS_INCLUDE_QUEUE_METRICS` env var to `true`. You can adjust the refresh rate with `N8N_METRICS_QUEUE_METRICS_INTERVAL`.

n8n gathers these metrics from Bull and exposes them on the main instances. On multi-main setups, when aggregating queries, you can identify the leader using the `instance_role_leader` gauge, set to `1` for the leader main and `0` otherwise.

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 ``` | ``` # HELP n8n_scaling_mode_queue_jobs_active Current number of jobs being processed across all workers in scaling mode. # TYPE n8n_scaling_mode_queue_jobs_active gauge n8n_scaling_mode_queue_jobs_active 0  # HELP n8n_scaling_mode_queue_jobs_completed Total number of jobs completed across all workers in scaling mode since instance start. # TYPE n8n_scaling_mode_queue_jobs_completed counter n8n_scaling_mode_queue_jobs_completed 0  # HELP n8n_scaling_mode_queue_jobs_failed Total number of jobs failed across all workers in scaling mode since instance start. # TYPE n8n_scaling_mode_queue_jobs_failed counter n8n_scaling_mode_queue_jobs_failed 0  # HELP n8n_scaling_mode_queue_jobs_waiting Current number of enqueued jobs waiting for pickup in scaling mode. # TYPE n8n_scaling_mode_queue_jobs_waiting gauge n8n_scaling_mode_queue_jobs_waiting 0 ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
