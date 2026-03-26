const args = new Set(process.argv.slice(2));

const wantsWorker = args.has("--worker") || args.has("--all") || args.size === 0;
const wantsScheduler = args.has("--scheduler") || args.has("--all") || args.size === 0;

const appUrl = (process.env.FLOWHOLT_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const schedulerKey = (process.env.FLOWHOLT_SCHEDULER_KEY || "").trim();
const workerKey = (process.env.FLOWHOLT_WORKER_KEY || schedulerKey || "").trim();
const workerPollMs = parsePositiveInt(process.env.FLOWHOLT_WORKER_POLL_MS, 5000, 1000, 300000);
const schedulerPollMs = parsePositiveInt(process.env.FLOWHOLT_SCHEDULER_POLL_MS, 30000, 5000, 600000);
const workerMaxJobs = parsePositiveInt(process.env.FLOWHOLT_WORKER_MAX_JOBS, 5, 1, 25);

let keepRunning = true;

function parsePositiveInt(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function log(label, message, payload) {
  const timestamp = new Date().toISOString();
  if (payload !== undefined) {
    console.log(`[${timestamp}] [${label}] ${message}`, payload);
    return;
  }

  console.log(`[${timestamp}] [${label}] ${message}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJson(path, options) {
  const response = await fetch(`${appUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

async function runWorkerTick() {
  if (!workerKey) {
    throw new Error("FLOWHOLT_WORKER_KEY is missing.");
  }

  const result = await postJson("/api/queue/worker", {
    headers: {
      "x-flowholt-worker-key": workerKey,
    },
    body: {
      maxJobs: workerMaxJobs,
    },
  });

  if (!result.ok) {
    throw new Error(`Worker request failed with ${result.status}: ${JSON.stringify(result.payload)}`);
  }

  const processed = Number(result.payload.processed) || 0;
  if (processed > 0) {
    log("worker", `Processed ${processed} queued job(s).`, result.payload.results || []);
  } else {
    log("worker", "No queued jobs right now.");
  }
}

async function runSchedulerTick() {
  if (!schedulerKey) {
    throw new Error("FLOWHOLT_SCHEDULER_KEY is missing.");
  }

  const result = await postJson("/api/scheduler/tick", {
    headers: {
      "x-flowholt-scheduler-key": schedulerKey,
    },
    body: {},
  });

  if (!result.ok) {
    throw new Error(`Scheduler request failed with ${result.status}: ${JSON.stringify(result.payload)}`);
  }

  const processed = Number(result.payload.processed) || 0;
  if (processed > 0) {
    log("scheduler", `Claimed ${processed} due schedule(s).`, result.payload.results || []);
  } else {
    log("scheduler", result.payload.message || "No due schedules right now.");
  }
}

async function loop(label, everyMs, runner) {
  log(label, `Started background loop. Polling every ${everyMs} ms against ${appUrl}.`);

  while (keepRunning) {
    const startedAt = Date.now();

    try {
      await runner();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected daemon error.";
      log(label, message);
    }

    const elapsed = Date.now() - startedAt;
    const sleepFor = Math.max(0, everyMs - elapsed);
    if (!keepRunning) {
      break;
    }
    await wait(sleepFor);
  }

  log(label, "Stopped background loop.");
}

async function main() {
  if (!wantsWorker && !wantsScheduler) {
    throw new Error("Use --worker, --scheduler, or --all.");
  }

  if (wantsWorker && !workerKey) {
    throw new Error("FLOWHOLT_WORKER_KEY is required for worker mode.");
  }

  if (wantsScheduler && !schedulerKey) {
    throw new Error("FLOWHOLT_SCHEDULER_KEY is required for scheduler mode.");
  }

  const loops = [];

  if (wantsWorker) {
    loops.push(loop("worker", workerPollMs, runWorkerTick));
  }

  if (wantsScheduler) {
    loops.push(loop("scheduler", schedulerPollMs, runSchedulerTick));
  }

  await Promise.all(loops);
}

function shutdown(signal) {
  log("daemon", `Received ${signal}. Shutting down...`);
  keepRunning = false;
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unable to start daemon.";
  console.error(`[daemon] ${message}`);
  process.exitCode = 1;
});
